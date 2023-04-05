import arcpy

# ----------------------------------------------------------------------------------
# Simple python to illustrate using arcpy.da.updatecursor on branch versioned FC
# --------------------------------------------------------------------------------

# --------------------------------------------------------------------------------
# Initialize necessary variables
# --------------------------------------------------------------------------------

# feature server with Feature Access and Version Management capabilities enabled
workspace="https://rmeyering1.esri.com/server/rest/services/Test/testFC/FeatureServer"

# Index of a feature class to update in the above feature server
fc="https://rmeyering1.esri.com/server/rest/services/Test/testFC/FeatureServer/0"

# can be any name (used by MakeFeatureLayer gp commmand)
lyr="lyr"

# use default (could be name of a branch version)
versionName =""

# fields in the fc
fields=['OBJECTID','PK']

# fc had only oid 1 and 2
oid=1

arcpy.management.MakeFeatureLayer(fc,lyr)
arcpy.management.ChangeVersion(lyr,"BRANCH",versionName)

with arcpy.da.Editor(workspace) as edit:
    with arcpy.da.UpdateCursor(lyr, fields) as cursor:
        for row in cursor:
            # if you have the right objectID, set PK = new value
            if (row[0] == oid):
                row[1] = 'new value'
                cursor.updateRow(row)

print("all done")