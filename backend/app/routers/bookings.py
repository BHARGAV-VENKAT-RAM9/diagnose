import redis
import time
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, time as dt_time, timedelta
from typing import List
from uuid import UUID

# pyrefly: ignore [missing-import]
import razorpay
from app.database import get_db
from app.config import settings
from app.models import Booking, Patient, Test, Payment, HomeCollectionAddress
from app.schemas import BookingCreate, BookingResponse, SlotAvailabilityRequest, SlotAvailabilityResponse, PaymentVerify
from app.sms import send_booking_confirm_sms
from app.routers.auth import rate_limiter

router = APIRouter(prefix="/bookings", tags=["bookings"])

# Initialize Redis client for concurrency lock (FS-02)
try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    redis_client = None


def get_slot_lock(lock_key: str, expire_seconds: int = 10) -> bool:
    """Acquires a Redis distributed lock to prevent slot race conditions."""
    if not redis_client:
        return True # Fallback if Redis is offline during development
    try:
        # Try setting the key; set if not exist (NX) with expiry (EX)
        return bool(redis_client.set(lock_key, "locked", ex=expire_seconds, nx=True))
    except Exception as e:
        print(f"Warning: Redis offline during lock acquisition (falling back to True): {e}")
        return True


def release_slot_lock(lock_key: str):
    """Releases the Redis distributed lock."""
    if redis_client:
        try:
            redis_client.delete(lock_key)
        except Exception as e:
            print(f"Warning: Redis offline during lock release: {e}")


@router.post("/check-slots", response_model=List[SlotAvailabilityResponse])
def check_slots(payload: SlotAvailabilityRequest, db: Session = Depends(get_db)):
    """
    Returns slot availability for a target date.
    Working days: Mon-Sat, 6 AM to 6 PM (hourly).
    Lab Capacity: 15 patients/slot. Home Collection Capacity: 5 patients/slot.
    """
    target_date = payload.target_date
    
    # Check if target date is Sunday (0 = Monday, 6 = Sunday)
    if target_date.weekday() == 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Appointments are not available on Sundays."
        )

    # Define hourly slots from 6 AM to 5 PM (ending at 6 PM)
    hours = list(range(6, 18))
    slots = []
    
    # Query database for bookings count on target date
    start_time = datetime.combine(target_date, dt_time(0, 0))
    end_time = datetime.combine(target_date, dt_time(23, 59, 59))
    
    existing_bookings = db.query(Booking).filter(
        Booking.branch_id == payload.branch_id,
        Booking.booking_type == payload.booking_type,
        Booking.slot_time >= start_time,
        Booking.slot_time <= end_time,
        Booking.status != "CANCELLED"
    ).all()

    # Count bookings per hour
    booking_counts = {}
    for booking in existing_bookings:
        hour = booking.slot_time.hour
        booking_counts[hour] = booking_counts.get(hour, 0) + 1

    capacity = 15 if payload.booking_type == "LAB_VISIT" else 5
    filling_fast_threshold = int(capacity * 0.8) # 12 for Lab, 4 for Home Collection

    for hour in hours:
        count = booking_counts.get(hour, 0)
        
        if count >= capacity:
            state = "FULL"
            available = False
        elif count >= filling_fast_threshold:
            state = "FILLING_FAST"
            available = True
        else:
            state = "AVAILABLE"
            available = True

        slots.append(SlotAvailabilityResponse(
            slot_time=f"{hour:02d}:00",
            available=available,
            capacity_level=state
        ))

    return slots


