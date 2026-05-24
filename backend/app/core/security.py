import requests
from fastapi import Header, HTTPException, Depends
from app.core.config import settings

def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        # For public/anonymous browsing, we return a mock guest context
        return {"id": None, "email": "guest@samagama.ai", "role": "Student", "reputation_points": 0}
        
    token = authorization.split(" ")[1]
    url = f"{settings.SUPABASE_URL}/auth/v1/user"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {token}"
    }
    
    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code == 200:
            supabase_user = r.json()
            user_id = supabase_user["id"]
            email = supabase_user["email"]
            
            # Fetch user details from public.users
            from app.core.database import supabase_get, supabase_post
            users = supabase_get("users", {"id": f"eq.{user_id}"})
            if users:
                return users[0]
            else:
                # Sync user into public.users database table if not present
                new_user = supabase_post("users", {
                    "id": user_id,
                    "email": email,
                    "role": "Student",
                    "reputation_points": 0
                })
                return new_user[0]
        else:
            raise HTTPException(status_code=401, detail="Invalid Supabase Auth token")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth verification exception: {e}")
        raise HTTPException(status_code=500, detail="Internal authentication server error")

def require_auth(user: dict = Depends(get_current_user)) -> dict:
    if not user.get("id"):
        raise HTTPException(status_code=401, detail="Authentication required for this operation")
    return user

def require_role(allowed_roles: list):
    def dependency(user: dict = Depends(require_auth)):
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Permission denied for this user role")
        return user
    return dependency
