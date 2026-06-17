from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid


def gen_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ========== AUTH ==========
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


# ========== SITE CONTENT (singleton) ==========
class SiteContent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: "site_content")
    # Hero
    hero_overline: str = "Studio Inai"
    hero_title: str = "Architecture as a quiet, lasting gesture."
    hero_subtitle: str = "Architecture · Urban Design · Planning · Interior"
    hero_image: str = "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=2400&q=85&auto=format&fit=crop"
    hero_cta_label: str = "Book a Consultation"
    # About
    about_overline: str = "Our Story"
    about_title: str = "A placemaking design practice."
    about_body: str = (
        "Studio Inai is a placemaking design practice. We combine architectural, spatial and "
        "experiential design to create places that add value to people's lives. "
        "Established in 2014 and headed by Ar. Prashanth Ganesh and Ar. Deepak Sankaranarayanan, "
        "our work spans architecture, interiors, urban design and master planning."
    )
    about_image: str = "https://images.unsplash.com/photo-1598367815092-a2c0cbc1ea3d"
    # Philosophy pillars
    pillar_1_title: str = "Place"
    pillar_1_body: str = "Designs that respond to context, climate and culture."
    pillar_2_title: str = "People"
    pillar_2_body: str = "Spaces shaped around lived experience and wellbeing."
    pillar_3_title: str = "Pattern"
    pillar_3_body: str = "A meticulous, detail-led approach to material and form."
    pillar_4_title: str = "Practice"
    pillar_4_body: str = "From feasibility to delivery, on time and on budget."
    # Contact
    contact_email: str = "info@studioinai.com"
    contact_email_2: str = "prashanth@studioinai.com"
    contact_phone: str = "+91 98417 25679"
    contact_phone_2: str = "044 25612277"
    contact_whatsapp: str = "9841725679"
    contact_address: str = "No.78, 5th floor, Golden Tower, EVR Periyar Salai, Periamet, Chennai – 600 003"
    instagram: str = "https://instagram.com/studioinai"
    facebook: str = ""
    # Map
    map_embed_url: str = "https://www.google.com/maps?q=Periamet,Chennai&output=embed"


class SiteContentUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    hero_overline: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_image: Optional[str] = None
    hero_cta_label: Optional[str] = None
    about_overline: Optional[str] = None
    about_title: Optional[str] = None
    about_body: Optional[str] = None
    about_image: Optional[str] = None
    pillar_1_title: Optional[str] = None
    pillar_1_body: Optional[str] = None
    pillar_2_title: Optional[str] = None
    pillar_2_body: Optional[str] = None
    pillar_3_title: Optional[str] = None
    pillar_3_body: Optional[str] = None
    pillar_4_title: Optional[str] = None
    pillar_4_body: Optional[str] = None
    contact_email: Optional[str] = None
    contact_email_2: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_phone_2: Optional[str] = None
    contact_whatsapp: Optional[str] = None
    contact_address: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    map_embed_url: Optional[str] = None


# ========== SERVICES ==========
class Service(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    title: str
    description: str
    icon: str = "Compass"  # lucide icon name
    order: int = 0


class ServiceCreate(BaseModel):
    title: str
    description: str
    icon: str = "Compass"
    order: int = 0


# ========== TEAM ==========
class TeamMember(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    name: str
    title: str
    bio: str
    image: str = ""
    order: int = 0


class TeamMemberCreate(BaseModel):
    name: str
    title: str
    bio: str
    image: str = ""
    order: int = 0


# ========== PROJECTS (PORTFOLIO) ==========
class Project(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    title: str
    category: str  # Residential, Commercial, Institutional, Interior, Urban
    location: str = ""
    year: str = ""
    description: str = ""
    cover_image: str
    images: List[str] = []
    featured: bool = False
    order: int = 0


class ProjectCreate(BaseModel):
    title: str
    category: str
    location: str = ""
    year: str = ""
    description: str = ""
    cover_image: str
    images: List[str] = []
    featured: bool = False
    order: int = 0


# ========== CONTACT MESSAGES ==========
class ContactMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    name: str
    email: EmailStr
    phone: str = ""
    subject: str = ""
    message: str
    read: bool = False
    created_at: str = Field(default_factory=now_iso)


class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    subject: str = ""
    message: str


# ========== BOOKINGS / MEETING SCHEDULE ==========
class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=gen_id)
    name: str
    email: EmailStr
    phone: str = ""
    company: str = ""
    service: str = "General Consultation"  # which service
    date: str  # YYYY-MM-DD
    time: str  # HH:MM
    duration_minutes: int = 30
    notes: str = ""
    status: str = "pending"  # pending, confirmed, cancelled, completed
    meeting_link: str = ""  # admin pastes Google Meet link here
    admin_notes: str = ""
    created_at: str = Field(default_factory=now_iso)


class BookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    company: str = ""
    service: str = "General Consultation"
    date: str
    time: str
    duration_minutes: int = 30
    notes: str = ""


class BookingUpdate(BaseModel):
    status: Optional[str] = None
    meeting_link: Optional[str] = None
    admin_notes: Optional[str] = None


# ========== AVAILABILITY ==========
class Availability(BaseModel):
    """Singleton config for booking availability."""
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: "availability")
    # Weekly schedule: list of available HH:MM slots per weekday
    # 0=Mon, 1=Tue, ..., 6=Sun
    weekday_slots: dict = Field(
        default_factory=lambda: {
            "0": ["10:00", "11:00", "14:00", "15:00", "16:00"],
            "1": ["10:00", "11:00", "14:00", "15:00", "16:00"],
            "2": ["10:00", "11:00", "14:00", "15:00", "16:00"],
            "3": ["10:00", "11:00", "14:00", "15:00", "16:00"],
            "4": ["10:00", "11:00", "14:00", "15:00", "16:00"],
            "5": ["10:00", "11:00"],
            "6": [],
        }
    )
    blocked_dates: List[str] = []  # YYYY-MM-DD
    services: List[str] = Field(
        default_factory=lambda: [
            "General Consultation",
            "Residential Architecture",
            "Commercial Architecture",
            "Interior Design",
            "Urban Design / Master Planning",
        ]
    )


class AvailabilityUpdate(BaseModel):
    weekday_slots: Optional[dict] = None
    blocked_dates: Optional[List[str]] = None
    services: Optional[List[str]] = None
