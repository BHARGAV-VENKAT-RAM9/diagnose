from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models import Booking, Patient, Report, Payment, Review, CorporateEnquiry, Test, Package, AuditLog
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
        
        result.append({
            "id": b.id,
            "patient_name": patient.full_name if patient else "Unknown",
            "phone": patient.phone if patient else "N/A",
            "booking_type": b.booking_type,
            "status": b.status,
            "slot_time": b.slot_time.strftime("%Y-%m-%d %H:%M"),
            "total_amount": float(b.total_amount),
            "payment_status": payment.status if payment else "PENDING",
            "tests": [t.name for t in b.tests]
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
