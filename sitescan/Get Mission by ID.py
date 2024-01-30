import requests
from datetime import datetime

def get_mission_by_id(api_token, mission_id):
    # Site Scan API endpoint for projects
    url = f"https://sitescan-api.arcgis.com/api/v2/missions/{mission_id}"

    # Set up the headers with the API token
    headers = {
        "Authorization": f"Bearer {api_token}"
    }

    response = requests.get(url, headers=headers, params=None)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the response JSON (it's a list)
        mission_info = response.json()

        id = mission_info.get('id', 0)
        name = mission_info.get('name', 0)
        projectid = mission_info.get('projectId', 0)
        created = mission_info.get('created', 0)
        print(f"id: {id}, name: {name}, projectid: {projectid}, created: {created}")

    else:
        print(f"Failed to get mission. Status Code: {response.status_code}")
        print(response.text)  # Print the response text for debugging purposes

# Example usage:
api_token = "current token"
mission_id = "your mission id"

get_mission_by_id(api_token, mission_id)










