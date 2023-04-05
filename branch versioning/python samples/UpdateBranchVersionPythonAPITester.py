import arcpy

from arcgis.gis import GIS
from arcgis.features import FeatureLayer
from arcgis.features import FeatureSet

# ----------------------------------------------------------------------------------
# Simple python to illustrate updating a branch versioned feature class using the 
# python API
# --------------------------------------------------------------------------------

# --------------------------------------------------------------------------------
# Initialize necessary variables
# --------------------------------------------------------------------------------
serviceURL = r"https://rmeyering1.esri.com/server/rest/services/Test/testFC/FeatureServer/0"

yourPortal = "https://your-portal/portal"
yourUsername = "yourUsername"
yourPassword = "yourPassword"

gis = GIS(url= yourPortal, username= yourUsername, password= yourPassword, verify_cert=False)

feature_layer = FeatureLayer(serviceURL, gis=gis, container=None, dynamic_layer=None)

# -----------------------------------------------------------
# getUpdateList
# -----------------------------------------------------------
def getUpdateList(field, whereClause):

	rows = None

	try:
		rows = feature_layer.query(
			where= whereClause,
			out_fields= field)

	except Exception as e:
		print(f"...getUpdateList failed: {e}")
		rows = None

	finally:
		return feature_layer, rows

# -----------------------------------------------------------
# update_field
# -----------------------------------------------------------	
def update_field(field, newValue, whereClause):

	field = field

	feature_layer, updateList = getUpdateList(field, whereClause)

	if (updateList != None and len(updateList) > 0):
		for row in updateList:
			# update the attribute
			row.attributes[field] = newValue

		# post updates to the feature layer
		feature_layer.edit_features(updates=updateList)

# -----------------------------------------------------------
# run
# -----------------------------------------------------------
def run():

	update_field("PK", "New Value", "1=1")
	
	print("all done")

# -----------------------------------------------------------
# main
# -----------------------------------------------------------
if __name__ == "__main__":
    run()
