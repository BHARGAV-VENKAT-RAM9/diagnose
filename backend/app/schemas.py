from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime, date
from typing import List, Optional
from decimal import Decimal

# Demographics & User Schemas
class PatientCreate(BaseModel):
    full_name: str = Field(..., max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    secondary_phone: Optional[str] = Field(default=None, max_length=15)
    gender: str = Field(..., description="MALE, FEMALE, or OTHER")
    age: int = Field(..., ge=0, le=120)

class PatientResponse(BaseModel):
    id: UUID
    full_name: str
    phone: str
    gender: str
    age: int
    created_at: datetime

    class Config:
        from_attributes = True

# Test & Package Schemas
class TestResponse(BaseModel):
    id: UUID
    branch_id: UUID
    name: str
    slug: str
    description: Optional[str]
    price: Decimal
    tat: str
    sample_type: str
    priority: str
    preparation_required: Optional[str]
    home_collection_available: bool
    home_collection_notes: Optional[str]

    class Config:
        from_attributes = True

class PackageResponse(BaseModel):
    id: UUID
    branch_id: UUID
    name: str
    slug: str
    description: Optional[str]
    price: Decimal
    discount_price: Optional[Decimal]
    tests: List[TestResponse] = []

    class Config:
        from_attributes = True

# Booking Schemas
class BookingCreate(BaseModel):
    branch_id: UUID
    booking_type: str = Field(..., description="LAB_VISIT or HOME_COLLECTION")
    slot_time: datetime
    test_ids: List[UUID]
    patient: PatientCreate
    
    # Address details required if booking_type is HOME_COLLECTION
    house_number: Optional[str] = None
    landmark: Optional[str] = None
    area: Optional[str] = None
    pincode: Optional[str] = None
    payment_method: Optional[str] = "CASH"

class BookingResponse(BaseModel):
    id: UUID
    booking_type: str
    status: str
    slot_time: datetime
    total_amount: Decimal
    created_at: datetime
    patient: PatientResponse
    tests: List[TestResponse] = []
    razorpay_order_id: Optional[str] = None
    razorpay_key_id: Optional[str] = None
    assigned_phlebotomist: Optional[str] = None

    class Config:
        from_attributes = True

# Slot Schemas
class SlotAvailabilityRequest(BaseModel):
    branch_id: UUID
    booking_type: str
    target_date: date

class SlotAvailabilityResponse(BaseModel):
    slot_time: str # e.g. "09:00"
    available: bool
    capacity_level: str # "AVAILABLE", "FULL", "FILLING_FAST"

# Report Schemas
class ReportUploadResponse(BaseModel):
    id: UUID
    booking_id: UUID
    file_path: str
    critical_value_flag: bool
    status: str
    created_at: datetime
    checksum: Optional[str] = None
    file_size: Optional[int] = None

    class Config:
        from_attributes = True

class ReportAccessRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)

class ReportOTPVerify(BaseModel):
    phone: str
    otp: str = Field(..., min_length=6, max_length=6)

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

