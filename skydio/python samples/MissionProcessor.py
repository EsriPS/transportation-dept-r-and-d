import requests
# from datetime import datetime
import os
import logging
import json
import os
import datetime
import time
import sys
import traceback
import uuid

# ------------------------------------------------------
# init variables
# ------------------------------------------------------

SITESCAN_API = "https://sitescan-api.arcgis.com/api/v2"

organization_id = "YOUR ORG ID HERE" # see your sitescan url"

# Replace with your actual email and password
email = 'YOUR EMAIL ADDRESS HERE'
password = 'YOUR PASSWORD HERE'

# The directory containing the photos you want to upload to sitescan for processing
directoryPath = f'PATH TO THE FOLDER HAVING YOUR IMAGES (downladed via GetSkydioMediaFiles.py)'

# mission name
# assumes you have a project, and you want to create a mission in that project

base_string = "YOUR PROJECT NAME PREFIX"
unique_suffix = str(uuid.uuid4().hex)

# When False, its assumed the project already exists
# When True, a new project will be created (with a new project_id)
uniqueProjectNameRequired = False

project_id = ""
project_lat = 0
project_lon = 0
outputCoordinateSystem = ""

# adjust the lat, lon and output coordinate system as needed
if (uniqueProjectNameRequired):
    projectName = base_string + "_Project_" + unique_suffix
    # just use the center of the state
    project_lat = 36.778259
    project_lon = -119.417931
    outputCoordinateSystem = 'EPSG:2227+ARBITRARY:foot_survey_us'
else:
    projectName = "YOUR PROJECT NAME HERE"
    project_id = "YOUR PROJECT ID HERE (guid)"

missionName = base_string + "_Mission_" + unique_suffix

# ------------------------------------------------------
# setup logging
# ------------------------------------------------------

logName = datetime.datetime.now().strftime('%Y_%m_%d_%H-%M_%S_') + '_MissionProcessor.log'

logFilePath = f'YOUR LOGFILE PATH{logName}'

logging.basicConfig(level=logging.DEBUG, filename=logFilePath,
                    format='%(asctime)s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

def log(message, both=True):
    logging.info(message)
    if (both):
        print(message)

log("logFilePath: " + logFilePath)

# ------------------------------------------------------
# get a token
# ------------------------------------------------------

def getToken():

    token = ""

    # Obtain an API token
    response = requests.post(f"{SITESCAN_API}/auth/session/api", auth=(email, password))

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the JSON response to get the token
        response_json = response.json()
        token = response_json.get('token')
        log(f"API Token: {token}")
    else:
        log(f"Failed to obtain API token. Status Code: {response.status_code}")

    return token    

# ------------------------------------------------------
# create_project
# ------------------------------------------------------

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
        log(f"id: {id}, name: {name}, created: {created}, organizationId: {organizationId}, location: {location}, outputCoordinateSystem: {outputCoordinateSystem}, myPermissions: {myPermissions}")
    else:
        log(f"Failed to create project. Status Code: {response.status_code}")
        log(response.text)  # Print the response text for debugging purposes


# ------------------------------------------------------
# create_mission
# ------------------------------------------------------

def create_mission(api_token, project_id, payload):
    # Site Scan API endpoint for projects
    url = f"{SITESCAN_API}/projects/{project_id}/missions"

    # Set up the headers
    headers = {
        'Authorization': f'Bearer {api_token}',
        'Content-Type': 'application/json'
    }

    id = ""

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
        
        log(f"id: {id}, projectId: {projectId}, name: {name}, created: {created}, startTime: {startTime}, endTime: {endTime}, state: {state}, vehicle: {vehicle}")
    else:
        log(f"Failed to create mission. Status Code: {response.status_code}")
        log(response.text)  # Print the response text for debugging purposes

    return id

# ------------------------------------------------------
# uploadPhotos
# ------------------------------------------------------

def uploadPhotos(token, missionId, directoryPath):

    # The endpoint URL for uploading media to a mission
    url = f'{SITESCAN_API}/missions/{missionId}/media'

    # Headers including the Authorization token
    headers = {
        'Authorization': f'Bearer {token}'
    }

    # Go through each file in the directory
    for filename in os.listdir(directoryPath):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
            log(f'Uploading {filename}...')

            # Full path to the image file
            file_path = os.path.join(directoryPath, filename)

            # Open the file in binary-read mode
            with open(file_path, 'rb') as image_file:
                # The 'files' parameter is used to upload files in a multipart/form-data format.
                files = {'file': (filename, image_file, 'image/jpeg')}

                # Make a POST request to upload the file
                response = requests.post(url, headers=headers, files=files)

                # Check if the request was successful
                if response.status_code == 201:
                    log('Image uploaded successfully.')
                else:
                    log('Failed to upload image.')
                    log(f'Status Code: {response.status_code}')
                    log(f'Response: {response.text}')
        else:
            log(f'Skipping {filename}, not a supported image format.')

# ------------------------------------------------------
# processMissionById
# ------------------------------------------------------

def processMissionById(api_token, mission_id):
    # Site Scan API endpoint for projects
    url = f"{SITESCAN_API}/missions/{mission_id}/process/default"

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
 
        log(f"Now Processing mission {mission_id}...")

    else:
        log(f"Failed to get mission. Status Code: {response.status_code}")
        log(response.text)  # Print the response text for debugging purposes

# ------------------------------------------------------
# main processing
# ------------------------------------------------------

try:
    startTime = time.time()

    log(f"MissionProcessor started, startTime: {startTime}")

    api_token = getToken()

    if (api_token == ""):
        log("Failed to get token. Exiting.")
        exit()

    if (uniqueProjectNameRequired):
        payload = {
            'name': f'{projectName}',
            'location': {
                'type': 'Point',
                'coordinates': [project_lon, project_lat]
            },
            'outputCoordinateSystem': f'{outputCoordinateSystem}'
        }

        id = create_project(api_token, organization_id, payload)

        if (id == ""):
            log("Failed to get project id. Exiting.")
            exit()

        project_id = id

    payload = {
        "name": f"{missionName}",
    }

    missionId = create_mission(api_token, project_id, payload)

    if (missionId == ""):
        log("Failed to create mission. Exiting.")
        exit()
        
    uploadPhotos(api_token, missionId, directoryPath)

    processMissionById(api_token, missionId)

except Exception as e:
    ex_type, ex, tb = sys.exc_info()

    msg = "...MissionProcessor failed: {}".format(
        traceback.format_exception(ex_type, ex, tb))
    
    del tb

    log(str(e))

finally:
    elapsedTime = time.time() - startTime

    # observed during testing approx 2.2 minutes per image
    log(f"MissionProcessor completed, elapsedTime: {elapsedTime/60} minutes")