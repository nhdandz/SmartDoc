#!/usr/bin/env python3
"""
Diagnostic script to identify the auth endpoint issues
Run this in your be/ directory: python debug_auth.py
"""

import sys
import traceback
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Test 1: Import issues
print("=== Testing Imports ===")
try:
    from database import get_db, engine, Base, settings
    print("✓ Database imports successful")
except Exception as e:
    print(f"✗ Database import failed: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    from models import User
    print("✓ Models import successful")
except Exception as e:
    print(f"✗ Models import failed: {e}")
    traceback.print_exc()

try:
    from database import create_access_token, verify_token, hash_password, verify_password
    print("✓ Auth functions import successful")
except Exception as e:
    print(f"✗ Auth functions import failed: {e}")
    traceback.print_exc()

# Test 2: Database connection
print("\n=== Testing Database Connection ===")
try:
    # Test basic connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("✓ Database connection successful")
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    print(f"Database URL: {settings.DATABASE_URL}")

# Test 3: Table creation
print("\n=== Testing Table Creation ===")
try:
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully")
    
    # Check if tables exist
    with engine.connect() as conn:
        if settings.DATABASE_URL.startswith("sqlite"):
            result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
        else:
            result = conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname='public'"))
        
        tables = [row[0] for row in result]
        print(f"✓ Existing tables: {tables}")
        
        if 'users' not in tables:
            print("✗ Users table not found!")
        else:
            print("✓ Users table exists")
            
except Exception as e:
    print(f"✗ Table creation failed: {e}")
    traceback.print_exc()

# Test 4: UUID functionality
print("\n=== Testing UUID Functionality ===")
try:
    import uuid
    test_uuid = uuid.uuid4()
    print(f"✓ UUID generation works: {test_uuid}")
    
    # Test UUID with SQLAlchemy
    if not settings.DATABASE_URL.startswith("sqlite"):
        with engine.connect() as conn:
            result = conn.execute(text("SELECT gen_random_uuid()"))
            db_uuid = result.fetchone()[0]
            print(f"✓ PostgreSQL UUID generation works: {db_uuid}")
    
except Exception as e:
    print(f"✗ UUID functionality failed: {e}")
    traceback.print_exc()

# Test 5: User creation simulation
print("\n=== Testing User Model ===")
try:
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Try to create a user object (don't save to DB yet)
    test_user = User(
        name="Test User",
        email="test@example.com",
        hashed_password=hash_password("test123"),
        role="user"
    )
    print(f"✓ User object creation successful: {test_user.id}")
    
    # Try to add to database
    db.add(test_user)
    db.commit()
    db.refresh(test_user)
    print(f"✓ User saved to database with ID: {test_user.id}")
    
    # Clean up
    db.delete(test_user)
    db.commit()
    print("✓ Test user cleaned up")
    
    db.close()
    
except Exception as e:
    print(f"✗ User model test failed: {e}")
    traceback.print_exc()
    if 'db' in locals():
        db.rollback()
        db.close()

# Test 6: Auth functions
print("\n=== Testing Auth Functions ===")
try:
    # Test password hashing
    password = "test123"
    hashed = hash_password(password)
    print(f"✓ Password hashing works")
    
    # Test password verification
    if verify_password(password, hashed):
        print("✓ Password verification works")
    else:
        print("✗ Password verification failed")
    
    # Test token creation
    token = create_access_token(data={"user_id": "test-uuid"})
    print(f"✓ Token creation works")
    
    # Test token verification
    payload = verify_token(token)
    if payload and payload.get("user_id") == "test-uuid":
        print("✓ Token verification works")
    else:
        print("✗ Token verification failed")
        
except Exception as e:
    print(f"✗ Auth functions test failed: {e}")
    traceback.print_exc()

print("\n=== Diagnostic Complete ===")
print("If all tests pass, the issue might be in the FastAPI route handlers.")
print("If any tests fail, fix those issues first.")