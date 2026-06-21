from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.database import get_db
from app.models import Test, Package, TestCategory
from app.schemas import TestResponse, PackageResponse

router = APIRouter(prefix="/catalog", tags=["catalog"])

@router.get("/tests", response_model=List[TestResponse])
def list_tests(
    branch_id: Optional[UUID] = None, 
    sample_type: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    """Lists all active tests, optionally filtered by branch, sample type, priority, or category."""
    query = db.query(Test).filter(Test.is_active == True)
    
    if branch_id:
        query = query.filter(Test.branch_id == branch_id)
    if sample_type:
        query = query.filter(Test.sample_type == sample_type)
    if priority:
        query = query.filter(Test.priority == priority)
    if category_id:
        query = query.filter(Test.category_id == category_id)
        
    return query.all()


@router.get("/tests/{slug}", response_model=TestResponse)
def get_test_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieves detailed test instructions and details by its slug."""
    test = db.query(Test).filter(Test.slug == slug, Test.is_active == True).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found.")
    return test


@router.get("/packages", response_model=List[PackageResponse])
def list_packages(branch_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    """Lists all health packages, optionally filtered by branch."""
    query = db.query(Package).filter(Package.is_active == True)
    if branch_id:
        query = query.filter(Package.branch_id == branch_id)
    return query.all()


@router.get("/packages/{slug}", response_model=PackageResponse)
def get_package_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieves detailed health package information by its slug."""
    package = db.query(Package).filter(Package.slug == slug, Package.is_active == True).first()
    if not package:
        raise HTTPException(status_code=404, detail="Package not found.")
    return package
