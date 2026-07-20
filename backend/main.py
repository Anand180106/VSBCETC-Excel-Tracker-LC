import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from apscheduler.schedulers.background import BackgroundScheduler
import models
from database import engine, SessionLocal
from routers import students, auth
from services.leetcode import fetch_leetcode_stats
from datetime import datetime

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="LPMAS API")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Global exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

app.include_router(auth.router)
app.include_router(students.router)

def update_leetcode_stats():
    print(f"[{datetime.now()}] Running scheduled LeetCode stats update...")
    db = SessionLocal()
    try:
        active_students = db.query(models.Student).filter(models.Student.is_active == True).all()
        for student in active_students:
            try:
                stats = fetch_leetcode_stats(student.leetcode_username)
                if stats:
                    db_stats = db.query(models.LeetCodeStats).filter(models.LeetCodeStats.student_id == student.id).first()
                    if db_stats:
                        for key, value in stats.items():
                            setattr(db_stats, key, value)
                    else:
                        new_stats = models.LeetCodeStats(student_id=student.id, **stats)
                        db.add(new_stats)
                    db.commit()
            except Exception as e:
                print(f"Error fetching stats for {student.leetcode_username}: {e}")
    except Exception as e:
        print(f"Error in scheduler: {e}")
    finally:
        db.close()

def create_initial_admin():
    db = SessionLocal()
    try:
        admin = db.query(models.AdminUser).filter(models.AdminUser.username == "admin").first()
        if not admin:
            print("Creating default admin user...")
            from routers.auth import get_password_hash
            new_admin = models.AdminUser(
                username="admin",
                email="admin@college.edu",
                hashed_password=get_password_hash("admin123"),
                role="admin"
            )
            db.add(new_admin)
            db.commit()
    finally:
        db.close()

@app.on_event("startup")
def startup_event():
    create_initial_admin()
    scheduler = BackgroundScheduler()
    scheduler.add_job(update_leetcode_stats, 'interval', minutes=30)
    scheduler.start()

@app.get("/")
def read_root():
    return {"message": "Welcome to LPMAS API"}
