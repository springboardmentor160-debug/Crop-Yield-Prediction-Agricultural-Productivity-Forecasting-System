import requests
from app.database import engine
from app.core.config import settings

print('DATABASE_URL:', settings.DATABASE_URL)
print('ENGINE:', engine)

try:
    with engine.connect() as conn:
        print('DB connected')
        result = conn.execute('SELECT 1')
        print('SELECT 1 =>', result.fetchone())
except Exception as exc:
    print('DB connection failed:', exc)

base = 'http://127.0.0.1:8000/api/v1'

try:
    r = requests.get(f'{base}/health')
    print('GET /health', r.status_code, r.text)
except Exception as exc:
    print('GET /health failed:', exc)

email = 'validate-test@yield.com'
pw = 'Password1'

login = None
try:
    login = requests.post(f'{base}/auth/login', json={'email': email, 'password': pw})
    print('POST /auth/login', login.status_code, login.text)
    if login.status_code == 401:
        reg = requests.post(f'{base}/auth/register', json={'full_name': 'Validate Test', 'email': email, 'password': pw, 'role': 'Farmer'})
        print('POST /auth/register', reg.status_code, reg.text)
        if reg.ok:
            login = requests.post(f'{base}/auth/login', json={'email': email, 'password': pw})
            print('POST /auth/login after register', login.status_code, login.text)
except Exception as exc:
    print('Login/register failed:', exc)

if login and login.ok:
    token = login.json().get('access_token')
    headers = {'Authorization': f'Bearer {token}'}
    try:
        profile = requests.get(f'{base}/users/me', headers=headers)
        print('GET /users/me', profile.status_code, profile.text)
    except Exception as exc:
        print('GET /users/me failed:', exc)
    try:
        farms = requests.get(f'{base}/farms/', headers=headers)
        print('GET /farms/', farms.status_code, farms.text)
    except Exception as exc:
        print('GET /farms/ failed:', exc)
