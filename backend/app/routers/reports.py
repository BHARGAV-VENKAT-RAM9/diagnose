import random
import time
import os
import hmac
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime, timedelta

from app.database import get_db
from app.config import settings
from app.models import Booking, Patient, Report, AuditLog
from app.schemas import ReportUploadResponse, ReportOTPVerify

router = APIRouter(prefix="/reports", tags=["reports"])

# Memory-based simple OTP storage for mockup (in prod, use Redis)
mock_otp_store = {}
mock_lockout_store = {}


def check_rate_limit(phone: str) -> bool:
    """Simple rate limit check. Returns True if locked out."""
    lockout_time = mock_lockout_store.get(phone)
    if lockout_time:
        if datetime.utcnow() < lockout_time:
            return True
        else:
            del mock_lockout_store[phone]
    return False


@router.post("/request-otp")
def request_otp(phone: str, db: Session = Depends(get_db)):
    """
    Sends an OTP via MSG91 WhatsApp mock to retrieve patient reports.
    Implements P1 brute-force rate-limiting.
    """
    # 1. Check lockout state (FS-04)
    if check_rate_limit(phone):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many attempts. This number is locked for {settings.OTP_LOCKOUT_MINUTES} minutes."
        )

    # 2. Check if patient exists
    patient = db.query(Patient).filter(Patient.phone == phone).first()
    if not patient:
        # For security, do not disclose if phone number exists. Pretend OTP sent anyway.
        return {"message": "If this number is registered, an OTP has been sent."}

    # 3. Generate 6-digit OTP
    otp = f"{random.randint(100000, 999999)}"
    
    # Store OTP with details: attempts, expiry
    mock_otp_store[phone] = {
        "otp": otp,
        "attempts": 0,
        "expires_at": datetime.utcnow() + timedelta(seconds=settings.OTP_EXPIRY_SECONDS)
    }

    # 4. Trigger Brevo SMS (OTP Notification)
    from app.sms import send_otp_sms
    send_otp_sms(phone, otp)

    return {"message": "OTP sent successfully."}



@router.post("/verify-otp")
def verify_otp(payload: ReportOTPVerify, db: Session = Depends(get_db)):
    """Verifies OTP and authorizes access to reports."""
    phone = payload.phone
    otp_input = payload.otp

    # 1. Check lockout (FS-04)
    if check_rate_limit(phone):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Account locked. Please try again later."
        )

    otp_data = mock_otp_store.get(phone)
    if not otp_data:
        raise HTTPException(status_code=400, detail="OTP session not found. Please request a new OTP.")

    # Check expiry
    if datetime.utcnow() > otp_data["expires_at"]:
        del mock_otp_store[phone]
        raise HTTPException(status_code=400, detail="OTP has expired. Please request a new one.")

    # Verify matching
    if otp_data["otp"] != otp_input:
        otp_data["attempts"] += 1
        
        # Lockout if attempts exceed max (FS-04)
        if otp_data["attempts"] >= settings.OTP_MAX_ATTEMPTS:
            mock_lockout_store[phone] = datetime.utcnow() + timedelta(minutes=settings.OTP_LOCKOUT_MINUTES)
            del mock_otp_store[phone]
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed attempts. Locked for {settings.OTP_LOCKOUT_MINUTES} minutes."
            )
            
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid OTP. {settings.OTP_MAX_ATTEMPTS - otp_data['attempts']} attempts remaining."
        )

    # Clean OTP store on success
    del mock_otp_store[phone]

    # Fetch patient bookings and reports
    patient = db.query(Patient).filter(Patient.phone == phone).first()
    if not patient:
        return {"status": "success", "message": "OTP Verified.", "patient_name": "New Patient", "phone": phone}
    
    return {"status": "success", "message": "OTP Verified.", "patient_name": patient.full_name, "phone": phone}


@router.get("/patient-reports")
def get_patient_reports(phone: str, db: Session = Depends(get_db)):
    """Retrieves list of reports for a verified phone number."""
    patient = db.query(Patient).filter(Patient.phone == phone).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient record not found.")

    bookings = db.query(Booking).filter(
        Booking.patient_id == patient.id,
        Booking.status.in_(["REPORT_UPLOADED", "REPORT_APPROVED", "COMPLETED", "PROCESSING"])
    ).order_by(Booking.created_at.desc()).all() # Newer bookings first
    
    report_list = []
    for booking in bookings:
        report = db.query(Report).filter(Report.booking_id == booking.id).first()
        status_label = "Processing"
        if booking.status in ["REPORT_APPROVED", "COMPLETED"] and report:
            status_label = "Ready"
            
        report_list.append({
            "booking_id": booking.id,
            "booking_date": booking.created_at.strftime("%Y-%m-%d"),
            "tests": [test.name for test in booking.tests],
            "status": status_label,
            "report_id": report.id if report else None,
            "critical_flag": report.critical_value_flag if report else False
        })
        
    return report_list


SECRET_KEY = settings.RAZORPAY_KEY_SECRET.encode()

def generate_file_signature(report_id: str, phone: str, expires: int) -> str:
    payload = f"{report_id}:{phone}:{expires}"
    return hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()

