import requests
from datetime import datetime

def processMissionById(api_token, mission_id):
    # Site Scan API endpoint for projects
    url = f"https://sitescan-api.arcgis.com/api/v2/missions/{mission_id}/process/default"

    # Set up the headers with the API token
    headers = {
        "Authorization": f"Bearer {api_token}",
        'Content-Type': 'application/json'
    }

    bodyData = {
        "meshEngine": "sure",
        "sureQuality": "High"
    }

    response = requests.post(url, headers=headers, json=bodyData, params=None)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the response JSON (it's a list)
        response_info = response.json()

        # id = response_info.get('id', 0)
 
        print(f"Now Processing mission {mission_id}...")

    else:
        print(f"Failed to get mission. Status Code: {response.status_code}")
        print(response.text)  # Print the response text for debugging purposes

# Example usage:
api_token = "your token"
mission_id = "your mission id"

processMissionById(api_token, mission_id)
