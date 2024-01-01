import arcpy
from pymongo import MongoClient

# ==============================================================================
# MakePointsOnSegment.py
#
# Description: This script creates a point feature class from a MongoDB collection
#              of locations. The script creates a point feature class in a file
#              geodatabase and populates it with the locations from the MongoDB
#              collection.
#
# Requirements: This script requires the pymongo module to be installed in the
#               Python environment. The pymongo module can be installed using
#               the Python Package Manager (pip) or by downloading the module
#               from https://pypi.org/project/pymongo/#files and installing it
#               manually.
#
#              This script also requires the MongoDB server to be running and
#              the MongoDB database to be populated with the locations collection. 
#
#               MongoDB compass was used to populate the MongoDB database a nd to create the locations collection.
#
#               Sample data for the Locations collection in MongoDB:
#               json:
#                   { "name": "I10-1", "lat": 34.0, "lon": -117.0 }
#                   { "name": "I10-2", "lat": 34.1, "lon": -117.1 }
#                   { "name": "I10-3", "lat": 34.2, "lon": -117.2 }
#               csv:
#                   name,lat,lon
#                   I10-1,34.0,-117.0
#                   I10-2,34.1,-117.1
#                   I10-3,34.2,-117.2
# ==============================================================================
#
# ------------------------------------------------------------------------------
# set these variables to your fgdb and the feature class name you want to create
# ------------------------------------------------------------------------------
fgdb = 'C:/temp/MakePointsOnSegment.gdb'
fcName = 'pointsOnSegments'
fc = f'{fgdb}/{fcName}'
# ------------------------------------------------------------------------------

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')

# connect to the MongoDB, change the connection string per your MongoDB environment
db = client['SegmentPoints']

# get the locations collection
collection = db['Locations']

# list the collections
collist = db.list_collection_names()

# check if the "Locations" collection exists
if "Locations" in collist:
  print("Locations collection exists.")

# list all documents in the "Locations" collection
for x in collection.find():
  print(x)

# return only the names
for x in collection.find({},{ "_id": 0, "name": 1}):
  print(x)

# exclude "name" field
for x in collection.find({},{ "name": 0 }):
  print(x)

# filter the result
colQuery = { "name": "I210-2" }

mydoc = collection.find(colQuery)

for x in mydoc:
  print(x)

# delete the feature class if it exists
if arcpy.Exists(fc):
    arcpy.Delete_management(fc)

# Create an empty point feature class
arcpy.CreateFeatureclass_management(fgdb, fcName, 'POINT', '', '', '', 'WGS 1984')

# Add fields to the feature class
arcpy.AddField_management(fc, 'Name', 'TEXT')
arcpy.AddField_management(fc, 'lat', 'DOUBLE')
arcpy.AddField_management(fc, 'lon', 'DOUBLE')

# Open an insert cursor
cursor = arcpy.da.InsertCursor(fc, ["SHAPE@", "name", "lat", "lon"])

# Iterate over the MongoDB collection
for document in collection.find():
    lat = document['lat']
    lon = document['lon']
    name = document['name']

    # Create a point geometry
    point = arcpy.Point(lon, lat)
    point_geometry = arcpy.PointGeometry(point)

    # Insert the feature into the feature class
    cursor.insertRow([point_geometry, name, lat, lon])

# Clean up
if cursor:
    del cursor

# end of script