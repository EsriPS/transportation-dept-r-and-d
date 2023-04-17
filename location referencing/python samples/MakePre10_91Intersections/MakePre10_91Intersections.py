import arcpy
import logging
import uuid
import m2g
import g2m
import datetime
import os
import time

# ==================================================================================
# MakePre10_91Intersections version 1.0.1
#
# Description:
# --------------------
# This py formats a 10.9.1 LRSI_Intersections featureclass into pre 9.1 format
#
# Important settings:
# --------------------
#
#   src: set this to be the source 10.9.1 LRSI_Intersections
#   dest: set this to be the converted LRSI_Intersections_DOT (note: it is truncated and rehydrated per run)
#
#   out_folder_path = r'c:\mylogs'

#   onlyProcessRowCount: -1 means process all src rows, onlyProcessRowCount=# means only process the first # input rows
#
#   insertCursorFieldsList_test = if you have a test environment set this to an array of dest field names
#   insertCursorFieldsList_prod = for the prod environment set this to an array of dest field names
#
#   comment out the insertCursorFieldsList_xxx that is not being used
#
#   insertCursorFieldsList = set this to either insertCursorFieldsList_test or insertCursorFieldsList_prod (depends on which environment you are executing in)
#
# Sample usage:
#   src = r'C:\Users\robe3501\Documents\ArcGIS\Projects\MakePre10_91Intersections tester\Testing as SDE.sde\Testing.SDE.LRSI_Intersections'
#   dest = r'C:\Users\robe3501\Documents\ArcGIS\Projects\MakePre10_91Intersections tester\Testing as SDE.sde\Testing.SDE.LRSI_Intersections_DOT'
#
#   onlyProcessRowCount = -1 means process all src rows, onlyProcessRowCount=# means only process # rows
#
#   insertCursorFieldsList_test = ['IntersectionId', 'IntersectionName', 'RouteId', 'FeatureId', 'Measure', 'SHAPE', 'FromDate']
#   insertCursorFieldsList_prod = ['Intersection_Id', 'Intersection_Name', 'Route_Id', 'Feature_Id', 'Measure', 'SHAPE', 'From_Date]
#   insertCursorFieldsList = insertCursorFieldsList_test
#
# g2m
#   if a calibration is not actually at an intersection, g2m can return an error 400
# ================================================================================== 

# ----------------------------------------------------------
# configure the logger
# ----------------------------------------------------------

out_folder_path = r'YOUR LOG FOLDER'

log_file = out_folder_path + datetime.datetime.today().strftime('\MakePre10_91Intersections_%Y-%m-%d.log')

counter = 1
while os.path.exists(log_file):
    log_file = out_folder_path + datetime.datetime.today().strftime(f'\MakePre10_91Intersections_%Y-%m-%d_{counter}.log')
    counter += 1
 
print("log_file: " + log_file)

logging.basicConfig(level=logging.DEBUG, 
                    format='[%(asctime)s] %(levelname)-6s %(message)s',
                    datefmt='%Y-%m-%d %H:%M:%S',
                    filename=log_file,
                    filemode='a')

console = logging.StreamHandler()

console.setLevel(logging.DEBUG) 

formatter = logging.Formatter('%(name)-12s: %(levelname)-8s %(message)s')

console.setFormatter(formatter)

logging.getLogger('').addHandler(console)

logger = logging.getLogger('')

# ----------------------------------------------------------
# init variables
# ----------------------------------------------------------

src = r'YOUR SDE CONNECTION FILE\Testing.SDE.LRSI_Intersections'
dest = r'YOUR SDE CONNECTION FILE\Testing.SDE.LRSI_Intersections_DOT'

outsr = str(arcpy.Describe(src).spatialReference.factoryCode)

# fields within the dest featureclass
insertCursorFieldsList = ['IntersectionId', 'IntersectionName', 'RouteId', 'FeatureId', 'Measure', 'SHAPE', 'FromDate']
insertCursorFieldsList = insertCursorFieldsList

# onlyProcessRowCount= -1 means process all src rows, onlyProcessRowCount=# means only process # input rows
totalRowsProcessed = 0
onlyProcessRowCount = -1

# ----------------------------------------------------------
# getMeasure
# ----------------------------------------------------------
def getMeasure(measures, routeID):
    # use routeID to search the measures array and return the corresponding measure
    measure = measures[measures.index(routeID) + 1]
    return measure

