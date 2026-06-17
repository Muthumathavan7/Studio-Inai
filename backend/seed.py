"""Seed initial Studio Inai data on first launch."""
import os
from datetime import datetime, timezone
from auth import hash_password, verify_password
from models import SiteContent, Service, TeamMember, Project, Availability


async def seed_admin(db):
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@studioinai.com")
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({
            "_id": "admin_user",
            "email": admin_email,
            "password_hash": hash_password(admin_password),
            "name": "Studio Inai Admin",
            "role": "admin",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one(
            {"email": admin_email},
            {"$set": {"password_hash": hash_password(admin_password)}},
        )


async def seed_site_content(db):
    if await db.site_content.find_one({"_id": "site_content"}) is None:
        content = SiteContent().model_dump()
        content["_id"] = content.pop("id")
        await db.site_content.insert_one(content)
    else:
        # One-time migration: refresh hero_image if it's still the original pexels seed URL
        old_url = "https://images.pexels.com/photos/3137050/pexels-photo-3137050.jpeg"
        new_url = "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=2400&q=85&auto=format&fit=crop"
        await db.site_content.update_one(
            {"_id": "site_content", "hero_image": old_url},
            {"$set": {"hero_image": new_url}},
        )


async def seed_availability(db):
    if await db.availability.find_one({"_id": "availability"}) is None:
        a = Availability().model_dump()
        a["_id"] = a.pop("id")
        await db.availability.insert_one(a)


async def seed_services(db):
    if await db.services.count_documents({}) == 0:
        items = [
            ("Architecture", "Residential, commercial and institutional buildings crafted from concept to completion.", "Building2", 1),
            ("Interior Design", "Interiors that resonate with the architectural intent — material, light and detail.", "LampDesk", 2),
            ("Urban Design", "Master planning, feasibility, and adaptive reuse at the scale of neighbourhoods.", "MapPinned", 3),
            ("Planning & Consultancy", "Strategic business cases, feasibility studies and integrated project delivery.", "Compass", 4),
            ("Sustainable Design", "LEED & Green Mark accredited consultancy focused on long-term performance.", "Leaf", 5),
            ("Vastu-aligned Design", "Vastu-compliant residential design rooted in Tamil Nadu's architectural heritage.", "Sparkles", 6),
        ]
        for title, desc, icon, order in items:
            s = Service(title=title, description=desc, icon=icon, order=order).model_dump()
            s["_id"] = s.pop("id")
            await db.services.insert_one(s)


async def seed_team(db):
    if await db.team.count_documents({}) == 0:
        members = [
            (
                "Ar. Prashanth Ganesh",
                "Principal Partner",
                "Prashanth brings over 13 years of architectural experience, including previous work with Spacescape Architects, Chennai. His approach combines functionality, aesthetics, and practicality, with a strong focus on high-end residential and commercial projects across Chennai. With travel across 18 countries and five continents, he brings a broad cultural perspective and contemporary design sensibility.",
                "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
                1,
            ),
            (
                "Ar. Deepak Sankaranarayanan",
                "Principal Collaborator",
                "Deepak is an architect, urban designer, and master planner with over 12 years of professional experience across Singapore, India, and Germany. Notable projects include the National University of Singapore (NUS) Master Plan, Jurong Innovation District (JID), and modular construction studies in Singapore.",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
                2,
            ),
            (
                "Ar. Sindhu Prashanth",
                "Senior Associate",
                "Sindhu is a multidisciplinary artist and architect with over 10 years of experience in residential design. Originally from Devakottai in the Chettinad region, she draws inspiration from its rich architectural heritage. She has worked extensively across Tamil Nadu with expertise in residential architecture and Vastu-compliant design.",
                "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
                3,
            ),
            (
                "Ar. Vaishnavi Sai Sudhakar",
                "Senior Associate",
                "Vaishnavi is an architect and sustainability consultant with over 12 years of experience in India and Singapore. LEED Green Associate (USGBC), BCA Green Mark Accredited Professional (Singapore), and TRUE Advisor. Her work spans public, commercial, industrial, institutional, hospitality, and residential projects.",
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80",
                4,
            ),
        ]
        for name, title, bio, image, order in members:
            m = TeamMember(name=name, title=title, bio=bio, image=image, order=order).model_dump()
            m["_id"] = m.pop("id")
            await db.team.insert_one(m)


async def seed_projects(db):
    if await db.projects.count_documents({}) == 0:
        projects = [
            ("Casa Anantara", "Residential", "Chennai, TN", "2023",
             "A contemporary residence woven around a central courtyard, balancing privacy with open lateral connections to landscape.",
             "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
             ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
              "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80"], True, 1),
            ("Lighthouse Studio", "Commercial", "Bengaluru, KA", "2022",
             "A flexible workspace defined by oak ribs and a quiet, neutral material palette.",
             "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80",
             ["https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80"], True, 2),
            ("Through the Layers", "Residential", "Chennai, TN", "2021",
             "Layered facades and screens negotiate privacy, ventilation and the southern Indian climate.",
             "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
             [], True, 3),
            ("The Montessori House", "Institutional", "Coimbatore, TN", "2020",
             "A child-scaled learning environment shaped around exploration, daylight and tactile material.",
             "https://images.unsplash.com/photo-1588072432836-e10032774350?w=1600&q=80",
             [], False, 4),
            ("Periamet Loft", "Interior", "Chennai, TN", "2023",
             "An interior renovation that re-imagines an inner-city floor as a calm, light-filled retreat.",
             "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1600&q=80",
             [], False, 5),
            ("Coastal Pavilion", "Residential", "ECR, TN", "2022",
             "A breezy seaside home conceived as a pavilion under a single floating roof.",
             "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
             [], False, 6),
            ("Adaptive Reuse: Mill House", "Urban", "Chennai, TN", "2021",
             "Adaptive reuse of a colonial-era mill into a mixed-use cultural and commercial precinct.",
             "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=1600&q=80",
             [], False, 7),
            ("Karur Residence", "Residential", "Karur, TN", "2020",
             "A Vastu-aligned home that pairs traditional planning with a quietly contemporary expression.",
             "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80",
             [], False, 8),
        ]
        for title, cat, loc, year, desc, cover, images, featured, order in projects:
            p = Project(title=title, category=cat, location=loc, year=year, description=desc,
                        cover_image=cover, images=images, featured=featured, order=order).model_dump()
            p["_id"] = p.pop("id")
            await db.projects.insert_one(p)


async def seed_all(db):
    await seed_admin(db)
    await seed_site_content(db)
    await seed_availability(db)
    await seed_services(db)
    await seed_team(db)
    await seed_projects(db)
