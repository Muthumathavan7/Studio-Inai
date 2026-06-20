"""Emergent object storage helpers with auto-refresh + local disk cache."""
import os
import uuid
import time
import logging
from pathlib import Path
from typing import Optional, Tuple

import requests

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get("APP_NAME", "studio-inai")

# Disk cache lives next to backend code.
CACHE_DIR = Path(__file__).parent / "_cache" / "files"
CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Session-scoped storage key + refresh policy.
_storage_key: Optional[str] = None
_storage_key_obtained_at: float = 0.0
KEY_TTL_SECONDS = 30 * 60  # Proactively refresh every 30 minutes.

logger = logging.getLogger(__name__)


def _need_refresh() -> bool:
    if _storage_key is None:
        return True
    return (time.time() - _storage_key_obtained_at) > KEY_TTL_SECONDS


def init_storage(force: bool = False) -> Optional[str]:
    """Obtain (or refresh) the session storage key."""
    global _storage_key, _storage_key_obtained_at
    if not force and not _need_refresh():
        return _storage_key
    if not EMERGENT_KEY:
        logger.warning("EMERGENT_LLM_KEY not set; storage disabled.")
        return None
    try:
        r = requests.post(
            f"{STORAGE_URL}/init",
            json={"emergent_key": EMERGENT_KEY},
            timeout=30,
        )
        r.raise_for_status()
        _storage_key = r.json()["storage_key"]
        _storage_key_obtained_at = time.time()
        logger.info("Object storage key %s.", "refreshed" if force else "initialized")
        return _storage_key
    except Exception as e:
        logger.error("Storage init failed: %s", e)
        return None


def _is_auth_error(status: int) -> bool:
    return status in (401, 403)


def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload bytes to object storage at `path`, with one auth retry."""
    key = init_storage()
    if not key:
        raise RuntimeError("Object storage unavailable")

    def _do_put(k: str):
        return requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": k, "Content-Type": content_type},
            data=data,
            timeout=120,
        )

    r = _do_put(key)
    if _is_auth_error(r.status_code):
        key = init_storage(force=True)
        if not key:
            raise RuntimeError("Object storage unavailable (refresh failed)")
        r = _do_put(key)
    r.raise_for_status()
    return r.json()


def _cache_paths(file_id: str) -> Tuple[Path, Path]:
    data_path = CACHE_DIR / file_id
    meta_path = CACHE_DIR / f"{file_id}.ct"
    return data_path, meta_path


def _read_cache(file_id: str) -> Optional[Tuple[bytes, str]]:
    data_path, meta_path = _cache_paths(file_id)
    if not data_path.exists():
        return None
    try:
        return data_path.read_bytes(), meta_path.read_text() if meta_path.exists() else "application/octet-stream"
    except Exception as e:
        logger.warning("Cache read failed for %s: %s", file_id, e)
        return None


def _write_cache(file_id: str, data: bytes, content_type: str) -> None:
    data_path, meta_path = _cache_paths(file_id)
    try:
        tmp = data_path.with_suffix(".tmp")
        tmp.write_bytes(data)
        tmp.replace(data_path)
        meta_path.write_text(content_type)
    except Exception as e:
        logger.warning("Cache write failed for %s: %s", file_id, e)


def get_object(path: str, *, file_id: Optional[str] = None) -> Tuple[bytes, str]:
    """
    Fetch bytes from object storage. If `file_id` is provided, results are
    cached on local disk so subsequent reads bypass the storage call entirely.
    """
    if file_id:
        cached = _read_cache(file_id)
        if cached is not None:
            return cached

    key = init_storage()
    if not key:
        raise RuntimeError("Object storage unavailable")

    def _do_get(k: str):
        return requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": k},
            timeout=60,
        )

    r = _do_get(key)
    if _is_auth_error(r.status_code):
        key = init_storage(force=True)
        if not key:
            raise RuntimeError("Object storage unavailable (refresh failed)")
        r = _do_get(key)
    r.raise_for_status()

    data = r.content
    ct = r.headers.get("Content-Type", "application/octet-stream")
    if file_id:
        _write_cache(file_id, data, ct)
    return data, ct


MIME_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "svg": "image/svg+xml",
}


def make_upload_path(filename: str) -> Tuple[str, str, str]:
    """Returns (storage_path, ext, content_type) for a new upload."""
    ext = (filename.rsplit(".", 1)[-1] if "." in filename else "bin").lower()
    if ext not in MIME_TYPES:
        ext = "bin"
    content_type = MIME_TYPES.get(ext, "application/octet-stream")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    return path, ext, content_type