# ----------------------------------------------------------
# getAllMeasures
# ----------------------------------------------------------
def getAllMeasures(meas, routeIDs):

    routeIDList = routeIDs.split(",")
    geometry = m2g.convertMeasureToGeometry(routeIDList[0], meas, outsr)

    measureList = []
    for routeID in routeIDList:
        # prep the data
        meas = g2m.convertGeometryToMeasure(routeID, geometry, 50, outsr)
        measureList.extend([routeID, meas])

    # expected output format: ['R1','M1','R2','M2'...]
    return measureList

# ----------------------------------------------------------
# process src to dest
# ----------------------------------------------------------

start = time.time()

logger.info("MakePre10_91Intersections started.")

try:
    arcpy.management.TruncateTable(dest)
except arcpy.ExecuteError as e:
    print(f"An error occured during truncate_data in {dest}: {e}")
    logger.error(f"An error occured during truncate_data in {dest}: {e}")

# these are the source indexes as defined in the LRSI_Intersections feature class
src_INTERSECTIONID = 1
src_INTERSECTIONNAME = 2
src_ROUTEID = 3
src_FEATUREID = 4
src_MEASURE = 8
src_shape = 14
src_fromdate = 6

# these are the indexes within the list defined above as ...
dest_INTERSECTIONID = 0
dest_INTERSECTIONNAME = 1
dest_ROUTEID = 2
dest_FEATUREID = 3
dest_MEASURE = 4
dest_shape = 5
dest_fromdate = 6

# only process current routes (not historical)
whereClause="ToDate is Null"    #Prod=To_Date

try:
    with arcpy.da.InsertCursor(dest, insertCursorFieldsList) as insert_cursor:
        with arcpy.da.SearchCursor(src, "*", whereClause) as search_cursor:

            for s_row in search_cursor:

                totalRowsProcessed = totalRowsProcessed + 1

                print(f'Processing source: {s_row[src_ROUTEID]}')
                logger.info(f'Processing source: {s_row[src_ROUTEID]}')
                
                routeList = s_row[src_INTERSECTIONNAME].split(",")

                for r in range(0, len(routeList), 1):
                    if (r==0):
                        measures = getAllMeasures(s_row[src_MEASURE], s_row[src_ROUTEID])

                    for x in range(r+1, len(routeList), 1):

                        # ----------------------------------------------------------
                        # make the tuple a list so it can be updated
                        # ----------------------------------------------------------

                        iList = insertCursorFieldsList

                        # ----------------------------------------------------------
                        # process original row
                        # ----------------------------------------------------------

                        routeIDList = s_row[src_ROUTEID].split(',')

                        # if (r==0):
                        #     iList[dest_INTERSECTIONID] = s_row[src_INTERSECTIONID]
                        # else:
                        iList[dest_INTERSECTIONID] = uuid.uuid4()
                            
                        iList[dest_INTERSECTIONNAME] = f'{routeList[r]} & {routeList[x]}'
                        iList[dest_ROUTEID] = routeIDList[r]
                        iList[dest_FEATUREID] = routeIDList[x]
                        iList[dest_MEASURE] = getMeasure(measures, routeIDList[r])
                        iList[dest_shape] = s_row[src_shape]
                        iList[dest_fromdate] = s_row[src_fromdate]

                        insert_cursor.insertRow(iList)

                        print(f'Forward processing: {routeList[r]} & {routeList[x]}')
                        logger.info(f'Forward processing: {routeList[r]} & {routeList[x]}')

                        # ----------------------------------------------------------
                        # process reversed row
                        # ----------------------------------------------------------
                        
                        iList[dest_INTERSECTIONID] = uuid.uuid4()
                        iList[dest_INTERSECTIONNAME] = f'{routeList[x]} & {routeList[r]}'
                        iList[dest_ROUTEID] = routeIDList[x]
                        iList[dest_FEATUREID] = routeIDList[r]
                        iList[dest_MEASURE] = getMeasure(measures, routeIDList[x])
                        iList[dest_shape] = s_row[src_shape]
                        iList[dest_fromdate] = s_row[src_fromdate]

                        insert_cursor.insertRow(iList)

                        print(f'Reverse processing: {routeList[x]} & {routeList[r]}')
                        logger.info(f'Reverse processing: {routeList[x]} & {routeList[r]}')

                if (onlyProcessRowCount != -1 and totalRowsProcessed == onlyProcessRowCount):
                    break

except Exception as e:
    logger.error('MakePre10_91Intersections failed: ' + str(e))
finally:
    elapsed_time = time.time() - start
    logger.info("MakePre10_91Intersections completed. Total time elapsed " + time.strftime("%H:%M:%S", time.gmtime(elapsed_time)) + ", total rows: " + str(totalRowsProcessed))