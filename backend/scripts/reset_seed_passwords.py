"""
Run this script once after executing sql/00_RUN_ALL.sql to set real werkzeug
password hashes on the seed USER_ACCOUNT rows.

Usage (from the backend/ folder):
    python scripts/reset_seed_passwords.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from werkzeug.security import generate_password_hash
from db.oracle_connection import get_connection

SEED_PASSWORD = "Clinic@123"
SEED_USERNAMES = ["karabo.mabena", "dr.mokoena", "nurse.molefe", "admin.ndlovu"]

def main():
    real_hash = generate_password_hash(SEED_PASSWORD)
    conn = get_connection()
    cursor = conn.cursor()
    updated = 0
    for username in SEED_USERNAMES:
        cursor.execute(
            "UPDATE USER_ACCOUNT SET password_hash = :1 WHERE username = :2 AND password_hash = 'CHANGEME'",
            [real_hash, username],
        )
        if cursor.rowcount:
            print(f"  [OK] {username}")
            updated += cursor.rowcount
    conn.commit()
    cursor.close()
    conn.close()
    print(f"\nDone. {updated} account(s) updated. Login password: {SEED_PASSWORD}")

if __name__ == "__main__":
    main()
