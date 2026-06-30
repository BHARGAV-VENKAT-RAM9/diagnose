from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models import Booking, Patient, Report, Payment, Review, CorporateEnquiry, Test, Package, AuditLog, User, Role
from app.routers.auth import hash_password
from pydantic import BaseModel, Field

router = APIRouter(prefix="/admin", tags=["admin"])

class AdminKPIs(BaseModel):
    total_bookings: int
    total_revenue: float
    total_patients: int
    pending_reports: int

class CorporateEnquiryCreate(BaseModel):
    company_name: str
    contact_person: str
    phone: str
    employee_count: Optional[int] = None
    requirement: Optional[str] = None

class CorporateResponse(BaseModel):
    id: UUID
    company_name: str
    contact_person: str
    phone: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewCreate(BaseModel):
    patient_name: str
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = None


def log_audit(db: Session, user_id: Optional[UUID], action: str, entity_name: str, entity_id: Optional[UUID], details: str):
    """Utility to log system audit actions (login, updates, approvals)."""
    try:
        log = AuditLog(
            user_id=user_id,
            action=action,
            entity_name=entity_name,
            entity_id=entity_id,
            details=details
        )
        db.add(log)
        db.commit()
    except Exception as e:
        print("Audit logging error:", e)


@router.get("/kpis", response_model=AdminKPIs)
def get_dashboard_kpis(db: Session = Depends(get_db)):
    """Calculates operational KPIs for the administrative dashboard."""
    # Count total bookings
    total_bookings = db.query(Booking).count()

    # Sum revenue (payments success status)
    revenue_sum = db.query(func.sum(Payment.amount)).filter(Payment.status == "SUCCESS").scalar()
    total_revenue = float(revenue_sum) if revenue_sum is not None else 0.0

    # Count unique patients
    total_patients = db.query(Patient).count()

    # Count pending reports (bookings which are REPORT_UPLOADED or in PROCESSING but not COMPLETED)
    pending_reports = db.query(Booking).filter(
        Booking.status.in_(["REPORT_UPLOADED", "PROCESSING"])
    ).count()

    return AdminKPIs(
        total_bookings=total_bookings,
        total_revenue=total_revenue,
        total_patients=total_patients,
        pending_reports=pending_reports
    )


@router.get("/bookings")
def list_all_bookings(status_filter: Optional[str] = None, db: Session = Depends(get_db)):
    """Retrieves all bookings for support admin dashboard."""
    query = db.query(Booking).order_by(Booking.created_at.desc())
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    
    bookings = query.all()
    result = []
    for b in bookings:
        patient = db.query(Patient).filter(Patient.id == b.patient_id).first()
        payment = db.query(Payment).filter(Payment.booking_id == b.id).first()
        report = db.query(Report).filter(Report.booking_id == b.id).first()
        
        result.append({
            "id": b.id,
            "patient_name": patient.full_name if patient else "Unknown",
            "phone": patient.phone if patient else "N/A",
            "booking_type": b.booking_type,
            "status": b.status,
            "slot_time": b.slot_time.strftime("%Y-%m-%d %H:%M"),
            "total_amount": float(b.total_amount),
            "payment_status": payment.status if payment else "PENDING",
            "tests": [t.name for t in b.tests],
            "report_id": str(report.id) if report else None,
            "critical_value_flag": report.critical_value_flag if report else False,
            "assigned_phlebotomist": b.assigned_phlebotomist,
            "home_collection_address": {
                "house_number": b.home_collection_address.house_number,
                "landmark": b.home_collection_address.landmark,
                "area": b.home_collection_address.area,
                "pincode": b.home_collection_address.pincode
            } if b.booking_type == "HOME_COLLECTION" and b.home_collection_address else None
        })
    return result


