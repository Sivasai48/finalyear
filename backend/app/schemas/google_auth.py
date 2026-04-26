from pydantic import BaseModel

class GoogleLoginRequest(BaseModel):
    id_token: str
    user_type: str  # "dhalari" only for now, but good to be explicit
