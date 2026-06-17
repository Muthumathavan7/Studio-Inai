"""Studio Inai backend API tests (public + auth + admin CRUD + booking flow)."""
import os
import pytest
import requests
from datetime import datetime, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://architect-pro-10.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@studioinai.com"
ADMIN_PASSWORD = "StudioInai@2026"


# ===== Fixtures =====
@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def future_weekday_date(min_days=3):
    """Returns a future date (YYYY-MM-DD) that is Mon-Fri."""
    d = datetime.utcnow().date() + timedelta(days=min_days)
    while d.weekday() > 4:  # 5,6 = Sat,Sun -> pick weekday so 5 slots available
        d += timedelta(days=1)
    return d.strftime("%Y-%m-%d")


def future_sunday_date():
    d = datetime.utcnow().date() + timedelta(days=1)
    while d.weekday() != 6:
        d += timedelta(days=1)
    return d.strftime("%Y-%m-%d")


# ===== Public endpoints =====
class TestPublicEndpoints:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        assert r.json().get("status") == "ok"

    def test_get_content(self, session):
        r = session.get(f"{API}/content")
        assert r.status_code == 200
        data = r.json()
        assert "hero_title" in data
        assert "_id" not in data

    def test_list_services(self, session):
        r = session.get(f"{API}/services")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 6
        assert all("_id" not in s for s in data)
        assert all("title" in s and "id" in s for s in data)

    def test_list_team(self, session):
        r = session.get(f"{API}/team")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 4

    def test_list_projects(self, session):
        r = session.get(f"{API}/projects")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 8

    def test_list_projects_filtered(self, session):
        r = session.get(f"{API}/projects", params={"category": "Residential"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert all(p["category"] == "Residential" for p in data)

    def test_get_availability(self, session):
        r = session.get(f"{API}/availability")
        assert r.status_code == 200
        data = r.json()
        assert "weekday_slots" in data and "services" in data

    def test_slots_for_date(self, session):
        date = future_weekday_date()
        r = session.get(f"{API}/availability/slots", params={"date": date})
        assert r.status_code == 200
        data = r.json()
        assert data["date"] == date
        assert isinstance(data["slots"], list)
        assert len(data["slots"]) > 0

    def test_slots_invalid_date(self, session):
        r = session.get(f"{API}/availability/slots", params={"date": "bad-date"})
        assert r.status_code == 400

    def test_contact_submit(self, session):
        r = session.post(f"{API}/contact", json={
            "name": "TEST_contact",
            "email": "test_contact@example.com",
            "phone": "+1234567890",
            "subject": "Test subject",
            "message": "Hello from pytest",
        })
        assert r.status_code == 200
        data = r.json()
        assert data["ok"] is True
        assert "id" in data


# ===== Auth =====
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data and isinstance(data["access_token"], str)
        assert data["email"] == ADMIN_EMAIL

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_me_with_token(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token(self, session):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# ===== Content update =====
class TestContent:
    def test_update_content_persists(self, session, auth_headers):
        original = session.get(f"{API}/content").json()
        original_title = original["hero_title"]
        new_title = "TEST_hero_title_pytest_" + str(datetime.utcnow().timestamp())
        r = session.put(f"{API}/content", headers=auth_headers, json={"hero_title": new_title})
        assert r.status_code == 200
        # GET to verify persistence
        r2 = session.get(f"{API}/content")
        assert r2.json()["hero_title"] == new_title
        # Restore
        session.put(f"{API}/content", headers=auth_headers, json={"hero_title": original_title})

    def test_update_content_requires_auth(self, session):
        r = session.put(f"{API}/content", json={"hero_title": "nope"})
        assert r.status_code == 401


# ===== Services CRUD =====
class TestServicesCRUD:
    def test_full_crud(self, session, auth_headers):
        # CREATE
        r = session.post(f"{API}/services", headers=auth_headers, json={
            "title": "TEST_Service", "description": "test", "icon": "Compass", "order": 99
        })
        assert r.status_code == 200
        sid = r.json()["id"]
        # UPDATE
        r = session.put(f"{API}/services/{sid}", headers=auth_headers, json={
            "title": "TEST_Service_Updated", "description": "test2", "icon": "Compass", "order": 99
        })
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_Service_Updated"
        # DELETE
        r = session.delete(f"{API}/services/{sid}", headers=auth_headers)
        assert r.status_code == 200


# ===== Team CRUD =====
class TestTeamCRUD:
    def test_full_crud(self, session, auth_headers):
        r = session.post(f"{API}/team", headers=auth_headers, json={
            "name": "TEST_Member", "title": "Tester", "bio": "bio", "image": "", "order": 99
        })
        assert r.status_code == 200
        tid = r.json()["id"]
        r = session.put(f"{API}/team/{tid}", headers=auth_headers, json={
            "name": "TEST_Member_Updated", "title": "Tester", "bio": "bio", "image": "", "order": 99
        })
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_Member_Updated"
        r = session.delete(f"{API}/team/{tid}", headers=auth_headers)
        assert r.status_code == 200


# ===== Projects CRUD =====
class TestProjectsCRUD:
    def test_full_crud(self, session, auth_headers):
        r = session.post(f"{API}/projects", headers=auth_headers, json={
            "title": "TEST_Project", "category": "Residential",
            "cover_image": "https://example.com/img.jpg",
            "description": "desc", "location": "Chennai", "year": "2026",
        })
        assert r.status_code == 200
        pid = r.json()["id"]
        # Verify visible publicly
        listing = session.get(f"{API}/projects").json()
        assert any(p["id"] == pid for p in listing)
        # UPDATE
        r = session.put(f"{API}/projects/{pid}", headers=auth_headers, json={
            "title": "TEST_Project_Updated", "category": "Commercial",
            "cover_image": "https://example.com/img2.jpg",
        })
        assert r.status_code == 200
        assert r.json()["title"] == "TEST_Project_Updated"
        # GET by id
        r = session.get(f"{API}/projects/{pid}")
        assert r.status_code == 200 and r.json()["category"] == "Commercial"
        # DELETE
        r = session.delete(f"{API}/projects/{pid}", headers=auth_headers)
        assert r.status_code == 200
        # 404
        r = session.get(f"{API}/projects/{pid}")
        assert r.status_code == 404


# ===== Booking flow =====
class TestBookingFlow:
    booking_id = None
    booking_date = None
    booking_time = None

    def test_create_booking(self, session, auth_headers):
        date = future_weekday_date(min_days=4)
        slots = session.get(f"{API}/availability/slots", params={"date": date}).json()["slots"]
        assert slots, "No slots available for booking test"
        time_slot = slots[0]
        TestBookingFlow.booking_date = date
        TestBookingFlow.booking_time = time_slot

        r = session.post(f"{API}/bookings", json={
            "name": "TEST_Booker", "email": "test_book@example.com",
            "phone": "+91999", "date": date, "time": time_slot,
            "service": "General Consultation", "notes": "pytest",
        })
        assert r.status_code == 200, r.text
        b = r.json()
        assert b["status"] == "pending"
        assert b["date"] == date and b["time"] == time_slot
        TestBookingFlow.booking_id = b["id"]

    def test_duplicate_slot_returns_409(self, session):
        assert TestBookingFlow.booking_date and TestBookingFlow.booking_time
        r = session.post(f"{API}/bookings", json={
            "name": "TEST_Dup", "email": "dup@example.com",
            "date": TestBookingFlow.booking_date, "time": TestBookingFlow.booking_time,
        })
        assert r.status_code == 409

    def test_slot_disappears_after_booking(self, session):
        slots = session.get(f"{API}/availability/slots",
                            params={"date": TestBookingFlow.booking_date}).json()["slots"]
        assert TestBookingFlow.booking_time not in slots

    def test_invalid_weekday_slot_returns_400(self, session):
        # Sunday has empty weekday_slots
        sunday = future_sunday_date()
        r = session.post(f"{API}/bookings", json={
            "name": "TEST_Sun", "email": "sun@example.com",
            "date": sunday, "time": "10:00",
        })
        assert r.status_code == 400

    def test_admin_lists_bookings(self, session, auth_headers):
        r = session.get(f"{API}/admin/bookings", headers=auth_headers)
        assert r.status_code == 200
        ids = [b["id"] for b in r.json()]
        assert TestBookingFlow.booking_id in ids

    def test_admin_update_booking_status_and_meetlink(self, session, auth_headers):
        r = session.put(f"{API}/admin/bookings/{TestBookingFlow.booking_id}", headers=auth_headers,
                        json={"status": "confirmed", "meeting_link": "https://meet.google.com/abc-defg-hij"})
        assert r.status_code == 200
        body = r.json()
        assert body["status"] == "confirmed"
        assert body["meeting_link"] == "https://meet.google.com/abc-defg-hij"

    def test_cleanup_delete_booking(self, session, auth_headers):
        r = session.delete(f"{API}/admin/bookings/{TestBookingFlow.booking_id}", headers=auth_headers)
        assert r.status_code == 200


# ===== Admin messages =====
class TestAdminMessages:
    def test_messages_flow(self, session, auth_headers):
        # Create a fresh message
        r = session.post(f"{API}/contact", json={
            "name": "TEST_msg", "email": "msg@example.com", "message": "hi"
        })
        mid = r.json()["id"]
        # List
        r = session.get(f"{API}/admin/messages", headers=auth_headers)
        assert r.status_code == 200
        assert any(m["id"] == mid for m in r.json())
        # Mark read
        r = session.put(f"{API}/admin/messages/{mid}/read", headers=auth_headers)
        assert r.status_code == 200
        # Delete
        r = session.delete(f"{API}/admin/messages/{mid}", headers=auth_headers)
        assert r.status_code == 200


# ===== Admin stats / availability =====
class TestAdminStatsAvailability:
    def test_stats(self, session, auth_headers):
        r = session.get(f"{API}/admin/stats", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        for key in ["messages", "bookings", "projects", "team", "services"]:
            assert key in data

    def test_update_availability(self, session, auth_headers):
        original = session.get(f"{API}/availability").json()
        new_blocked = list(original.get("blocked_dates", [])) + ["2099-01-01"]
        r = session.put(f"{API}/admin/availability", headers=auth_headers,
                        json={"blocked_dates": new_blocked})
        assert r.status_code == 200
        assert "2099-01-01" in r.json()["blocked_dates"]
        # restore
        session.put(f"{API}/admin/availability", headers=auth_headers,
                    json={"blocked_dates": original.get("blocked_dates", [])})

    def test_admin_requires_auth(self, session):
        r = session.get(f"{API}/admin/stats")
        assert r.status_code == 401
