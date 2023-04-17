import urllib.request, urllib.parse, urllib.error
import json
import logging
import os
import datetime
import time
import sys

# ------------------------------------------------------------------------------
# Global Variables
# ------------------------------------------------------------------------------

logger = logging.getLogger('')

# LRServer (example: https://your-server/server/rest/services/MAPIT/MAPITLRService/MapServer/exts/LRServer/networkLayers/3/measureToGeometry)
#LRServer_URL = r'https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer/exts/LRServer/networkLayers/3/geometrytomeasure'
LRServer_URL = r'https://transdemo3.esri.com/server/rest/services/akdot-test/lrs_service/MapServer/exts/LRServer/networkLayers/2/geometrytomeasure'

# -------------------------------------------------------------------------------
# def formatResults(response_str):

# ------------------------------------------------------------------------------

def formatResults(response_str):

    measure = None

    try:
        logger.info(f"formatResults started.")

        start_time = time.time()

        logger.info(f'response_str: {response_str}')

        ret = json.loads(response_str)

        unitsOfMeasure = ret['unitsOfMeasure']
        logger.info(f"unitsOfMeasure: {unitsOfMeasure}")

        spatialreference = ret['spatialReference']['wkid']
        logger.info(f"spatialreference: {spatialreference}")

        locations = ret['locations']
  
        for location in locations:
            logger.info(f"status: {location['status']}")
            results = location['results']
            for result in results:
                measure= result['measure']
                break

    except Exception as e:
        logger.error(f"...showResults failed: {e}")
        sys.exit()

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        logger.info("showResults completed, Elapsed time (seconds): %02d" % elapsed_time)

        return measure

# -------------------------------------------------------------------------------
# convertGeometryToMeasure
# ------------------------------------------------------------------------------

def convertGeometryToMeasure(routeID, location, tolerance, outSR):
    logger.info("convertGeometryToMeasure started")

    start_time = time.time()

    try:

        locationOfInterest = {
            "routeId" : routeID,
            "geometry" : location
        }
    
        tolerance = 50

        locations = []

        locations.append(locationOfInterest)

        url = f"{LRServer_URL}" 
        params = { 
            "locations": f"{locations}", 
            "tolerance": f"{tolerance}",
            "outSR": f"{outSR}",
            "f": "json"
        }    
        
        logger.info(f"...url: {url}, params: {params}")
        
        query_string = urllib.parse.urlencode( params ) 
        
        url = url + "?" + query_string 

        with urllib.request.urlopen( url ) as response: 
            response_text = response.read() 
            measure = formatResults( response_text )
            return measure 

    except Exception as e:
        logger.error(f"...convertGeometryToMeasure failed: {e}")
        sys.exit()
        
    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        logger.info("convertGeometryToMeasure completed, Elapsed time (seconds): %02d" % elapsed_time)
    