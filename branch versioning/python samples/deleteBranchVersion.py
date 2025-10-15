from arcgis.gis import GIS

def deleteBranchVersion(version_management_url, versionToDelete):
	gis = GIS("https://YOUR-PORTAL/portal", "YOUR-USERNAME", "YOUR-PASSWORD")
	
	try:
		delete_version_url = f"{version_management_url}/delete"
		delete_version_params = {
			"versionName": versionToDelete,
			"f": "json"
		}

		delete_version_response = gis._con.post(delete_version_url, delete_version_params)

		if delete_version_response.get('success'):
			print(f"Deleted branch version: {versionToDelete}")
			return True
		else:
			print(f"Failed to delete branch version: {delete_version_response}")
			return False

	except Exception as e:
		print(f"Failed to delete branch version: {e}")
		return False

if __name__ == "__main__":
	version_management_url = "https://YOUR-PORTAL/server/rest/services/PushPullTester/PushPullTester/VersionManagementServer"
	deleteBranchVersion(version_management_url, versionToDelete="ADMIN.YOUR-VERSION-NAME")

	pass
	