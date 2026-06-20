from dotenv import load_dotenv
from pathlib import Path
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from auth import (
    hash_password, verify_password,
    create_access_token, get_current_admin,
)
from models import (
    LoginRequest, LoginResponse,
    SiteContent, SiteContentUpdate,
    Service, ServiceCreate,
    TeamMember, TeamMemberCreate,
    Project, ProjectCreate,
    ContactMessage, ContactMessageCreate,
    Booking, BookingCreate, BookingUpdate,
    Availability, AvailabilityUpdate,
)
from seed import seed_all
from storage import init_storage, put_object, get_object, make_upload_path


# ===== DB =====
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]


app = FastAPI(title="Studio Inai API")
api = APIRouter(prefix="/api")


def _strip_id(doc: dict) -> dict:
    """Rename _id -> id for response, drop nothing else."""
    if doc is None:
        return doc
    if "_id" in doc:
        doc["id"] = doc.pop("_id")
    return doc


# ===== HEALTH =====
@api.get("/")
async def root():
    return {"service": "Studio Inai API", "status": "ok"}


# ===== AUTH =====
@api.post("/auth/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user_id=str(user["_id"]), email=user["email"])
    return LoginResponse(access_token=token, email=user["email"])


@api.get("/auth/me")
async def me(admin=Depends(get_current_admin)):
    return admin


# ===== SITE CONTENT =====
@api.get("/content")
async def get_content():
    doc = await db.site_content.find_one({"_id": "site_content"})
    if not doc:
        # initial fallback
        return SiteContent().model_dump()
    return _strip_id(doc)


@api.put("/content")
async def update_content(update: SiteContentUpdate, admin=Depends(get_current_admin)):
    fields = {k: v for k, v in update.model_dump(exclude_unset=True).items() if v is not None}
    if fields:
        await db.site_content.update_one(
            {"_id": "site_content"},
            {"$set": fields},
            upsert=True,
        )
    doc = await db.site_content.find_one({"_id": "site_content"})
    return _strip_id(doc)


# ===== SERVICES =====
@api.get("/services")
async def list_services():
    cursor = db.services.find({}).sort("order", 1)
    items = [_strip_id(d) async for d in cursor]
    return items


@api.post("/services")
async def create_service(payload: ServiceCreate, admin=Depends(get_current_admin)):
    s = Service(**payload.model_dump()).model_dump()
    s["_id"] = s.pop("id")
    await db.services.insert_one(s)
    return _strip_id(s)


@api.put("/services/{sid}")
async def update_service(sid: str, payload: ServiceCreate, admin=Depends(get_current_admin)):
    res = await db.services.update_one({"_id": sid}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Service not found")
    doc = await db.services.find_one({"_id": sid})
    return _strip_id(doc)


@api.delete("/services/{sid}")
async def delete_service(sid: str, admin=Depends(get_current_admin)):
    await db.services.delete_one({"_id": sid})
    return {"ok": True}


# ===== TEAM =====
@api.get("/team")
async def list_team():
    cursor = db.team.find({}).sort("order", 1)
    return [_strip_id(d) async for d in cursor]


@api.post("/team")
async def create_team(payload: TeamMemberCreate, admin=Depends(get_current_admin)):
    m = TeamMember(**payload.model_dump()).model_dump()
    m["_id"] = m.pop("id")
    await db.team.insert_one(m)
    return _strip_id(m)


@api.put("/team/{tid}")
async def update_team(tid: str, payload: TeamMemberCreate, admin=Depends(get_current_admin)):
    res = await db.team.update_one({"_id": tid}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Member not found")
    doc = await db.team.find_one({"_id": tid})
    return _strip_id(doc)


@api.delete("/team/{tid}")
async def delete_team(tid: str, admin=Depends(get_current_admin)):
    await db.team.delete_one({"_id": tid})
    return {"ok": True}


# ===== PROJECTS =====
@api.get("/projects")
async def list_projects(category: Optional[str] = None, featured: Optional[bool] = None):
    q = {}
    if category and category.lower() != "all":
        q["category"] = category
    if featured is not None:
        q["featured"] = featured
    cursor = db.projects.find(q).sort("order", 1)
    return [_strip_id(d) async for d in cursor]


@api.get("/projects/{pid}")
async def get_project(pid: str):
    doc = await db.projects.find_one({"_id": pid})
    if not doc:
        raise HTTPException(404, "Project not found")
    return _strip_id(doc)


@api.post("/projects")
async def create_project(payload: ProjectCreate, admin=Depends(get_current_admin)):
    p = Project(**payload.model_dump()).model_dump()
    p["_id"] = p.pop("id")
    await db.projects.insert_one(p)
    return _strip_id(p)


@api.put("/projects/{pid}")
async def update_project(pid: str, payload: ProjectCreate, admin=Depends(get_current_admin)):
    res = await db.projects.update_one({"_id": pid}, {"$set": payload.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(404, "Project not found")
    doc = await db.projects.find_one({"_id": pid})
    return _strip_id(doc)


@api.delete("/projects/{pid}")
async def delete_project(pid: str, admin=Depends(get_current_admin)):
    await db.projects.delete_one({"_id": pid})
    return {"ok": True}


# ===== CONTACT MESSAGES =====
@api.post("/contact")
async def submit_contact(payload: ContactMessageCreate):
    m = ContactMessage(**payload.model_dump()).model_dump()
    m["_id"] = m.pop("id")
    await db.messages.insert_one(m)
    return {"ok": True, "id": m["_id"]}


@api.get("/admin/messages")
async def list_messages(admin=Depends(get_current_admin)):
    cursor = db.messages.find({}).sort("created_at", -1)
    return [_strip_id(d) async for d in cursor]


@api.put("/admin/messages/{mid}/read")
async def mark_message_read(mid: str, admin=Depends(get_current_admin)):
    await db.messages.update_one({"_id": mid}, {"$set": {"read": True}})
    return {"ok": True}


@api.delete("/admin/messages/{mid}")
async def delete_message(mid: str, admin=Depends(get_current_admin)):
    await db.messages.delete_one({"_id": mid})
    return {"ok": True}


# ===== AVAILABILITY (public + admin) =====
@api.get("/availability")
async def get_availability():
    doc = await db.availability.find_one({"_id": "availability"})
    if not doc:
        return Availability().model_dump()
    return _strip_id(doc)


@api.put("/admin/availability")
async def update_availability(update: AvailabilityUpdate, admin=Depends(get_current_admin)):
    fields = {k: v for k, v in update.model_dump(exclude_unset=True).items() if v is not None}
    if fields:
        await db.availability.update_one(
            {"_id": "availability"},
            {"$set": fields},
            upsert=True,
        )
    doc = await db.availability.find_one({"_id": "availability"})
    return _strip_id(doc)


@api.get("/availability/slots")
async def slots_for_date(date: str):
    """Return remaining available HH:MM slots for a given YYYY-MM-DD."""
    try:
        dt = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")

    avail_doc = await db.availability.find_one({"_id": "availability"})
    avail = Availability(**{k: v for k, v in (avail_doc or {}).items() if k != "_id"}) if avail_doc else Availability()

    if date in avail.blocked_dates:
        return {"date": date, "slots": [], "services": avail.services}

    weekday = str(dt.weekday())  # 0=Mon
    candidate = list(avail.weekday_slots.get(weekday, []))

    # subtract already-booked slots (pending/confirmed)
    taken_cursor = db.bookings.find(
        {"date": date, "status": {"$in": ["pending", "confirmed"]}},
        {"time": 1, "_id": 0},
    )
    taken = {b["time"] async for b in taken_cursor}
    available = [t for t in candidate if t not in taken]

    # if date is today, exclude past times
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    if date == today:
        now_hm = datetime.now(timezone.utc).strftime("%H:%M")
        available = [t for t in available if t > now_hm]

    return {"date": date, "slots": available, "services": avail.services}


# ===== BOOKINGS =====
@api.post("/bookings")
async def create_booking(payload: BookingCreate):
    # validate slot availability
    avail_doc = await db.availability.find_one({"_id": "availability"})
    avail = Availability(**{k: v for k, v in (avail_doc or {}).items() if k != "_id"}) if avail_doc else Availability()

    try:
        dt = datetime.strptime(payload.date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(400, "Invalid date format")

    if payload.date in avail.blocked_dates:
        raise HTTPException(400, "Selected date is not available")

    weekday = str(dt.weekday())
    if payload.time not in avail.weekday_slots.get(weekday, []):
        raise HTTPException(400, "Selected time slot is not offered")

    existing = await db.bookings.find_one({
        "date": payload.date,
        "time": payload.time,
        "status": {"$in": ["pending", "confirmed"]},
    })
    if existing:
        raise HTTPException(409, "Slot already booked. Please choose another time.")

    b = Booking(**payload.model_dump()).model_dump()
    b["_id"] = b.pop("id")
    await db.bookings.insert_one(b)
    return _strip_id(b)


@api.get("/admin/bookings")
async def list_bookings(status: Optional[str] = None, admin=Depends(get_current_admin)):
    q = {}
    if status:
        q["status"] = status
    cursor = db.bookings.find(q).sort("created_at", -1)
    return [_strip_id(d) async for d in cursor]


@api.put("/admin/bookings/{bid}")
async def update_booking(bid: str, payload: BookingUpdate, admin=Depends(get_current_admin)):
    fields = {k: v for k, v in payload.model_dump(exclude_unset=True).items() if v is not None}
    if fields:
        res = await db.bookings.update_one({"_id": bid}, {"$set": fields})
        if res.matched_count == 0:
            raise HTTPException(404, "Booking not found")
    doc = await db.bookings.find_one({"_id": bid})
    return _strip_id(doc)


@api.delete("/admin/bookings/{bid}")
async def delete_booking(bid: str, admin=Depends(get_current_admin)):
    await db.bookings.delete_one({"_id": bid})
    return {"ok": True}


# ===== STATS =====
@api.get("/admin/stats")
async def admin_stats(admin=Depends(get_current_admin)):
    return {
        "messages": await db.messages.count_documents({}),
        "messages_unread": await db.messages.count_documents({"read": False}),
        "bookings": await db.bookings.count_documents({}),
        "bookings_pending": await db.bookings.count_documents({"status": "pending"}),
        "bookings_confirmed": await db.bookings.count_documents({"status": "confirmed"}),
        "projects": await db.projects.count_documents({}),
        "team": await db.team.count_documents({}),
        "services": await db.services.count_documents({}),
    }


# ===== FILE UPLOADS =====
MAX_UPLOAD_BYTES = 25 * 1024 * 1024  # 25 MB safety ceiling (frontend compresses to <2MB typically)


@api.post("/admin/uploads")
async def upload_file(file: UploadFile = File(...), admin=Depends(get_current_admin)):
    if not file.filename:
        raise HTTPException(400, "Filename required")
    data = await file.read()
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File too large (max 25MB after server-side check)")
    storage_path, ext, default_ct = make_upload_path(file.filename)
    content_type = file.content_type or default_ct
    if not content_type.startswith("image/"):
        raise HTTPException(400, "Only images are allowed")
    try:
        result = put_object(storage_path, data, content_type)
    except Exception as e:
        logger.exception("Upload failed")
        raise HTTPException(500, f"Upload failed: {e}")

    file_id = str(__import__("uuid").uuid4())
    backend_url = os.environ.get("PUBLIC_API_BASE", "")
    # public URL via /api/files/{id}
    public_url = f"/api/files/{file_id}"
    record = {
        "_id": file_id,
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.files.insert_one(record)
    return {"id": file_id, "url": public_url, "filename": file.filename, "size": record["size"]}


@api.get("/files/{file_id}")
async def serve_file(file_id: str):
    rec = await db.files.find_one({"_id": file_id, "is_deleted": False})
    if not rec:
        raise HTTPException(404, "File not found")
    try:
        data, ct = get_object(rec["storage_path"], file_id=file_id)
    except Exception as e:
        logger.exception("Serve file failed")
        raise HTTPException(500, "Could not load file")
    return Response(
        content=data,
        media_type=rec.get("content_type", ct),
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


# ===== STARTUP =====
@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.bookings.create_index([("date", 1), ("time", 1)])
    await seed_all(db)
    try:
        init_storage()
    except Exception as e:
        logger.warning(f"Storage init at startup failed: {e}")
    logger.info("Studio Inai API started; seed complete.")


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# Mount router
app.include_router(api)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
