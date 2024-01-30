import requests
from datetime import datetime

def get_projects(api_token, organization_id, start_date=None, end_date=None, group_by=None):
    # Site Scan API endpoint for projects
    url = f"https://sitescan-api.arcgis.com/api/v2/organizations/{organization_id}/projects"

    # Set up the headers with the API token
    headers = {
        "Authorization": f"Bearer {api_token}"
    }

    # Set up parameters
    params = {}
    if start_date:
        params['start'] = start_date
    if end_date:
        params['end'] = end_date
    if group_by:
        params['by'] = group_by

    # Make the request
    response = requests.get(url, headers=headers, params=params)

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
        print(f"Failed to projects. Status Code: {response.status_code}")
        print(response.text)  # Print the response text for debugging purposes

# Example usage:
api_token = "your token"
organization_id = "your org id"
start_date = "2023-01-01"
end_date = "2023-12-31"
group_by = "project"  # or "user" for grouping by user

get_projects(api_token, organization_id, start_date, end_date, group_by)
