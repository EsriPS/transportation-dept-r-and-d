from itertools import count
import urllib
import urllib.request, urllib.parse, urllib.error
from urllib.request import Request, urlopen
import json
import arcpy
import logging
import os
import datetime
import time
from arcgis.gis import GIS
from arcgis.features import FeatureLayer
from arcgis.features import FeatureSet

# ------------------------------------------------------------------------------
# synchRHEvents.py
#
# processing:
#
# get a pinfo token (urllib...)
# get unique Project Numbers from LRSE_Projects (ArcGIS API for Python)
# for all unique project numbers
#   query pinfo for project attributes (urllib...)
#   get corresponding event rows (ArcGIS API for Python)
#   update the event rows to include latest pinfo attributes (ArcGIS API for Python)
#
# usage as a scheduled task:
#   to configure as a scheduled task:
#
#   1. Determine the location of your python.exe
#   2. Set the "global variables" below for your environment
#   3. Configure the windows scheduled task (widnows task scheduler)
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Global Variables
# ------------------------------------------------------------------------------

# LRServer
# LRServer_URL = r'https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer/exts/LRServer/networkLayers/3/measuretogeometry'
LRServer_URL = r'https://transdemo2.esri.com/server/rest/services/MAPIT/MAPITLRService/MapServer/exts/LRServer/networkLayers/3/measureToGeometry'
# logfile location
logLocation = 'C:/temp'

# logfile name - the log name will be prefixed with YYYY-MM-DD_HH_MM
logName = 'measureToGeometry.log'

# -------------------------------------------------------------------------------
# RHResponse (utility class)
# ------------------------------------------------------------------------------

class RHResponse:

    def __init__(self, 
        spatialReference, 
        locations
    ):
        self.spatialReference = spatialReference
        self.Locations = locations

# -------------------------------------------------------------------------------
# showResults
# ------------------------------------------------------------------------------

def showResults(response_str):

    result = None

    try:
        logging.info(f"showResults started.")

        start_time = time.time()

        logging.info(f'response_str: {response_str}')

        ret = json.loads(response_str)

        spatialreference = ret['spatialReference']['wkid']
        locations = ret['locations']
  
        for location in locations:
            logging.info(f"status: {location['status']}'")
            logging.info(f"routeId {location['routeId']}'")
            logging.info(f"geometryType: {location['geometryType']}'")
            if (location['geometryType'] == 'esriGeometryPoint'):
                logging.info(f"X: {location['geometry']['x']}'")
                logging.info(f"Y: {location['geometry']['y']}'")
            else:
                logging.info(f"X: {location['geometry']['hasZ']}'")
                logging.info(f"X: {location['geometry']['hasM']}'")
                for path in location['geometry']['paths']:
                    for i in range(len(path)):
                        logging.info(f"path[{i}]: {path[i]}'")

    except Exception as e:
        logging.error(f"...showResults failed: {e}")

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        logging.info("showResults completed, Elapsed time (seconds): %02d" % elapsed_time)

        return result

# -------------------------------------------------------------------------------
# convertMeasureToGeometry
# ------------------------------------------------------------------------------

def convertMeasureToGeometry(locations, outSR):
    logging.info("convertMeasureToGeometry started")

    start_time = time.time()

    fs = None

    try:

        tmp = json.dumps(locations)
        
        req = tmp.replace(" ","")

        url = f"{LRServer_URL}" 
        params = { 
            "locations": f"{locations}", 
            "outsr": f"{outSR}",
            "f": "json"
        }    
        
        query_string = urllib.parse.urlencode( params ) 
        
        url = url + "?" + query_string 
 
        with urllib.request.urlopen( url ) as response: 
            response_text = response.read() 
            showResults( response_text ) 

    except Exception as e:
        logging.error(f"...convertMeasureToGeometry failed: {e}")
        fs = None

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        logging.info("convertMeasureToGeometry completed, Elapsed time (seconds): %02d" % elapsed_time)
        return fs
    
# -------------------------------------------------------------------------------
# main
# ------------------------------------------------------------------------------

def main():
    """
    Get the project data from the projects service and update the corresponding
    features in the events feature class.
    """
    try:
        start_time = time.time()
        prefix = datetime.datetime.now().strftime('%Y_%m_%d_%H-%M_')
        LogFile = os.path.join(logLocation, prefix + logName)

        # uncomment the DEBUG logging config below and comment out the INFO
        # logging to additional debug messages will then be logged

        # DEBUG logging configuration
        # logging.basicConfig(level=logging.DEBUG,
        #   filename=LogFile,
        #   format='%(asctime)s %(message)s',
        #   datefmt='%Y-%m-%d %H:%M:%S')

        # INFO logging configuration
        logging.basicConfig(
            level=logging.INFO,
            filename=LogFile,
            format='%(asctime)s %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S')

        logging.info("measureToGeometry started.")

        pointLocations = {
            "routeId": "I391 NB",
            "measure": 3.290
        }

        #{"routeId":"I90","fromMeasure":25.1,"toMeasure":26.8}
        lineLocations = {
            "routeId": "I391 NB",
            "fromMeasure": 3.290,
            "toMeasure": 3.3
        }

        locations = []
        locations.append(lineLocations)

        outSR = "102100"

        geometry = convertMeasureToGeometry(locations, outSR)

    except Exception as e:
        logging.error(f"...measureToGeometry failed: {e}")

    finally:
        end_time = time.time()

        elapsed_time = end_time - start_time
        logging.info("measureToGeometry completed, Elapsed time (seconds): %02d" % elapsed_time)

if __name__ == "__main__":
    main()