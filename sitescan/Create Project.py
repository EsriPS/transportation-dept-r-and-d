import requests
from datetime import datetime

def create_project(api_token, organization_id, payload):
    # Site Scan API endpoint for projects
    url = f"https://sitescan-api.arcgis.com/api/v2/organizations/{organization_id}/projects"

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
        name = response_json.get('name', 0)
        created = response_json.get('created', 0)
        organizationId = response_json.get('organizationId', 0)
        location = response_json.get('location', 0)
        outputCoordinateSystem = response_json.get('outputCoordinateSystem', 0)
        myPermissions = response_json.get('myPermissions', 0)
        print(f"id: {id}, name: {name}, created: {created}, organizationId: {organizationId}, location: {location}, outputCoordinateSystem: {outputCoordinateSystem}, myPermissions: {myPermissions}")
    else:
        print(f"Failed to create projwect. Status Code: {response.status_code}")
        print(response.text)  # Print the response text for debugging purposes

# Example usage:
api_token = "your token"
organization_id = "your org ID"

payload = {
    'name': 'your project name',
    'location': {
        'type': 'Point',
        'coordinates': [-117.182600, 34.055560]
    },
    'outputCoordinateSystem': 'EPSG:2227+ARBITRARY:foot_survey_us'
}

create_project(api_token, organization_id, payload)