@router.post("/reviews", status_code=status.HTTP_201_CREATED)
def submit_patient_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    """Enables patients to submit feedback directly from the website homepage."""
    review = Review(
        patient_name=payload.patient_name,
        rating=payload.rating,
        review_text=payload.review_text,
        status="PENDING" # Starts as pending support review
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return {"status": "success", "message": "Review submitted. Pending administration approval."}


@router.get("/reviews/pending")
def list_pending_reviews(db: Session = Depends(get_db)):
    """Retrieves all reviews currently awaiting support admin approval."""
    return db.query(Review).filter(Review.status == "PENDING").all()


@router.get("/reviews/approved")
def list_approved_reviews(db: Session = Depends(get_db)):
    """Retrieves all reviews currently approved for public display."""
    return db.query(Review).filter(Review.status == "APPROVED").order_by(Review.created_at.desc()).all()


@router.post("/reviews/approve/{review_id}")
def approve_patient_review(review_id: UUID, admin_user_id: UUID, db: Session = Depends(get_db)):
    """Approves a patient review to be visible publicly on the website."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found.")
        
    review.status = "APPROVED"
    review.approved_by_id = admin_user_id
    review.approved_date = datetime.utcnow()
    
    log_audit(db, admin_user_id, "APPROVAL", "reviews", review.id, f"Approved patient review by {review.patient_name}")
    db.commit()
    return {"message": "Review approved successfully."}


@router.get("/analytics")
def get_detailed_analytics(db: Session = Depends(get_db)):
    """Retrieves distribution data and details mapping top booking parameters."""
    # Booking Type split
    lab_visit_count = db.query(Booking).filter(Booking.booking_type == "LAB_VISIT").count()
    home_coll_count = db.query(Booking).filter(Booking.booking_type == "HOME_COLLECTION").count()

    # Top Tests (Mock data based on database or dynamic queries)
    # Return popular test frequencies
    top_tests = [
        {"name": "Complete Blood Count (CBC)", "bookings_count": db.query(Booking).count()},
        {"name": "Vitamin D (25-Hydroxy)", "bookings_count": max(0, db.query(Booking).count() - 1)}
    ]

    return {
        "booking_type_distribution": {
            "lab_visits": lab_visit_count,
            "home_collections": home_coll_count
        },
        "top_tests": top_tests
    }


@router.post("/corporate-enquiry", response_model=CorporateResponse, status_code=status.HTTP_201_CREATED)
def submit_corporate_enquiry(payload: CorporateEnquiryCreate, db: Session = Depends(get_db)):
    """Enables B2B corporate lead submissions from the website contact flow."""
    lead = CorporateEnquiry(
        company_name=payload.company_name,
        contact_person=payload.contact_person,
        phone=payload.phone,
        employee_count=payload.employee_count,
        requirement=payload.requirement,
        status="PENDING"
    )
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/corporate-enquiries", response_model=List[CorporateResponse])
def list_corporate_enquiries(db: Session = Depends(get_db)):
    """Retrieves list of all corporate enquiries/leads."""
    return db.query(CorporateEnquiry).order_by(CorporateEnquiry.created_at.desc()).all()


@router.post("/bookings/{booking_id}/status")
def update_booking_status(booking_id: UUID, status: str, db: Session = Depends(get_db)):
    """Allows staff/admins to update the status of a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    
    # Validate next status
    allowed_statuses = [
        "PENDING_PAYMENT", "CONFIRMED", "RESCHEDULED", "CANCELLED", 
        "SAMPLE_COLLECTED", "PROCESSING", "REPORT_UPLOADED", "REPORT_APPROVED", "COMPLETED"
    ]
    status_upper = status.upper()
    if status_upper not in allowed_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {allowed_statuses}")
        
    booking.status = status_upper
    
    # Log to audit history
    log_audit(db, None, "UPDATE_STATUS", "bookings", booking.id, f"Updated booking status to {status_upper}")
    db.commit()
    return {"message": "Booking status updated successfully.", "status": booking.status}


@router.post("/bookings/{booking_id}/assign-phlebotomist")
def assign_phlebotomist(booking_id: UUID, phlebotomist_name: Optional[str] = None, db: Session = Depends(get_db)):
    """Assigns a phlebotomist to a booking."""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")
    
    # If the string is empty or literally 'None'/'Unassigned', treat as None
    if not phlebotomist_name or phlebotomist_name.strip() in ["", "None", "Unassigned"]:
        booking.assigned_phlebotomist = None
    else:
        booking.assigned_phlebotomist = phlebotomist_name.strip()
        
    db.commit()
    return {"message": "Phlebotomist assigned successfully.", "assigned_phlebotomist": booking.assigned_phlebotomist}


class PackageCreatePayload(BaseModel):
    name: str
    price: float
    discount_price: Optional[float] = None
    description: Optional[str] = None
    test_ids: List[UUID]


@router.get("/packages")
def list_admin_packages(db: Session = Depends(get_db)):
    """Lists all health packages including associated tests details."""
    pkgs = db.query(Package).order_by(Package.name).all()
    result = []
    for p in pkgs:
        result.append({
            "id": str(p.id),
            "branch_id": str(p.branch_id),
            "name": p.name,
            "slug": p.slug,
            "description": p.description,
            "price": float(p.price),
            "discount_price": float(p.discount_price) if p.discount_price else None,
            "is_active": p.is_active,
            "tests": [{"id": str(t.id), "name": t.name} for t in p.tests]
        })
    return result


@router.post("/packages")
def create_package(payload: PackageCreatePayload, db: Session = Depends(get_db)):
    """Creates a new health package in the catalog."""
    import re
    slug = re.sub(r'[^a-z0-9]+', '-', payload.name.lower()).strip('-')
    
    from app.models import Branch
    branch = db.query(Branch).first()
    branch_id = branch.id if branch else UUID("da4ff965-f9be-4ff2-8d7b-cbff246e7f8e")

    pkg = Package(
        name=payload.name,
        slug=slug,
        description=payload.description,
        price=payload.price,
        discount_price=payload.discount_price,
        branch_id=branch_id,
        is_active=True
    )
    
    tests = db.query(Test).filter(Test.id.in_(payload.test_ids)).all()
    pkg.tests = tests
    
    db.add(pkg)
    db.commit()
    db.refresh(pkg)
    return {"message": "Package created successfully.", "id": str(pkg.id)}


@router.put("/packages/{package_id}")
def edit_package(package_id: UUID, payload: PackageCreatePayload, db: Session = Depends(get_db)):
    """Edits an existing health package's metadata and tests mapping."""
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found.")
    
    import re
    pkg.name = payload.name
    pkg.slug = re.sub(r'[^a-z0-9]+', '-', payload.name.lower()).strip('-')
    pkg.description = payload.description
    pkg.price = payload.price
    pkg.discount_price = payload.discount_price
    
    tests = db.query(Test).filter(Test.id.in_(payload.test_ids)).all()
    pkg.tests = tests
    
    db.commit()
    return {"message": "Package updated successfully."}


@router.post("/packages/{package_id}/price")
def update_package_price(package_id: UUID, price: float, db: Session = Depends(get_db)):
    """Updates the price of a health package."""
    pkg = db.query(Package).filter(Package.id == package_id).first()
    if not pkg:
        raise HTTPException(status_code=404, detail="Package not found.")
    pkg.price = price
    db.commit()
    return {"message": "Package price updated successfully.", "price": float(pkg.price)}


@router.post("/tests/{test_id}/price")
def update_test_price_route(test_id: UUID, price: float, db: Session = Depends(get_db)):
    """Updates the price of a catalog test."""
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")
    test.price = price
    db.commit()
    return {"message": "Test price updated successfully.", "price": float(test.price)}


class UserRegisterPayload(BaseModel):
    email: str
    username: str
    password: str
    full_name: str
    role_name: str


class ResetPasswordPayload(BaseModel):
    password: str


@router.get("/users")
def list_admin_users(db: Session = Depends(get_db)):
    """Retrieves list of all staff/portal users with their role names."""
    users = db.query(User).all()
    result = []
    for u in users:
        role = db.query(Role).filter(Role.id == u.role_id).first()
        role_name = role.name if role else "SUPPORT_ADMIN"
        result.append({
            "id": str(u.id),
            "email": u.email,
            "username": u.username,
            "full_name": u.full_name,
            "role": role_name,
            "is_active": u.is_active
        })
    return result


@router.post("/users")
def register_staff_user(payload: UserRegisterPayload, db: Session = Depends(get_db)):
    """Registers a new staff portal user with password hashing."""
    existing_user = db.query(User).filter(
        (User.username == payload.username) | (User.email == payload.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists.")
    
    role = db.query(Role).filter(Role.name == payload.role_name).first()
    if not role:
        raise HTTPException(status_code=400, detail=f"Role {payload.role_name} not found.")
        
    hashed_pwd = hash_password(payload.password)
    user = User(
        email=payload.email,
        username=payload.username,
        hashed_password=hashed_pwd,
        full_name=payload.full_name,
        role_id=role.id,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully.", "id": str(user.id)}


@router.post("/users/{user_id}/reset-password")
def reset_user_password(user_id: UUID, payload: ResetPasswordPayload, db: Session = Depends(get_db)):
    """Resets the password of a portal user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.hashed_password = hash_password(payload.password)
    db.commit()
    return {"message": "Password updated successfully."}


@router.post("/users/{user_id}/toggle-status")
def toggle_user_status(user_id: UUID, db: Session = Depends(get_db)):
    """Toggles active/disabled status of a portal user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    role = db.query(Role).filter(Role.id == user.role_id).first()
    if role and role.name == "MAIN_ADMIN":
        raise HTTPException(status_code=400, detail="Cannot disable the main admin owner account.")
        
    user.is_active = not user.is_active
    db.commit()
    return {"is_active": user.is_active}

