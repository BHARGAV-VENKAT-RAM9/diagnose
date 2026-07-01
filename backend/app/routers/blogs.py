from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

from app.database import get_db
from app.models import Blog
from app.routers.auth import get_admin_user

router = APIRouter(prefix="/blogs", tags=["blogs"])

class BlogCreate(BaseModel):
    title: str = Field(..., max_length=200)
    slug: str = Field(..., max_length=200)
    excerpt: Optional[str] = None
    content: str
    author_name: str = Field(..., max_length=100)
    featured_image: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None

class BlogResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    excerpt: Optional[str]
    content: str
    author_name: str
    featured_image: Optional[str]
    status: str
    publish_date: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/", response_model=List[BlogResponse])
def list_blogs(db: Session = Depends(get_db)):
    """Lists all published blogs for patient education and SEO."""
    return db.query(Blog).filter(Blog.status == "PUBLISH").order_by(Blog.publish_date.desc()).all()


@router.get("/all", response_model=List[BlogResponse])
def list_all_blogs_admin(db: Session = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    """Lists all blogs (drafts, published, etc.) for administrative dashboards."""
    return db.query(Blog).order_by(Blog.created_at.desc()).all()


@router.get("/{slug}", response_model=BlogResponse)
def get_blog_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieves blog details by its slug."""
    blog = db.query(Blog).filter(Blog.slug == slug).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog article not found.")
    return blog


@router.post("/", response_model=BlogResponse, status_code=status.HTTP_201_CREATED)
def create_blog(payload: BlogCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    """Enables staff to draft a new blog article."""
    # Check if slug is unique
    existing = db.query(Blog).filter(Blog.slug == payload.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="A blog with this slug already exists.")

    blog = Blog(
        title=payload.title,
        slug=payload.slug,
        excerpt=payload.excerpt,
        content=payload.content,
        featured_image=payload.featured_image,
        author_name=payload.author_name,
        status="CREATE", # Starts in Draft/Create stage
        meta_title=payload.meta_title or payload.title,
        meta_description=payload.meta_description or payload.excerpt
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)
    return blog


@router.post("/publish/{blog_id}", response_model=BlogResponse)
def publish_blog(blog_id: UUID, db: Session = Depends(get_db), current_user: dict = Depends(get_admin_user)):
    """Publishes a drafted/reviewed blog post."""
    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found.")
    
    blog.status = "PUBLISH"
    blog.publish_date = datetime.utcnow()
    db.commit()
    db.refresh(blog)
    return blog
