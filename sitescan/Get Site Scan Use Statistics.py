import requests
from datetime import datetime

def get_usage_statistics(api_token, organization_id, start_date=None, end_date=None, group_by=None):
    # Site Scan API endpoint for aggregate usage statistics
    url = f"https://sitescan-api.arcgis.com/api/v2/organizations/{organization_id}/usage/photos"

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
        usage_statistics_list = response.json()

        # Print the aggregated usage statistics
        total_photos = 0
        total_bytes = 0
        total_pixels = 0
        total_ndays = 0

        for usage_statistics in usage_statistics_list:
            total_photos += usage_statistics.get('photos', 0)
            total_bytes += usage_statistics.get('bytes', 0)
            total_pixels += usage_statistics.get('pixels', 0)
            total_ndays += usage_statistics.get('ndays', 0)

        print("Aggregated Usage Statistics:")
        print(f"Total Photos: {total_photos}")
        print(f"Total Bytes: {total_bytes}")
        print(f"Total Pixels: {total_pixels}")
        print(f"Total Number of Days: {total_ndays}")
    else:
        print(f"Failed to retrieve usage statistics. Status Code: {response.status_code}")
        print(response.text)  # Print the response text for debugging purposes

# Example usage:
api_token = "current token"
organization_id = "your org id"
start_date = "2023-01-01"
end_date = "2023-12-31"
group_by = "project"  # or "user" for grouping by user

get_usage_statistics(api_token, organization_id, start_date, end_date, group_by)










