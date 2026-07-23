from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class LeetCodeStatsBase(BaseModel):
    total_solved: Optional[int] = 0
    solved_today: Optional[int] = 0
    easy_solved: Optional[int] = 0
    medium_solved: Optional[int] = 0
    hard_solved: Optional[int] = 0
    current_streak: Optional[int] = 0
    longest_streak: Optional[int] = 0
    contest_rating: Optional[float] = None
    ranking: Optional[int] = None
    acceptance_rate: Optional[float] = None

class LeetCodeStats(LeetCodeStatsBase):
    id: int
    last_updated: Optional[datetime] = None
    class Config:
        from_attributes = True

class StudentBase(BaseModel):
    name: str
    register_number: str
    department: Optional[str] = "Other"
    year: Optional[int] = 1
    section: Optional[str] = "A"
    email: Optional[str] = None
    leetcode_username: str

class StudentCreate(StudentBase):
    pass

class Student(BaseModel):
    id: int
    name: str
    register_number: str
    department: Optional[str] = "Other"
    year: Optional[int] = 1
    section: Optional[str] = "A"
    email: Optional[str] = None
    leetcode_username: str
    is_active: Optional[bool] = True
    created_at: Optional[datetime] = None
    leetcode_stats: Optional[LeetCodeStats] = None
    class Config:
        from_attributes = True

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    register_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    section: Optional[str] = None
    email: Optional[EmailStr] = None
    leetcode_username: Optional[str] = None
    is_active: Optional[bool] = None

class BulkImportResponse(BaseModel):
    successful: int
    failed: int
    errors: List[str]

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AdminUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "staff"

class AdminUser(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

