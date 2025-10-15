from arcgis.gis import GIS

def makeBranchVersion(branch_version_name, version_management_url):
	gis = GIS("https://YOUR-PORTAL/portal", "YOUR-USERNAME", "YOUR-PASSWORD")
	
	try:
		create_version_url = f"{version_management_url}/create"
		create_version_params = {
			"versionName": branch_version_name,
			"description": "Branch version for editing",
			"accessPermission": "public",
			"f": "json"
		}

		create_version_response = gis._con.post(create_version_url, create_version_params)

		if create_version_response.get('success'):
			print(f"Created branch version: {branch_version_name}")
			return True
		else:
			print(f"Failed to create branch version: {create_version_response}")
			return False
		
	except Exception as e:
		print(f"Failed to check or create branch version: {e}")
	return False


if __name__ == "__main__":
    branch_version_name = "YOUR-VERSION-NAME"
    version_management_url = "https://YOUR-PORTAL/arcgis/rest/services/Hosted/YourFeatureService/FeatureServer/manageVersions"
    makeBranchVersion(branch_version_name, version_management_url)
	