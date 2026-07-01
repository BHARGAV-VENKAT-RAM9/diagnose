from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import bookings, reports, tests, auth, admin, blogs

app = FastAPI(
    title="Diagnostic Centre Platform API",
    description="Backend API for Booking and Report Management with OTP authorization and slot locking.",
    version="1.0.0"
)

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    return response

class NormalizePathMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope["type"] == "http":
            path = scope.get("path", "")
            if "//" in path:
                import re
                scope["path"] = re.sub(r"/+", "/", path)
        await self.app(scope, receive, send)

app.add_middleware(NormalizePathMiddleware)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    error_messages = []
    for error in exc.errors():
        loc = " -> ".join([str(x) for x in error["loc"]])
        msg = error["msg"]
        error_messages.append(f"{loc}: {msg}")
    detailed_msg = " | ".join(error_messages)
    print("Validation Error Details:", detailed_msg)
    return JSONResponse(
        status_code=422,
        content={"detail": detailed_msg}
    )

@app.on_event("startup")
def on_startup():
    from app.database import engine
    from app.models import Base
    from app.seed import seed_db
    
    print("Verifying database schema...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Database schema checked/created successfully.")
    except Exception as err:
        print("Warning: Database connection/schema generation failed during startup:", err)
        
    print("Verifying database seeded data...")
    try:
        seed_db()
    except Exception as err:
        print("Warning: Database seeding failed during startup:", err)

# Register routers
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(tests.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(blogs.router, prefix="/api/v1")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "system": "Diagnostic Centre API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
