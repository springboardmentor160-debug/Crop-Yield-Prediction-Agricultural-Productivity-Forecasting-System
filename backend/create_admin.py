"""Create or promote an administrator without exposing a public admin signup path."""
import getpass

from app.auth_handler import hash_password
from app.db import execute, fetch_one, initialize_database


def main() -> None:
    initialize_database()
    email = input("Administrator email: ").strip().lower()
    if not email or "@" not in email:
        raise SystemExit("Enter a valid email address.")
    user = fetch_one("SELECT id FROM users WHERE email = ?", (email,))
    if user:
        execute("UPDATE users SET role = 'Admin' WHERE id = ?", (user["id"],))
        print("Existing account promoted to Admin.")
        return
    password = getpass.getpass("Administrator password (8+ characters): ")
    if len(password) < 8:
        raise SystemExit("Password must be at least 8 characters.")
    execute("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'Admin')", (email, hash_password(password)))
    print("Administrator account created.")


if __name__ == "__main__":
    main()
