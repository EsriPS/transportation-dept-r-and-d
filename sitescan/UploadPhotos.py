import os
import requests

# Placeholder for the actual API Token and Mission ID
api_token = 's.7cbb99a1-8784-411e-b443-ecb2869d78bf.VpYabUm8zKgLtMzrN656ncAcAzrIAid7etdJrHN4'
mission_id = '4b63a0a9-290f-426d-afa4-03221e3a1565'

# The directory containing the photos you want to upload
directory_path = r'C:/bob/Samples/SiteScan/MissionImages'

# The endpoint URL for uploading media to a mission
url = f'https://sitescan-api.arcgis.com/api/v2/missions/{mission_id}/media'

# Headers including the Authorization token
headers = {
    'Authorization': f'Bearer {api_token}'
}

# Go through each file in the directory
for filename in os.listdir(directory_path):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
        print(f'Uploading {filename}...')

        # Full path to the image file
        file_path = os.path.join(directory_path, filename)

        # Open the file in binary-read mode
        with open(file_path, 'rb') as image_file:
            # The 'files' parameter is used to upload files in a multipart/form-data format.
            files = {'file': (filename, image_file, 'image/jpeg')}

            # Make a POST request to upload the file
            response = requests.post(url, headers=headers, files=files)

            # Check if the request was successful
            if response.status_code == 201:
                print('Image uploaded successfully.')
            else:
                print('Failed to upload image.')
                print(f'Status Code: {response.status_code}')
                print(f'Response: {response.text}')
    else:
        print(f'Skipping {filename}, not a supported image format.')