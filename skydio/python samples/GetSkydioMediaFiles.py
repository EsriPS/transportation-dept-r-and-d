import requests
import json
import os
import datetime
import time
import logging
import sys
import traceback

# ------------------------------------------------------
# py script to download images from skydio
#
# prerequisites:
#
# 1. Create a token using skydio (make sure token scope includes media_files)
# 2. Update the token in the script
# 3. Update the vehicle_serial in the script
# 4. Update the download_folder in the script
# 5. Update the logFilePath in the script
# 6. Update the Kind setting in the script
# ------------------------------------------------------
#

# ------------------------------------------------------
# setup logging
# ------------------------------------------------------

logName = datetime.datetime.now().strftime('%Y_%m_%d_%H-%M_%S_') + '_GetSkydioMediaFiles.log'

logFilePath = f'YOUR LOG LOCATION HERE{logName}'

logging.basicConfig(level=logging.DEBUG, filename=logFilePath,
                    format='%(asctime)s %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

def log(message, both=True):
    logging.info(message)
    if (both):
        print(message)

# ------------------------------------------------------
# setup py variables
# ------------------------------------------------------

# notes:
# download_folder is where the images will be downloaded to. (If the mission was flown in multiple parts, download to the same folder).
download_folder = 'C:/bob/Projects/CalTrans/calms/skydio/downloads' 

base_url = "https://api.skydio.com/api/v0/media_files"
vehicle_serial = "YOUR VEHICLE ID HERE"
per_page = 100
pre_signed_download_urls = True
token = "YOUR TOKEN HERE"
captured_before = "YOUR CAPTURED BEFORE DATE HERE"  # Example: "2024-01-26T20:32:00"
captured_since = "YOUR CAPTURED SINCE DATE HERE"  # Example: "2024-01-26T20:16:00"

# kinds (array of string)
# vehicleImageDng - DNG images captured in flight
# vehicleVideoPreview - LRV Recording of the full flight
# vehicleVideoRaw - Video recording of the flight when the vehicle was in “video mode”. (Not recorded when the vehicle is in “photo mode”).
# videoTelemetryCsv - CSV file with telemetry aligned to the vehicleVideoRaw
# vehicleIrImage - IR images captured in flight

kind = "vehicleImage"

page1Url = f'{base_url}?vehicle_serial={vehicle_serial}&kind={kind}&pre_signed_download_urls={pre_signed_download_urls}&per_page={per_page}&page_number=1'

headers = {
    "accept": "application/json",
    "Authorization": f"{token}"
}

# ------------------------------------------------------
# do processing
# ------------------------------------------------------

startTime = time.time()
totalPhotosDownloaded = 0
totalPhotosSkipped = 0
totalPhotos = 0

try:
    log(f"Processing started, startTime: {startTime}")

    response = requests.get(page1Url, headers=headers, verify=False)

    log(f'response.text: {response.text}')

    data = json.loads(response.text)
    pagination = data['data']['pagination']
    current_page = pagination['current_page']
    max_per_page = pagination['max_per_page']
    total_pages = pagination['total_pages']

    log(f"Current Page: {current_page}")
    log(f"Max Per Page: {max_per_page}")
    log(f"Total Pages: {total_pages}")

    files = data['data']['files']

    for page in range(1, total_pages + 1):
        pageUrl = f'{base_url}?vehicle_serial={vehicle_serial}&kind={kind}&pre_signed_download_urls={pre_signed_download_urls}&per_page={per_page}&page_number={page}'
        response = requests.get(pageUrl, headers=headers, verify=False)
        page_data = response.json()
        files = page_data['data']['files']
        
        for file in files:
            totalPhotos += 1
            download_url = file['download_url']
            filename = file['filename']
            file_path = os.path.join(download_folder, filename)
            
            if os.path.exists(file_path):
                log(f"Skipped file: {totalPhotos}, {filename} already exists.")
                totalPhotosSkipped += 1
                continue
            
            response = requests.get(download_url)
            with open(file_path, 'wb') as f:
                f.write(response.content)
            
            log(f"Downloaded file: {totalPhotos}, {filename} to {file_path}")
            totalPhotosDownloaded += 1

except Exception as e:
    ex_type, ex, tb = sys.exc_info()

    msg = "...Processing failed: {}".format(
        traceback.format_exception(ex_type, ex, tb))
    
    del tb

    log(str(e))

finally:
    elapsedTime = time.time() - startTime
    # observed during testing approx 2.2 minutes per image
    log(f"Processing completed, elapsedTime: {elapsedTime/60} minutes. Average minutes per image: {(elapsedTime / totalPhotos)/60}")