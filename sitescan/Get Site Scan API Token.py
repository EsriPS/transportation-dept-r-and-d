import requests

SITESCAN_API = "https://sitescan-api.arcgis.com/api/v2"

# Replace with your actual email and password
email = 'your-email'
password = 'your-password'

# Obtain an API token
response = requests.post(f"{SITESCAN_API}/auth/session/api", auth=(email, password))

# Check if the request was successful (status code 200)
if response.status_code == 200:
    # Parse the JSON response to get the token
    response_json = response.json()
    token = response_json.get('token')
    print(f"API Token: {token}")
else:
    print(f"Failed to obtain API token. Status Code: {response.status_code}")






