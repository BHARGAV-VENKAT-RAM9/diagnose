import uuid
import datetime
from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey, Table, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

# Many-to-Many Join Tables

# Package-Test association
package_test_association = Table(
    "package_tests",
    Base.metadata,
    Column("package_id", UUID(as_uuid=True), ForeignKey("packages.id", ondelete="CASCADE"), primary_key=True),
    Column("test_id", UUID(as_uuid=True), ForeignKey("tests.id", ondelete="CASCADE"), primary_key=True)
)

# Booking-Test association
booking_test_association = Table(
    "booking_tests",
    Base.metadata,
    Column("booking_id", UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), primary_key=True),
    Column("test_id", UUID(as_uuid=True), ForeignKey("tests.id", ondelete="CASCADE"), primary_key=True)
)


class Role(Base):
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False) # e.g. "MAIN_ADMIN", "SUPPORT_ADMIN", "LAB_TECHNICIAN"
    description = Column(String(200), nullable=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(100), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="RESTRICT"), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    role = relationship("Role", back_populates="users")
    uploaded_reports = relationship("Report", foreign_keys="Report.uploaded_by_id", back_populates="uploaded_by")
    approved_reports = relationship("Report", foreign_keys="Report.approved_by_id", back_populates="approved_by")


class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String(15), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    tests = relationship("Test", back_populates="branch")
    bookings = relationship("Booking", back_populates="branch")


class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(100), nullable=False)
    phone = Column(String(15), index=True, nullable=False)
    secondary_phone = Column(String(15), nullable=True)
    gender = Column(Enum("MALE", "FEMALE", "OTHER", name="gender_enum"), nullable=False)
    age = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    bookings = relationship("Booking", back_populates="patient")


class TestCategory(Base):
    __tablename__ = "test_categories"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    tests = relationship("Test", back_populates="category")


class Test(Base):
    __tablename__ = "tests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("test_categories.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    tat = Column(String(50), nullable=False) # e.g. "12 Hours"
    sample_type = Column(String(50), nullable=False) # Blood, Urine, Stool, Swab
    priority = Column(Enum("ROUTINE", "URGENT", name="priority_enum"), default="ROUTINE") # STAT test differentiation
    preparation_required = Column(String(255), nullable=True) # Fasting instructions, etc.
    home_collection_available = Column(Boolean, default=True)
    home_collection_notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    branch = relationship("Branch", back_populates="tests")
    category = relationship("TestCategory", back_populates="tests")
    packages = relationship("Package", secondary=package_test_association, back_populates="tests")
    bookings = relationship("Booking", secondary=booking_test_association, back_populates="tests")


class Package(Base):
    __tablename__ = "packages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(150), nullable=False)
    slug = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    tests = relationship("Test", secondary=package_test_association, back_populates="packages")


class Booking(Base):
    __tablename__ = "bookings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(UUID(as_uuid=True), ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id", ondelete="RESTRICT"), nullable=False)
    booking_type = Column(Enum("LAB_VISIT", "HOME_COLLECTION", name="booking_type_enum"), nullable=False)
    status = Column(Enum(
        "PENDING_PAYMENT", 
        "CONFIRMED", 
        "RESCHEDULED", 
        "CANCELLED", 
        "SAMPLE_COLLECTED", 
        "PROCESSING", 
        "REPORT_UPLOADED", 
        "REPORT_APPROVED", 
        "COMPLETED", 
        name="booking_status_enum"
    ), default="PENDING_PAYMENT")
    slot_time = Column(DateTime, nullable=False)
    total_amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    patient = relationship("Patient", back_populates="bookings")
    branch = relationship("Branch", back_populates="bookings")
    tests = relationship("Test", secondary=booking_test_association, back_populates="bookings")
    payment = relationship("Payment", uselist=False, back_populates="booking")
    report = relationship("Report", uselist=False, back_populates="booking")
    home_collection_address = relationship("HomeCollectionAddress", uselist=False, back_populates="booking")

    @property
    def razorpay_order_id(self):
        return self.payment.razorpay_order_id if self.payment else None

    @property
    def razorpay_key_id(self):
        from app.config import settings
        return settings.RAZORPAY_KEY_ID



class HomeCollectionAddress(Base):
    __tablename__ = "home_collection_addresses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    house_number = Column(String(100), nullable=False)
    landmark = Column(String(150), nullable=True)
    area = Column(String(150), nullable=False)
    pincode = Column(String(10), nullable=False)
    distance_km = Column(Numeric(5, 2), nullable=False)

    booking = relationship("Booking", back_populates="home_collection_address")


class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    method = Column(Enum("RAZORPAY", "CASH", name="payment_method_enum"), nullable=False)
    status = Column(Enum("PENDING", "SUCCESS", "FAILED", "REFUNDED", name="payment_status_enum"), default="PENDING")
    razorpay_order_id = Column(String(100), nullable=True)
    razorpay_payment_id = Column(String(100), nullable=True)
    amount = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="payment")


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(512), nullable=False) # Location in private storage bucket
    critical_value_flag = Column(Boolean, default=False) # Panic value handling
    uploaded_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    status = Column(Enum("PENDING", "APPROVED", name="report_status_enum"), default="PENDING")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    booking = relationship("Booking", back_populates="report")
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_id], back_populates="uploaded_reports")
    approved_by = relationship("User", foreign_keys=[approved_by_id], back_populates="approved_reports")


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_name = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False)
    review_text = Column(Text, nullable=True)
    status = Column(Enum("PENDING", "APPROVED", name="review_status_enum"), default="PENDING")
    approved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    approved_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    approved_by = relationship("User", foreign_keys=[approved_by_id])


class Blog(Base):
    __tablename__ = "blogs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    featured_image = Column(String(512), nullable=True)
    author_name = Column(String(100), nullable=False)
    status = Column(Enum("CREATE", "REVIEW", "PUBLISH", name="blog_status_enum"), default="CREATE")
    meta_title = Column(String(100), nullable=True)
    meta_description = Column(String(250), nullable=True)
    publish_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class CorporateEnquiry(Base):
    __tablename__ = "corporate_enquiries"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_name = Column(String(150), nullable=False)
    contact_person = Column(String(100), nullable=False)
    phone = Column(String(15), nullable=False)
    employee_count = Column(Integer, nullable=True)
    requirement = Column(Text, nullable=True)
    status = Column(Enum("PENDING", "REVIEWED", "CONTACTED", "CLOSED", name="lead_status_enum"), default="PENDING")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False) # CREATE, UPDATE, DELETE, APPROVAL, LOGIN, PASSWORD_STORAGE
    entity_name = Column(String(100), nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
