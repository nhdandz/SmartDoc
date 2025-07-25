#!/usr/bin/env python3
"""
Create default admin user for SmartDoc - Real database version
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_admin_user():
    """Create default admin user in database"""
    
    print("🚀 SmartDoc Admin User Setup")
    print("="*40)
    
    try:
        # Import database components
        from database import SessionLocal, hash_password
        from models import User
        
        db = SessionLocal()
        
        # Check if admin already exists
        admin_email = "admin@smartdoc.com"
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if existing_admin:
            print(f"⚠️  Admin user already exists: {admin_email}")
            print(f"   ID: {existing_admin.id}")
            print(f"   Name: {existing_admin.name}")
            print(f"   Role: {existing_admin.role}")
            db.close()
            return True
        
        # Create new admin user
        admin_user = User(
            name="Administrator",
            email=admin_email,
            hashed_password=hash_password("admin123"),
            role="admin",
            is_active=True,
            department="IT",
            phone=None
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ Admin user created successfully:")
        print(f"   ID: {admin_user.id}")
        print(f"   Name: {admin_user.name}")
        print(f"   Email: {admin_user.email}")
        print(f"   Role: {admin_user.role}")
        print(f"   Password: admin123")
        print("")
        print("⚠️  IMPORTANT: Change the password after first login!")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_test_user():
    """Create test user for development"""
    
    try:
        from database import SessionLocal, hash_password
        from models import User
        
        db = SessionLocal()
        
        # Check if test user already exists
        test_email = "test@example.com"
        existing_user = db.query(User).filter(User.email == test_email).first()
        
        if existing_user:
            print(f"ℹ️  Test user already exists: {test_email}")
            db.close()
            return True
        
        # Create test user
        test_user = User(
            name="Test User",
            email=test_email,
            hashed_password=hash_password("test123"),
            role="user",
            is_active=True
        )
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print("✅ Test user created:")
        print(f"   Email: {test_user.email}")
        print(f"   Password: test123")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Error creating test user: {e}")
        return False

def verify_database():
    """Verify database connection and tables"""
    
    try:
        from database import engine, Base
        from sqlalchemy import inspect
        
        # Check database connection
        with engine.connect() as conn:
            print("✅ Database connection successful")
        
        # Check if tables exist
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if 'users' not in tables:
            print("⚠️  Users table not found, creating tables...")
            Base.metadata.create_all(bind=engine)
            print("✅ Tables created")
        else:
            print("✅ Users table exists")
        
        return True
        
    except Exception as e:
        print(f"❌ Database verification failed: {e}")
        return False

if __name__ == "__main__":
    try:
        print("Step 1: Verifying database...")
        if not verify_database():
            sys.exit(1)
        
        print("\nStep 2: Creating admin user...")
        if not create_admin_user():
            sys.exit(1)
        
        print("\nStep 3: Creating test user...")
        create_test_user()  # Don't fail if this doesn't work
        
        print("\n" + "="*40)
        print("🌐 You can now:")
        print("   1. Access API at: http://localhost:8000")
        print("   2. View API docs at: http://localhost:8000/docs")
        print("   3. Login with admin@smartdoc.com / admin123")
        print("   4. Or test with test@example.com / test123")
        print("\n✅ Setup completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)