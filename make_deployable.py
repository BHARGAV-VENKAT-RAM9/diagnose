import os

files_to_update = [
    r"admin-frontend/src/app/dashboard/page.tsx",
    r"admin-frontend/src/app/login/page.tsx",
    r"frontend/src/app/blogs/page.tsx",
    r"frontend/src/app/booking/page.tsx",
    r"frontend/src/app/corporate/page.tsx",
    r"frontend/src/app/packages/[slug]/page.tsx",
    r"frontend/src/app/page.tsx",
    r"frontend/src/app/tests/[slug]/page.tsx"
]

root_dir = r"c:\Users\bharg\Desktop\Vicky"

for f_rel in files_to_update:
    path = os.path.join(root_dir, f_rel)
    if not os.path.exists(path):
        print(f"Skipping {f_rel} (does not exist)")
        continue
        
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Replace double-quoted local API URLs
    updated = content.replace('"http://localhost:8000', '(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "')
    
    # Replace backtick-quoted local API URLs
    updated = updated.replace('`http://localhost:8000', '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}')
    
    if updated != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(updated)
        print(f"Successfully updated API URLs in {f_rel}")
    else:
        print(f"No changes needed in {f_rel}")
