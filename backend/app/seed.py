from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Branch, TestCategory, Test, Package, Role, User, Review, Blog
import uuid
import datetime

def seed_db():
    db = SessionLocal()
    try:
        # 1. Create Roles
        print("Seeding roles...")
        roles = {
            "MAIN_ADMIN": "Full system administrative access",
            "SUPPORT_ADMIN": "Manage bookings, packages, and reports approvals",
            "LAB_TECHNICIAN": "Upload patient report PDFs",
            "PHLEBOTOMIST": "Field collector for home samples"
        }
        role_objs = {}
        for role_name, desc in roles.items():
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name, description=desc)
                db.add(role)
                db.flush()
            role_objs[role_name] = role

        # 2. Create Branch
        print("Seeding branch...")
        branch = db.query(Branch).filter(Branch.name == "Main Branch").first()
        if not branch:
            branch = Branch(
                name="Main Branch",
                city="Hyderabad",
                address="101 Diagnostic Towers, Madhapur, Hyderabad",
                phone="+919876543210"
            )
            db.add(branch)
            db.flush()

        # 3. Create Support Admin User (Credentials: admin / admin)
        print("Seeding support admin user...")
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            user = User(
                id=uuid.UUID("00000000-0000-0000-0000-000000000000"),
                email="admin@vickydiagnostics.com",
                username="admin",
                hashed_password="4febbd0854472d56098d26cb57288fc5:86ce26bc3be74a18ac6ae4452991ab89ce40f24bb6b8b0195d48d41e0aa9aa1d", # PBKDF2 "admin"
                full_name="Support Admin Team",
                role_id=role_objs["SUPPORT_ADMIN"].id,
                is_active=True
            )
            db.add(user)
            db.flush()

        # Create Main Admin Owner User (Credentials: owner / owner)
        print("Seeding main admin owner user...")
        owner_user = db.query(User).filter(User.username == "owner").first()
        if not owner_user:
            owner_user = User(
                id=uuid.UUID("22222222-2222-2222-2222-222222222222"),
                email="owner@vickydiagnostics.com",
                username="owner",
                hashed_password="315eb7dc54118c23ef4da63aec25c775:7fceeb01bd4ad235320399860f8fb925346ab5588d56e485fb7c8805e0731df4", # PBKDF2 "owner"
                full_name="Main Admin Owner",
                role_id=role_objs["MAIN_ADMIN"].id,
                is_active=True
            )
            db.add(owner_user)
            db.flush()

        # Create Lab Technician User (Credentials: staff / staff)
        print("Seeding lab technician user...")
        staff_user = db.query(User).filter(User.username == "staff").first()
        if not staff_user:
            staff_user = User(
                id=uuid.UUID("11111111-1111-1111-1111-111111111111"),
                email="staff@vickydiagnostics.com",
                username="staff",
                hashed_password="0af0b1929ab7770ec47db08b94fe2763:77a5965829f58043a15b3b7b58ea5ca7cf934b18a1b8dabb0b1911612ab4c214", # PBKDF2 "staff"
                full_name="Staff Lab Technician Demo",
                role_id=role_objs["LAB_TECHNICIAN"].id,
                is_active=True
            )
            db.add(staff_user)
            db.flush()

        # Create Phlebotomist / Home Collector User (Credentials: collector / collector)
        print("Seeding phlebotomist collector user...")
        collector_user = db.query(User).filter(User.username == "collector").first()
        if not collector_user:
            collector_user = User(
                id=uuid.UUID("33333333-3333-3333-3333-333333333333"),
                email="collector@vickydiagnostics.com",
                username="collector",
                hashed_password="62fcf34196c6d3d20971bd53181672b9:9d1c0cab1f7292fee0f71187c9c50d31c7c72e5c0e6db32b0273e83d126d7cb6", # PBKDF2 "collector"
                full_name="Home Collector Team",
                role_id=role_objs["PHLEBOTOMIST"].id,
                is_active=True
            )
            db.add(collector_user)
            db.flush()

        # 4. Create Categories
        print("Seeding categories...")
        categories = [
            {"name": "Blood Tests", "slug": "blood-tests", "description": "Clinical hematology and biochemical profiles"},
            {"name": "Urine Tests", "slug": "urine-tests", "description": "Urinalysis and biochemistry"},
            {"name": "Radiology", "slug": "radiology", "description": "Imaging and diagnostic scans"}
        ]
        cat_objs = {}
        for cat in categories:
            category = db.query(TestCategory).filter(TestCategory.slug == cat["slug"]).first()
            if not category:
                category = TestCategory(name=cat["name"], slug=cat["slug"], description=cat["description"])
                db.add(category)
                db.flush()
            cat_objs[cat["slug"]] = category

        # 5. Create Tests
        print("Seeding tests...")
        tests_data = [
            {
                "name": "Complete Blood Count (CBC)",
                "slug": "cbc",
                "price": 299.00,
                "tat": "12 Hours",
                "sample_type": "Blood",
                "priority": "ROUTINE",
                "preparation_required": "No special preparation required.",
                "home_collection_available": True,
                "home_collection_notes": "Avoid eating heavy meals just before sample collection.",
                "description": "Evaluates overall health and detects a wide range of disorders, including anemia and leukemia."
            },
            {
                "name": "Vitamin D (25-Hydroxy)",
                "slug": "vitamin-d",
                "price": 999.00,
                "tat": "24 Hours",
                "sample_type": "Blood",
                "priority": "ROUTINE",
                "preparation_required": "10-12 hours fasting is highly recommended.",
                "home_collection_available": True,
                "home_collection_notes": "Drink plenty of water before collection.",
                "description": "Measures the concentration of Vitamin D in your blood to diagnose deficiencies."
            },
            {
                "name": "Thyroid Profile (T3, T4, TSH)",
                "slug": "thyroid-profile",
                "price": 599.00,
                "tat": "12 Hours",
                "sample_type": "Blood",
                "priority": "ROUTINE",
                "preparation_required": "Morning sample preferred. Fasting optional.",
                "home_collection_available": True,
                "home_collection_notes": "Collect early morning before taking any thyroid medications.",
                "description": "Assesses thyroid gland function and helps diagnose hyperthyroidism or hypothyroidism."
            },
            {
                "name": "Liver Function Test (LFT)",
                "slug": "lft",
                "price": 499.00,
                "tat": "12 Hours",
                "sample_type": "Blood",
                "priority": "ROUTINE",
                "preparation_required": "Fasting of 8-10 hours is mandatory.",
                "home_collection_available": True,
                "home_collection_notes": "Avoid alcohol 24 hours prior to sample collection.",
                "description": "Measures levels of proteins, liver enzymes, and bilirubin in your blood."
            }
        ]
        test_objs = []
        for test in tests_data:
            t = db.query(Test).filter(Test.slug == test["slug"]).first()
            if not t:
                t = Test(
                    branch_id=branch.id,
                    category_id=cat_objs["blood-tests"].id,
                    name=test["name"],
                    slug=test["slug"],
                    description=test["description"],
                    price=test["price"],
                    tat=test["tat"],
                    sample_type=test["sample_type"],
                    priority=test["priority"],
                    preparation_required=test["preparation_required"],
                    home_collection_available=test["home_collection_available"],
                    home_collection_notes=test["home_collection_notes"]
                )
                db.add(t)
                db.flush()
            test_objs.append(t)

        # 6. Create Packages
        print("Seeding packages...")
        comprehensive = db.query(Package).filter(Package.slug == "comprehensive-health-package").first()
        if not comprehensive:
            comprehensive = Package(
                branch_id=branch.id,
                name="Comprehensive Health Package",
                slug="comprehensive-health-package",
                description="Includes CBC, Liver Function Test (LFT), and Thyroid Profile at a bundle discount.",
                price=1397.00,
                discount_price=1199.00
            )
            comprehensive.tests = [t for t in test_objs if t.slug in ["cbc", "lft", "thyroid-profile"]]
            db.add(comprehensive)
            db.flush()

        packages_data = [
            {
                "name": "Basic Health Checkup",
                "slug": "basic-health-checkup",
                "description": "Essential screening package evaluating overall health, blood sugar, lipid levels, thyroid, liver, and kidney function.",
                "price": 1499.00,
                "discount_price": 999.00,
                "test_slugs": [
                    "cbc", "glucose-fasting-fbs", "glycosylated-hba1c", "lipid-profile", 
                    "lft", "renal-profilerft-or-kft", "urine-complete-analysis-cue-urine", 
                    "tsh-thyroid-stimulating-hormone-ultra"
                ]
            },
            {
                "name": "Diabetes Profile",
                "slug": "diabetes-profile",
                "description": "Comprehensive panel for monitoring and diagnosing blood sugar levels, long-term glycemic control, and secondary diabetic implications on kidneys and lipids.",
                "price": 1999.00,
                "discount_price": 1499.00,
                "test_slugs": [
                    "glycosylated-hba1c", "glucose-fasting-fbs", "glucose-post-lunch", 
                    "urine-glucose-r", "micro-albumin-urine", "renal-profilerft-or-kft", 
                    "lipid-profile"
                ]
            },
            {
                "name": "Thyroid Profile",
                "slug": "thyroid-profile-package",
                "description": "Evaluates thyroid gland activity. Includes free and total thyroid hormones to screen for hyperthyroidism and hypothyroidism.",
                "price": 999.00,
                "discount_price": 799.00,
                "test_slugs": [
                    "thyroid-profile", "free-t3-triiodothyronine-free-t3", "free-t4-thyroxine-free", 
                    "tsh-thyroid-stimulating-hormone-ultra", "total-t4-thyroxine-t4"
                ]
            },
            {
                "name": "Heart Health Package",
                "slug": "heart-health-package",
                "description": "Cardiovascular screening package including lipid analysis, cardiac inflammatory marker (CRP), ECG, glucose, and metabolic status.",
                "price": 2499.00,
                "discount_price": 1999.00,
                "test_slugs": [
                    "cbc", "lipid-profile", "digital-ecg", "crp-c-reactive-protein", 
                    "glucose-fasting-fbs", "lft", "renal-profilerft-or-kft"
                ]
            },
            {
                "name": "Women's Health Package",
                "slug": "womens-health-package",
                "description": "Specifically designed checkup for women, focusing on bone health, anemia, vitamins, thyroid function, and diabetic screening.",
                "price": 2999.00,
                "discount_price": 2499.00,
                "test_slugs": [
                    "cbc", "glycosylated-hba1c", "lipid-profile", "thyroid-profile", 
                    "vitamin-d", "vitamin-b12-active-holotranscobalamin", "calcium", 
                    "iron-studies", "urine-complete-analysis-cue-urine"
                ]
            },
            {
                "name": "Senior Citizen Health Package",
                "slug": "senior-citizen-health-package",
                "description": "Full body geriatric screening panel covering critical parameters for elder care including cardiac, kidney, liver, vitamins, and metabolic functions.",
                "price": 4499.00,
                "discount_price": 3499.00,
                "test_slugs": [
                    "cbc", "glycosylated-hba1c", "glucose-fasting-fbs", "lipid-profile", 
                    "lft", "renal-profilerft-or-kft", "vitamin-d", "vitamin-b12-active-holotranscobalamin", 
                    "thyroid-profile", "digital-ecg", "urine-complete-analysis-cue-urine"
                ]
            }
        ]

        for pkg in packages_data:
            package = db.query(Package).filter(Package.slug == pkg["slug"]).first()
            if not package:
                package = Package(
                    branch_id=branch.id,
                    name=pkg["name"],
                    slug=pkg["slug"],
                    description=pkg["description"],
                    price=pkg["price"],
                    discount_price=pkg["discount_price"],
                    is_active=True
                )
                db.add(package)
                db.flush()
            
            # Always sync tests to ensure packages are fully populated once tests are seeded!
            package.tests = db.query(Test).filter(Test.slug.in_(pkg["test_slugs"])).all()


        # 7. Create Reviews
        print("Seeding reviews...")
        reviews = [
            {"name": "Ramesh K.", "rating": 5, "text": "Extremely fast reports! I booked the slot in under 2 minutes, and got the PDF on WhatsApp the next day."},
            {"name": "Sireesha M.", "rating": 5, "text": "The Home Collection was flawless. Phlebotomist arrived exactly on time, checked my verification OTP, and was very professional."},
            {"name": "Bhargav V.", "rating": 5, "text": "Bilingual layout is excellent. My mother could read the preparation instructions in Telugu, ensuring she fasted correctly for LFT."}
        ]
        for rev in reviews:
            review = db.query(Review).filter(Review.patient_name == rev["name"]).first()
            if not review:
                review = Review(
                    patient_name=rev["name"],
                    rating=rev["rating"],
                    review_text=rev["text"],
                    status="APPROVED",
                    approved_by_id=user.id,
                    approved_date=datetime.datetime.utcnow()
                )
                db.add(review)

        # 8. Create Blogs
        print("Seeding blogs...")
        blogs_data = [
            {
                "title": "Understanding Your Liver Function Test (LFT) Results",
                "slug": "understanding-lft-results",
                "excerpt": "A detailed guide on interpreting bilirubin, SGOT, and SGPT levels in your liver health report.",
                "content": "Your liver plays a critical role in filtering toxins, digesting fats, and synthesis of proteins. An LFT measures vital indicators to verify liver performance. Elevated SGPT/SGOT typically points to liver stress. Ensure a 10-hour fasting prior to blood draw.",
                "author": "Dr. A. Srinivas, Pathologist"
            },
            {
                "title": "The Vital Importance of Vitamin D in Muscle and Bone Health",
                "slug": "importance-of-vitamin-d",
                "excerpt": "Deficiency is rising among city dwellers. Understand the symptoms, testing requirements, and recovery plans.",
                "content": "Vitamin D is unique as it functions like a hormone in regulating calcium intake. Lack of exposure to early morning sunlight causes silent deficiencies. Get checked annually. 25-Hydroxy Vitamin D test is the clinical standard.",
                "author": "Dr. K. Anuradha, Clinical Biochemist"
            }
        ]
        for blog in blogs_data:
            b = db.query(Blog).filter(Blog.slug == blog["slug"]).first()
            if not b:
                b = Blog(
                    title=blog["title"],
                    slug=blog["slug"],
                    excerpt=blog["excerpt"],
                    content=blog["content"],
                    author_name=blog["author"],
                    status="PUBLISH",
                    meta_title=blog["title"],
                    meta_description=blog["excerpt"],
                    publish_date=datetime.datetime.utcnow()
                )
                db.add(b)

        db.commit()
        print("Database seeded successfully with all roles, users, blogs, and reviews!")
    except Exception as e:
        db.rollback()
        print("Error seeding database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
