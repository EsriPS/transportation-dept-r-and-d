import requests
from datetime import datetime

def get_missions_in_project(api_token, project_id):
    # Site Scan API endpoint for projects
    url = f"https://sitescan-api.arcgis.com/api/v2/projects/{project_id}/missions?limit=1000"

    # Set up the headers with the API token
    headers = {
        "Authorization": f"Bearer {api_token}"
    }

    response = requests.get(url, headers=headers, params=None)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the response JSON (it's a list)
        projects_list = response.json()

        print(f"Projects {len(projects_list)}:")
        
        for project in projects_list:
            id = project.get('id', 0)
            name = project.get('name', 0)
            created = project.get('created', 0)
            print(f"id: {id}, name: {name}, created: {created}")

    else:
        print(f"Failed to get missions for project. Status Code: {response.status_code}")
        print(response.text)  # Print the response text for debugging purposes

# Example usage:
api_token = "your token"
project_id = "your project id"

get_missions_in_project(api_token, project_id)










