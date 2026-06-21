from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import bookings, reports, tests, auth, admin, blogs

app = FastAPI(
    title="Diagnostic Centre Platform API",
    description="Backend API for Booking and Report Management with OTP authorization and slot locking.",
    version="1.0.0"
)

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
