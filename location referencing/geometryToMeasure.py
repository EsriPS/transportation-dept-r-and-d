import urllib.request, urllib.parse, urllib.error
import json
import logging
import os
import datetime
import time

# ------------------------------------------------------------------------------
# GeometryToMeasure.py
#
# Intent:
#
# Illustrate Esri Location Referencing API being called from python
#
# Setup:
#
# 1. Update the LRServer_URL variable below to point to your sites LRServer
# 2. Update the logLocation variable below to point to your sites log location
# 3. Update the logName variable below if needed
# 4. Update the locationOfInterest variable below for your route id and geometry
# 5. Update the tolerance variable below
# 6. Update the outSR variable below if needed
#
# Processing:
#
# This operation converts one or more geographic locations into measure values along a set of routes. If a point location cannot 
# be converted to a measure value, a status message is returned with the reason the conversion failed. The following table lists the possible locating statuses.
#
# References:
#
# https://developers.arcgis.com/rest/services-reference/enterprise/geometry-to-measure.htm
#
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Global Variables
# ------------------------------------------------------------------------------

# LRServer (example: https://your-server/server/rest/services/MAPIT/MAPITLRService/MapServer/exts/LRServer/networkLayers/3/measureToGeometry)
LRServer_URL = r'https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer/exts/LRServer/networkLayers/3/geometrytomeasure'

# logfile location
logLocation = 'C:/temp'

# logfile name - the log name will be prefixed with YYYY-MM-DD_HH_MM
logName = 'geometryToMeasure.log'

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

        unitsOfMeasure = ret['unitsOfMeasure']
        logging.info(f"unitsOfMeasure: {unitsOfMeasure}")

        spatialreference = ret['spatialReference']['wkid']
        logging.info(f"spatialreference: {spatialreference}")

        locations = ret['locations']
  
        for location in locations:
            logging.info(f"status: {location['status']}")
            results = location['results']
            for result in results:
                logging.info(f"routeId {result['routeId']}")
                logging.info(f"measure: {result['measure']}")
                logging.info(f"distance: {result['distance']}")  
                logging.info(f"geometryType: {result['geometryType']}")
                logging.info(f"x: {result['geometry']['x']}")
                logging.info(f"y: {result['geometry']['y']}")

    except Exception as e:
        logging.error(f"...showResults failed: {e}")

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        logging.info("showResults completed, Elapsed time (seconds): %02d" % elapsed_time)

        return result

# -------------------------------------------------------------------------------
# convertGeometryToMeasure
# ------------------------------------------------------------------------------

def convertGeometryToMeasure(locations, tolerance, outSR):
    logging.info("convertGeometryToMeasure started")

    start_time = time.time()

    try:

        tmp = json.dumps(locations)
        
        req = tmp.replace(" ","")

        url = f"{LRServer_URL}" 
        params = { 
            "locations": f"{locations}", 
            "tolerance": f"{tolerance}",
            "outSR": f"{outSR}",
            "f": "json"
        }    
        
        query_string = urllib.parse.urlencode( params ) 
        
        url = url + "?" + query_string 
 
        with urllib.request.urlopen( url ) as response: 
            response_text = response.read() 
            showResults( response_text ) 

    except Exception as e:
        logging.error(f"...convertGeometryToMeasure failed: {e}")

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        logging.info("convertGeometryToMeasure completed, Elapsed time (seconds): %02d" % elapsed_time)
    
# -------------------------------------------------------------------------------
# main
# ------------------------------------------------------------------------------

def main():

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

        logging.info("geometryToMeasure started.")

        locationOfInterest = {
            "routeId" : "PK907A",
            "geometry" : { "x" : -8217907.3388524465, "y" : 4981410.2417535065 }
        }
    
        tolerance = 50

        locations = []

        locations.append(locationOfInterest)

        outSR = "102100"

        convertGeometryToMeasure(locations, tolerance, outSR)

    except Exception as e:
        logging.error(f"...geometryToMeasure failed: {e}")

    finally:
        end_time = time.time()

        elapsed_time = end_time - start_time
        logging.info("geometryToMeasure completed, Elapsed time (seconds): %02d" % elapsed_time)

if __name__ == "__main__":
    main()