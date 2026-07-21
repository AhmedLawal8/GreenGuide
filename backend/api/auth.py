import os
import hashlib
import hmac
import time
import json
import base64

from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from database.db import db
from database.tables import User

auth_bp = Blueprint("auth", __name__)

# ---------------------------------------------------------------------------
# JWT helpers (minimal, no external dependency beyond stdlib)
# ---------------------------------------------------------------------------

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _b64url_decode(s: str) -> bytes:
    s += "=" * (4 - len(s) % 4)
    return base64.urlsafe_b64decode(s)


def _sign(payload: str, secret: str) -> str:
    return _b64url_encode(
        hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()
    )


def create_token(user_id: int, expires_hours: int = 168) -> str:
    """Create a HS256-signed JWT containing {'sub': user_id, 'exp': ...}."""
    secret = current_app.config["SECRET_KEY"]
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    payload = _b64url_encode(json.dumps({
        "sub": user_id,
        "exp": int(time.time()) + expires_hours * 3600,
    }).encode())
    signing_input = f"{header}.{payload}"
    signature = _sign(signing_input, secret)
    return f"{signing_input}.{signature}"


def decode_token(token: str) -> dict | None:
    """Return payload dict or None if the token is invalid / expired."""
    secret = current_app.config["SECRET_KEY"]
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        expected = _sign(f"{header_b64}.{payload_b64}", secret)
        if not hmac.compare_digest(expected, sig_b64):
            return None
        payload = json.loads(_b64url_decode(payload_b64))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


def require_auth(fn):
    """Decorator that injects `current_user` into the view function."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing or invalid Authorization header"}), 401
        token = auth_header.split(" ", 1)[1]
        payload = decode_token(token)
        if payload is None:
            return jsonify({"error": "Invalid or expired token"}), 401
        user = db.session.get(User, payload["sub"])
        if user is None:
            return jsonify({"error": "User not found"}), 401
        kwargs["current_user"] = user
        return fn(*args, **kwargs)
    return wrapper


# ---------------------------------------------------------------------------
# Password hashing (using hashlib — no bcrypt dependency needed)
# ---------------------------------------------------------------------------

def _hash_password(password: str) -> str:
    salt = os.urandom(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 260_000)
    return f"{salt.hex()}${dk.hex()}"


def _verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, dk_hex = stored.split("$")
        salt = bytes.fromhex(salt_hex)
        dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 260_000)
        return hmac.compare_digest(dk.hex(), dk_hex)
    except Exception:
        return False


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@auth_bp.post("/api/auth/register")
def register():
    """Register a new user with username, email, and password."""
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    username = (body.get("username") or "").strip()
    email    = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not username or not email or not password:
        return jsonify({"error": "username, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        username=username,
        email=email,
        password_hash=_hash_password(password),
        display_name=username,
    )
    db.session.add(user)
    db.session.commit()

    token = create_token(user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 201


@auth_bp.post("/api/auth/login")
def login():
    """Log in with username/email and password."""
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    identifier = (body.get("username") or body.get("email") or "").strip()
    password   = body.get("password") or ""

    if not identifier or not password:
        return jsonify({"error": "username/email and password are required"}), 400

    # Try username first, then email
    user = User.query.filter_by(username=identifier).first()
    if user is None:
        user = User.query.filter_by(email=identifier.lower()).first()

    if user is None or user.password_hash is None:
        return jsonify({"error": "Invalid credentials"}), 401

    if not _verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid credentials"}), 401

    token = create_token(user.id)
    return jsonify({"token": token, "user": user.to_dict()}), 200


@auth_bp.get("/api/auth/me")
@require_auth
def me(current_user: User):
    """Return the currently authenticated user."""
    return jsonify({"user": current_user.to_dict()}), 200


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------

GOOGLE_CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = os.environ.get(
    "GOOGLE_REDIRECT_URI", "http://localhost:5001/api/auth/google/callback"
)
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")


@auth_bp.get("/api/auth/google")
def google_login():
    """Redirect the browser to Google's OAuth 2.0 consent screen."""
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Google OAuth is not configured"}), 501

    params = {
        "client_id":     GOOGLE_CLIENT_ID,
        "redirect_uri":  GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope":         "openid email profile",
        "access_type":   "offline",
        "prompt":        "consent",
    }
    qs = "&".join(f"{k}={v}" for k, v in params.items())
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{qs}"

    from flask import redirect as flask_redirect
    return flask_redirect(url)


@auth_bp.get("/api/auth/google/callback")
def google_callback():
    """Exchange the authorization code for user info, then redirect to the frontend with a JWT."""
    import urllib.request
    import urllib.parse

    code = request.args.get("code")
    if not code:
        return jsonify({"error": "Missing authorization code"}), 400

    # Exchange code for tokens
    token_data = urllib.parse.urlencode({
        "code":          code,
        "client_id":     GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri":  GOOGLE_REDIRECT_URI,
        "grant_type":    "authorization_code",
    }).encode()

    token_req = urllib.request.Request(
        "https://oauth2.googleapis.com/token",
        data=token_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    try:
        with urllib.request.urlopen(token_req) as resp:
            token_resp = json.loads(resp.read())
    except Exception as e:
        return jsonify({"error": f"Token exchange failed: {e}"}), 502

    access_token = token_resp.get("access_token")
    if not access_token:
        return jsonify({"error": "No access token received"}), 502

    # Fetch user info
    userinfo_req = urllib.request.Request(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {access_token}"},
    )

    try:
        with urllib.request.urlopen(userinfo_req) as resp:
            userinfo = json.loads(resp.read())
    except Exception as e:
        return jsonify({"error": f"Failed to fetch user info: {e}"}), 502

    google_id    = userinfo.get("id")
    email        = (userinfo.get("email") or "").lower()
    display_name = userinfo.get("name", "")
    avatar_url   = userinfo.get("picture", "")

    if not google_id or not email:
        return jsonify({"error": "Could not retrieve Google user info"}), 502

    # Find or create user
    user = User.query.filter_by(google_id=google_id).first()

    if user is None:
        # Check if a user with this email already exists (registered via password)
        user = User.query.filter_by(email=email).first()
        if user:
            # Link Google account to existing user
            user.google_id    = google_id
            user.display_name = user.display_name or display_name
            user.avatar_url   = user.avatar_url or avatar_url
        else:
            # Create brand-new user
            user = User(
                email=email,
                google_id=google_id,
                display_name=display_name,
                avatar_url=avatar_url,
            )
            db.session.add(user)

    db.session.commit()

    jwt_token = create_token(user.id)

    # Redirect to frontend with token in query param
    from flask import redirect as flask_redirect
    return flask_redirect(f"{FRONTEND_ORIGIN}/auth/callback?token={jwt_token}")
