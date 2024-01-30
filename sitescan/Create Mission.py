import requests
from datetime import datetime

def create_mission(api_token, project_id, payload):
    # Site Scan API endpoint for projects
    url = f"https://sitescan-api.arcgis.com/api/v2/projects/{project_id}/missions"

    # Set up the headers
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    # post the request
    response = requests.post(url, json=payload, headers=headers)

    # process result
    if response.status_code == 201:
        # Parse the response JSON (it's a list)
        response_json = response.json()

        id = response_json.get('id', 0)
        projectId= response_json.get('projectId', 0)
        name= response_json.get('name', 0)
        created= response_json.get('created', 0)
        startTime= response_json.get('startTime', 0)
        endTime= response_json.get('endTime', 0)
        state= response_json.get('state', 0)
        vehicle= response_json.get('        ', 0)
        
        print(f"id: {id}, projectId: {projectId}, name: {name}, created: {created}, startTime: {startTime}, endTime: {endTime}, state: {state}, vehicle: {vehicle}")
    else:
        print(f"Failed to create mission. Status Code: {response.status_code}")
        print(response.text)  # Print the response text for debugging purposes

# Example usage:
api_token = "current token"
project_id = "existing project id"

payload = {
    "name": "your-mission-name",
}

create_mission(api_token, project_id, payload)



