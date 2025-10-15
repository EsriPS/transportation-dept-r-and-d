from arcgis.gis import GIS


def print_dict_contents(data):
	for key, value in data.items():
		print(f"...{key}: {value}")


def listVMSCapabilities(version_management_url):
	gis = GIS("https://YOUR-PORTAL/portal", "YOUR-USERNAME", "YOUR-PASSWORD")
	
	try:
		list_vms_capabilities_response = gis._con.post(version_management_url)

		print(f"VMS Capabilities:")
		print_dict_contents(list_vms_capabilities_response['capabilities'])

		return True

	except Exception as e:
		print(f"Failed to list branch version: {e}")
		return False
	
if __name__ == "__main__":
	version_management_url = "https://YOUR-PORTAL/server/rest/services/PushPullTester/PushPullTester/VersionManagementServer"
	listVMSCapabilities(version_management_url)

	