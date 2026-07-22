from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from services.leetcode import fetch_leetcode_stats
from datetime import datetime, timezone
from routers.auth import get_current_user

router = APIRouter(
    prefix="/students",
    tags=["students"],
    dependencies=[Depends(get_current_user)]
)


@router.post("/", response_model=schemas.Student)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.register_number == student.register_number).first()
    if db_student:
        raise HTTPException(status_code=400, detail="Register number already registered")
    
    db_student = db.query(models.Student).filter(models.Student.leetcode_username == student.leetcode_username).first()
    if db_student:
        raise HTTPException(status_code=400, detail="LeetCode username already registered")

    new_student = models.Student(**student.model_dump())
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    # Immediately fetch initial stats
    stats = fetch_leetcode_stats(new_student.leetcode_username)
    if stats:
        new_stats = models.LeetCodeStats(
            student_id=new_student.id,
            **stats
        )
        db.add(new_stats)
        db.commit()
        db.refresh(new_student)
    
    return new_student

@router.get("/", response_model=List[schemas.Student])
def get_students(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    students = db.query(models.Student).offset(skip).limit(limit).all()
    return students

@router.put("/{student_id}", response_model=schemas.Student)
def update_student(student_id: int, student_update: schemas.StudentUpdate, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    update_data = student_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_student, key, value)
    
    db.commit()
    db.refresh(db_student)
    
    if "leetcode_username" in update_data:
        stats = fetch_leetcode_stats(db_student.leetcode_username)
        if stats:
            db_stats = db.query(models.LeetCodeStats).filter(models.LeetCodeStats.student_id == db_student.id).first()
            if db_stats:
                for key, value in stats.items():
                    setattr(db_stats, key, value)
            else:
                new_stats = models.LeetCodeStats(student_id=db_student.id, **stats)
                db.add(new_stats)
            db.commit()
            db.refresh(db_student)
    
    return db_student

@router.delete("/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db.delete(db_student)
    db.commit()
    return {"detail": "Student deleted"}

@router.post("/bulk-delete")
def bulk_delete_students(student_ids: List[int], db: Session = Depends(get_db)):
    if not student_ids:
        return {"deleted": 0}
    deleted_count = db.query(models.Student).filter(models.Student.id.in_(student_ids)).delete(synchronize_session=False)
    db.commit()
    return {"deleted": deleted_count}

@router.post("/bulk-import", response_model=schemas.BulkImportResponse)
def bulk_import_students(students: List[schemas.StudentCreate], db: Session = Depends(get_db)):
    successful = 0
    failed = 0
    errors = []
    
    for student_data in students:
        try:
            exists = db.query(models.Student).filter(
                (models.Student.register_number == student_data.register_number) |
                (models.Student.leetcode_username == student_data.leetcode_username)
            ).first()
            if exists:
                failed += 1
                errors.append(f"Student with Reg No {student_data.register_number} or LeetCode ID {student_data.leetcode_username} already exists.")
                continue
            
            new_student = models.Student(**student_data.model_dump())
            db.add(new_student)
            db.commit()
            db.refresh(new_student)
            
            stats = fetch_leetcode_stats(new_student.leetcode_username)
            if stats:
                new_stats = models.LeetCodeStats(
                    student_id=new_student.id,
                    **stats
                )
                db.add(new_stats)
                db.commit()
            
            successful += 1
        except Exception as e:
            db.rollback()
            failed += 1
            errors.append(f"Error importing {student_data.register_number}: {str(e)}")
            
    return schemas.BulkImportResponse(successful=successful, failed=failed, errors=errors)
