import os
import re
import json
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Branch, TestCategory, Test

def generate_slug(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug.strip('-')

def parse_and_seed():
    txt_path = r"c:\Users\bharg\Desktop\New Text Document.txt"
    if not os.path.exists(txt_path):
        print(f"Error: {txt_path} not found.")
        return

    with open(txt_path, "r", encoding="utf-8") as f:
        lines = [line.strip() for line in f.readlines() if line.strip()]

    tests = []
    i = 0
    while i < len(lines) - 1:
        name = lines[i]
        price_line = lines[i+1]
        
        if len(name) <= 2 and name.isalpha():
            i += 1
            continue

        if price_line.startswith("₹"):
            try:
                price = float(price_line.replace("₹", "").strip())
                tests.append({"name": name, "price": price})
                i += 2
            except ValueError:
                i += 1
        else:
            i += 1

    print(f"Parsed {len(tests)} tests from text document.")

    # Deduplicate by name
    unique_tests = {}
    for t in tests:
        unique_tests[t["name"]] = t
    tests = list(unique_tests.values())
    print(f"Deduplicated to {len(tests)} unique tests.")

    db = SessionLocal()
    try:
        branch = db.query(Branch).first()
        if not branch:
            print("No branch found in DB, seeding branch first...")
            branch = Branch(
                name="Main Branch",
                city="Hyderabad",
                address="101 Diagnostic Towers, Madhapur, Hyderabad",
                phone="+919876543210"
            )
            db.add(branch)
            db.flush()

        categories = {
            "Blood Tests": db.query(TestCategory).filter(TestCategory.name == "Blood Tests").first(),
            "Urine Tests": db.query(TestCategory).filter(TestCategory.name == "Urine Tests").first(),
            "Radiology": db.query(TestCategory).filter(TestCategory.name == "Radiology").first()
        }

        for cat_name in ["Blood Tests", "Urine Tests", "Radiology"]:
            if not categories[cat_name]:
                slug = generate_slug(cat_name)
                cat = TestCategory(name=cat_name, slug=slug, description=f"{cat_name} category")
                db.add(cat)
                db.flush()
                categories[cat_name] = cat

        print("Inserting tests into database...")
        db_tests_count = 0
        local_fallback_tests = []

        # Optimize: Fetch all existing tests at once to avoid N database queries
        all_db_tests = {t_obj.name: t_obj for t_obj in db.query(Test).all()}

        import uuid
        for idx, t in enumerate(tests):
            name = t["name"]
            price = t["price"]
            slug = generate_slug(name)
            
            original_slug = slug
            collision_counter = 1
            while any(lt["slug"] == slug for lt in local_fallback_tests):
                slug = f"{original_slug}-{collision_counter}"
                collision_counter += 1

            name_upper = name.upper()
            if any(kw in name_upper for kw in ["XRAY", "X-RAY", "X RAY", "CBCT", "OPG", "MRI", "CT ", "CT-", "ULTRASOUND", "SONO", "ANGIOGRAM", "COLONOSCOPY", "AUDIOMETRY", "PFT"]):
                category = "Radiology"
                sample_type = "Radiology"
                home_collection = False
            elif "URINE" in name_upper:
                category = "Urine Tests"
                sample_type = "Urine"
                home_collection = True
            elif "STOOL" in name_upper:
                category = "Urine Tests"
                sample_type = "Stool"
                home_collection = True
            else:
                category = "Blood Tests"
                sample_type = "Blood"
                home_collection = True

            description = f"Clinical laboratory testing for {name}. High accuracy report delivered within standard turnaround time."
            tat = "24 Hours" if category == "Radiology" else "12 Hours"
            prep = "Fasting recommended." if "FASTING" in name_upper or "GLUCOSE" in name_upper or "LIPID" in name_upper else "No special preparation required."

            db_t = all_db_tests.get(name)
            
            if not db_t:
                test_id = uuid.uuid5(uuid.NAMESPACE_DNS, slug)
                db_t = Test(
                    id=test_id,
                    branch_id=branch.id,
                    category_id=categories[category].id,
                    name=name,
                    slug=slug,
                    description=description,
                    price=price,
                    tat=tat,
                    sample_type=sample_type,
                    priority="ROUTINE",
                    preparation_required=prep,
                    home_collection_available=home_collection,
                    home_collection_notes="Drink plenty of water before collection." if home_collection else None
                )
                db.add(db_t)
                db_tests_count += 1
                # Add to local map so subsequent duplicates in loop are handled
                all_db_tests[name] = db_t
            
            resolved_id = str(db_t.id)

            local_fallback_tests.append({
                "id": resolved_id,
                "name": name,
                "slug": slug,
                "price": price,
                "tat": tat,
                "sample_type": sample_type,
                "priority": "ROUTINE",
                "preparation": prep,
                "home_collection": home_collection,
                "home_notes": "Avoid heavy meals just before." if home_collection else None,
                "description": description
            })

        db.commit()
        print(f"Seeded {db_tests_count} new tests into database.")

        frontend_json_dir = r"c:\Users\bharg\Desktop\Vicky\frontend\src\app\data"
        os.makedirs(frontend_json_dir, exist_ok=True)
        frontend_json_path = os.path.join(frontend_json_dir, "local_tests.json")
        with open(frontend_json_path, "w", encoding="utf-8") as json_file:
            json.dump(local_fallback_tests, json_file, indent=2)
        print(f"Wrote {len(local_fallback_tests)} tests to frontend local fallback: {frontend_json_path}")

    except Exception as e:
        db.rollback()
        print("Error during database seeding:", e)
    finally:
        db.close()

if __name__ == "__main__":
    parse_and_seed()
