from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    register_number = Column(String, unique=True, index=True)
    department = Column(String, index=True)
    year = Column(Integer)
    section = Column(String)
    email = Column(String, unique=True, index=True)
    leetcode_username = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    leetcode_stats = relationship("LeetCodeStats", back_populates="student", uselist=False, cascade="all, delete-orphan")
    daily_activities = relationship("DailyActivity", back_populates="student", cascade="all, delete-orphan")


class LeetCodeStats(Base):
    __tablename__ = "leetcode_stats"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), unique=True)
    
    total_solved = Column(Integer, default=0)
    easy_solved = Column(Integer, default=0)
    medium_solved = Column(Integer, default=0)
    hard_solved = Column(Integer, default=0)
    
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    
    contest_rating = Column(Float, nullable=True)
    ranking = Column(Integer, nullable=True)
    acceptance_rate = Column(Float, nullable=True)
    
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    student = relationship("Student", back_populates="leetcode_stats")


class DailyActivity(Base):
    __tablename__ = "daily_activities"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    date = Column(DateTime, default=lambda: datetime.now(timezone.utc).date())
    
    problems_solved = Column(Integer, default=0)
    easy = Column(Integer, default=0)
    medium = Column(Integer, default=0)
    hard = Column(Integer, default=0)
    
    student = relationship("Student", back_populates="daily_activities")

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="staff")  # 'admin' or 'staff'