def verify_file_signature(report_id: str, phone: str, expires: int, signature: str) -> bool:
    if int(time.time()) > expires:
        return False
    payload = f"{report_id}:{phone}:{expires}"
    expected = hmac.new(SECRET_KEY, payload.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.get("/download/{report_id}")
def download_report(report_id: UUID, phone: str, db: Session = Depends(get_db)):
    """
    Generates a secure, short-lived signed URL for report download (FS-05).
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report file not found.")

    # Secure verification: confirm report matches the patient phone
    booking = db.query(Booking).filter(Booking.id == report.booking_id).first()
    patient = db.query(Patient).filter(Patient.id == booking.patient_id).first()
    if patient.phone != phone:
        raise HTTPException(status_code=403, detail="Access denied to this report.")

    # Check approval status
    if report.status != "APPROVED":
        raise HTTPException(status_code=403, detail="Report is pending administrative review.")

    # Expiry 300 seconds (5 minutes)
    expires_at = int(time.time()) + 300
    signature = generate_file_signature(str(report_id), phone, expires_at)
    
    signed_url = f"{settings.API_BASE_URL}/api/v1/reports/file/{report_id}?phone={phone}&expires={expires_at}&signature={signature}"
    
    return {"download_url": signed_url}


@router.get("/file/{report_id}")
def serve_report_file(
    report_id: UUID, 
    phone: str, 
    expires: int, 
    signature: str, 
    db: Session = Depends(get_db)
):
    """Serves the raw report file securely after signature verification."""
    # 1. Verify signature
    if not verify_file_signature(str(report_id), phone, expires, signature):
        raise HTTPException(status_code=403, detail="Invalid or expired signature.")

    # 2. Fetch report
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    # 3. Double-check phone alignment
    booking = db.query(Booking).filter(Booking.id == report.booking_id).first()
    patient = db.query(Patient).filter(Patient.id == booking.patient_id).first()
    if patient.phone != phone:
        raise HTTPException(status_code=403, detail="Access denied.")

    # 4. Resolve file path in private storage
    file_path = os.path.join("private_storage", str(report.booking_id), os.path.basename(report.file_path))
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found on disk.")
            
    return FileResponse(file_path, filename=os.path.basename(report.file_path))


@router.post("/upload", response_model=ReportUploadResponse, status_code=status.HTTP_201_CREATED)
def upload_report(
    booking_id: UUID, 
    critical_value: bool = False,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Enables Lab Technician to upload a report.
    Checks file types (PDF, JPG, JPEG, PNG).
    """
    # Verify file extension
    ext = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if ext not in ['pdf', 'jpg', 'jpeg', 'png']:
        raise HTTPException(status_code=400, detail="Only PDF, JPG, JPEG, and PNG reports are allowed.")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found.")

    # Read file content
    content = file.file.read()
    file_size = len(content)
    
    # Enforce file size limit (10MB)
    if file_size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds the 10MB limit.")

    # Calculate SHA-256 checksum for integrity validation
    checksum = hashlib.sha256(content).hexdigest()

    # Save to private storage
    private_dir = os.path.join("private_storage", str(booking_id))
    os.makedirs(private_dir, exist_ok=True)
    dest_path = os.path.join(private_dir, file.filename)
    with open(dest_path, "wb") as f:
        f.write(content)

    # Storage path
    relative_path = f"reports/{booking_id}/{file.filename}"
    
    # Save Report details to Database
    report = db.query(Report).filter(Report.booking_id == booking_id).first()
    if not report:
        report = Report(
            booking_id=booking_id,
            file_path=relative_path,
            critical_value_flag=critical_value,
            status="PENDING"
        )
        db.add(report)
    else:
        # Replace file details
        report.file_path = relative_path
        report.critical_value_flag = critical_value
        report.status = "PENDING"

    # Update booking status to REPORT_UPLOADED
    booking.status = "REPORT_UPLOADED"
    
    # Log to audit history
    audit = AuditLog(
        action="CREATE",
        entity_name="reports",
        entity_id=report.id,
        details=f"Uploaded report {file.filename} (Size: {file_size} bytes, Checksum: {checksum}) for booking {booking_id}"
    )
    db.add(audit)

    db.commit()
    db.refresh(report)

    # Populate dynamic fields for response schema
    report.checksum = checksum
    report.file_size = file_size

    return report


@router.post("/approve/{report_id}")
def approve_report(report_id: UUID, admin_user_id: UUID, db: Session = Depends(get_db)):
    """
    Enables Support Admin to approve a report.
    Approving triggers booking status COMPLETED and mock MSG91 Template 4 (Report Ready).
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    report.status = "APPROVED"
    report.approved_by_id = admin_user_id
    
    booking = db.query(Booking).filter(Booking.id == report.booking_id).first()
    booking.status = "COMPLETED"

    # Log to audit history
    audit = AuditLog(
        action="APPROVAL",
        entity_name="reports",
        entity_id=report.id,
        user_id=admin_user_id,
        details=f"Approved report for booking {booking.id}"
    )
    db.add(audit)

    db.commit()

    # Trigger Brevo SMS (Report Ready Notification)
    from app.sms import send_report_ready_sms
    patient = db.query(Patient).filter(Patient.id == booking.patient_id).first()
    send_report_ready_sms(patient.phone, patient.full_name, str(report_id))

    return {"message": "Report approved and patient notified."}
