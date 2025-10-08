from pydantic import BaseModel, EmailStr, validator

class UserIn(BaseModel):
    username: str
    email: EmailStr
    password: str

    @validator("password")
    def validate_password(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError("Password must be 72 bytes or less")
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @validator("username")
    def validate_username(cls, v):
        if len(v) < 3 or len(v) > 50:
            raise ValueError("Username must be between 3 and 50 characters")
        return v

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    is_active: bool
    role: str = "standard"

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str