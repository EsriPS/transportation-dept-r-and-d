import arcpy

# ---------------------------------------------------------------------
# Simple example illustrating registering an ALRS
#
# Notes:
# The type of versioning used is determined by the database connection for the input dataset; 
# Versioning Type is a property set in the Geodatabase Connection Properties dialog of a 
# database connection. 
# ---------------------------------------------------------------------


# example format: r"D:\\MyConnectionFiles\\abc.sde/ALRS"
alrs = r"name of your connection.sde/name of your 10.9.1 ALRS feature dataset"

# reference: https://pro.arcgis.com/en/pro-app/latest/tool-reference/data-management/register-as-versioned.htm
arcpy.RegisterAsVersioned_management(alrs)