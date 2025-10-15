from arcgis.gis import GIS
from arcgis.features._version import VersionManager

def reconcile_and_post_version(version_mgmt_url, version_name, portal_url, username, password):
    """
    Reconciles and posts a version using the VersionManagementServer.

    Args:
        version_mgmt_url (str): URL to the VersionManagementServer endpoint.
        version_name (str): Name of the version to reconcile and post.
        portal_url (str): URL to the ArcGIS Portal.
        username (str): Portal username.
        password (str): Portal password.
    """
    try:
        # Connect to Portal
        gis = GIS(portal_url, username, password)

        # Access Version Management Server
        vms = VersionManager(version_mgmt_url, gis)

        vms.purge(version_name)

        # Get the version in edit mode
        # this implicitly starts an edit session for the version
        version = vms.get(version_name, mode="edit")

        # Reconcile
        version.reconcile()

        # post
        version.post()

        print(f"Version '{version_name}' reconciled and posted successfully.")

    except Exception as e:
        print(f"reconcile_and_post_version failed: {e}")

    finally:
        try:
            version.stop_editing()
        except:
            pass



if __name__ == "__main__":
    reconcile_and_post_version(
        version_mgmt_url="https://YOUR-PORTAL/server/rest/services/PushPullTester/PushPullTester/VersionManagementServer",
        version_name="ADMIN.YOUR-VERSION-NAME",
        portal_url="https://YOUR-PORTAL/portal",
        username="YOUR-USERNAME",
        password="YOUR-PASSWORD"
)