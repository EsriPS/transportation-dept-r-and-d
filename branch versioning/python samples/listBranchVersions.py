from arcgis.gis import GIS

def listBranchVersions(version_management_url):
	# Connect to your GIS organization
	gis = GIS("https://YOUR-PORTAL/portal", "YOUR-USERNAME", "YOUR-PASSWORD")
	
	try:
		list_version_response = gis._con.post(version_management_url)

		print(f"Branch versions:")

		for version in list_version_response.get('versions', []):
			print(f"...Name: {version.get('versionName')}, Guid: {version.get('versionGuid')},")
		return True
		
	except Exception as e:
		print(f"Failed to list branch version: {e}")
		return False
	


if __name__ == "__main__":
	version_management_url = "https://YOUR-PORTAL/server/rest/services/PushPullTester/PushPullTester/VersionManagementServer/versions"
	listBranchVersions(version_management_url)

	pass
	