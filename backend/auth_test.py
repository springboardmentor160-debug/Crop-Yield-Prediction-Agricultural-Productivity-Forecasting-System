import requests
base='http://127.0.0.1:8000/api/v1'
email='testuser+1@yield.com'
password='Password1'
print('health', requests.get(base+'/health').status_code)
login = requests.post(base+'/auth/login', json={'email': email, 'password': password})
print('login status', login.status_code, login.text)
if login.status_code == 401:
    print('registering user')
    reg = requests.post(base+'/auth/register', json={'full_name':'Test User','email':email,'password':password,'role':'Farmer'})
    print('register status', reg.status_code, reg.text)
    if reg.ok:
        token = reg.json()['access_token']
        print('token', token[:30],'...')
        farms = requests.get(base+'/farms/', headers={'Authorization':f'Bearer {token}'})
        print('farms status', farms.status_code, farms.text)
else:
    if login.ok:
        token = login.json()['access_token']
        print('token', token[:30],'...')
        farms = requests.get(base+'/farms/', headers={'Authorization':f'Bearer {token}'})
        print('farms status', farms.status_code, farms.text)
