import arcpy

# ---------------------------------------------------------------------
# Simple example illustrating un-registering an ALRS
#
# WARNING:
# Unregistering a branch versioned dataset without first posting all named 
# versions to the default version may result in a loss of edits.
# ---------------------------------------------------------------------

# example format: r"D:\\MyConnectionFiles\\abc.sde/ALRS"
alrs = r"name of your connection.sde/name of your 10.9.1 ALRS feature dataset"

# reference: https://pro.arcgis.com/en/pro-app/latest/tool-reference/data-management/unregister-as-versioned.htm
arcpy.UnregisterAsVersioned_management(alrs, "NO_KEEP_EDIT", "COMPRESS_DEFAULT")