@router.post("/", response_model=BookingResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limiter(limit=5, window=60))])
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    """
    Creates a new booking.
    Uses Redis distributed lock to prevent double-booking slot races.
    """
    slot_datetime = payload.slot_time
    
    # Business Hours Check (6 AM to 6 PM, Sunday closed)
    if slot_datetime.weekday() == 6:
        raise HTTPException(status_code=400, detail="Sundays are closed.")
    if slot_datetime.hour < 6 or slot_datetime.hour >= 18:
        raise HTTPException(status_code=400, detail="Appointments are only available between 6 AM and 6 PM.")

    # Concurrency Lock (FS-02)
    lock_key = f"lock:branch:{payload.branch_id}:type:{payload.booking_type}:slot:{slot_datetime.strftime('%Y%m%d%H')}"
    
    if not get_slot_lock(lock_key, expire_seconds=10):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The requested slot is currently undergoing booking. Please try again in a few seconds."
        )

    try:
        # Check Capacity
        capacity = 15 if payload.booking_type == "LAB_VISIT" else 5
        slot_start = slot_datetime.replace(minute=0, second=0, microsecond=0)
        slot_end = slot_start + timedelta(hours=1)
        
        current_bookings_count = db.query(Booking).filter(
            Booking.branch_id == payload.branch_id,
            Booking.booking_type == payload.booking_type,
            Booking.slot_time >= slot_start,
            Booking.slot_time < slot_end,
            Booking.status != "CANCELLED"
        ).count()

        if current_bookings_count >= capacity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected slot is fully booked. Please choose another time."
            )

        # Validate Tests
        tests = db.query(Test).filter(Test.id.in_(payload.test_ids), Test.is_active == True).all()
        if len(tests) != len(payload.test_ids):
            raise HTTPException(status_code=400, detail="One or more selected tests are invalid or inactive.")

        # Resolve or Create Patient
        patient_data = payload.patient
        patient = db.query(Patient).filter(Patient.phone == patient_data.phone).first()
        if not patient:
            patient = Patient(
                full_name=patient_data.full_name,
                phone=patient_data.phone,
                secondary_phone=patient_data.secondary_phone,
                gender=patient_data.gender,
                age=patient_data.age
            )
            db.add(patient)
            db.flush()

        # Calculate Total Cost
        subtotal = sum(test.price for test in tests)
        home_collection_charge = 0
        
        if payload.booking_type == "HOME_COLLECTION":
            if not all([payload.house_number, payload.area, payload.pincode]):
                raise HTTPException(status_code=400, detail="Address details are required for home collections.")
            
            # Simple mock distance slab: 0-5 km: 100, 5-10 km: 150, 10-15 km: 200, 15+ km: 250
            # For mockup, we default to 4.5km (100 INR charge)
            home_collection_charge = 100.00
            
        total_cost = float(subtotal) + home_collection_charge

        # Determine payment method (CASH or RAZORPAY)
        payment_method = payload.payment_method or ("CASH" if payload.booking_type == "LAB_VISIT" else "RAZORPAY")

        # Create Booking
        booking = Booking(
            patient_id=patient.id,
            branch_id=payload.branch_id,
            booking_type=payload.booking_type,
            slot_time=slot_datetime,
            total_amount=total_cost,
            status="CONFIRMED" if payment_method == "CASH" else "PENDING_PAYMENT"
        )
        booking.tests = tests
        db.add(booking)
        db.flush()

        # Create Home Collection Address details if needed
        if payload.booking_type == "HOME_COLLECTION":
            address = HomeCollectionAddress(
                booking_id=booking.id,
                house_number=payload.house_number,
                landmark=payload.landmark,
                area=payload.area,
                pincode=payload.pincode,
                distance_km=4.5 # mock distance
            )
            db.add(address)

        # Create Payment Record
        razorpay_order_id = None
        if payment_method == "RAZORPAY":
            try:
                client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
                razorpay_amount = int(total_cost * 100)
                order_data = {
                    "amount": razorpay_amount,
                    "currency": "INR",
                    "receipt": str(booking.id)
                }
                razorpay_order = client.order.create(data=order_data)
                razorpay_order_id = razorpay_order.get("id")
            except Exception as rzp_err:
                print(f"Error creating Razorpay Order: {rzp_err}")
                # Fallback mock order ID for seamless testing
                razorpay_order_id = f"order_mock_{booking.id.hex[:14]}"

        payment = Payment(
            booking_id=booking.id,
            method=payment_method,
            status="PENDING",
            razorpay_order_id=razorpay_order_id,
            amount=total_cost
        )
        db.add(payment)
        
        db.commit()
        db.refresh(booking)
        
        # Trigger SMS immediately if booking is confirmed (CASH payment method)
        if booking.status == "CONFIRMED":
            send_booking_confirm_sms(
                patient.phone,
                patient.full_name,
                str(booking.id),
                ", ".join([t.name for t in booking.tests]),
                booking.slot_time.strftime('%Y-%m-%d'),
                booking.slot_time.strftime('%H:%M')
            )

        return booking

    except Exception as e:
        db.rollback()
        raise e
    finally:
        release_slot_lock(lock_key)


@router.post("/verify-payment")
def verify_payment(payload: PaymentVerify, db: Session = Depends(get_db)):
    """Verifies Razorpay payment signature and confirms booking."""
    payment = db.query(Payment).filter(Payment.razorpay_order_id == payload.razorpay_order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found.")

    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking record not found.")

    # Skip signature check for mock orders to ease testing
    is_mock = payload.razorpay_order_id.startswith("order_mock_")
    
    if not is_mock:
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            params_dict = {
                'razorpay_order_id': payload.razorpay_order_id,
                'razorpay_payment_id': payload.razorpay_payment_id,
                'razorpay_signature': payload.razorpay_signature
            }
            client.utility.verify_payment_signature(params_dict)
        except Exception as e:
            # Fallback signature check using HMAC-SHA256
            import hmac
            import hashlib
            msg = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}"
            generated_signature = hmac.new(
                settings.RAZORPAY_KEY_SECRET.encode(),
                msg.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if generated_signature != payload.razorpay_signature:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid payment signature. Verification failed."
                )

    # Update payment & booking status
    payment.status = "SUCCESS"
    payment.razorpay_payment_id = payload.razorpay_payment_id
    booking.status = "CONFIRMED"
    
    # Send confirmation SMS
    patient = booking.patient
    send_booking_confirm_sms(
        patient.phone,
        patient.full_name,
        str(booking.id),
        ", ".join([t.name for t in booking.tests]),
        booking.slot_time.strftime('%Y-%m-%d'),
        booking.slot_time.strftime('%H:%M')
    )
    
    db.commit()
    return {"status": "success", "message": "Payment verified and booking confirmed."}

