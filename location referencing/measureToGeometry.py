import urllib.request, urllib.parse, urllib.error
import json
import logging
import os
import datetime
import time

# ------------------------------------------------------------------------------
# MeasureToGeometry.py
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
# 4. Update the pointLocations variable below for your route id and measures
# 5. Update the lineLocations variable below for your route id and measures
# 6. Update the outSR variable below if needed
# 7. Update locations.append(***pointLocations***) as needed
#
# Processing:
#
# This sample converts one or more measure values into geographic locations along a set of routes. If the measures 
# cannot be converted to a valid geometry (point or line), a status message is returned with the reason the conversion failed.
#
# References:
#
# https://developers.arcgis.com/rest/services-reference/enterprise/measure-to-geometry.htm
#
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# Global Variables
# ------------------------------------------------------------------------------

# LRServer (example: https://your-server/server/rest/services/MAPIT/MAPITLRService/MapServer/exts/LRServer/networkLayers/3/measureToGeometry)
LRServer_URL = r'https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer/exts/LRServer/networkLayers/3/measuretogeometry'

# logfile location
logLocation = 'C:/temp'

# logfile name - the log name will be prefixed with YYYY-MM-DD_HH_MM
logName = 'measureToGeometry.log'

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
        logging.info(f"spatialreference: {spatialreference}")

        locations = ret['locations']
  
        for location in locations:
            logging.info(f"status: {location['status']}")
            logging.info(f"routeId {location['routeId']}")
            logging.info(f"geometryType: {location['geometryType']}")
            if (location['geometryType'] == 'esriGeometryPoint'):
                logging.info(f"X: {location['geometry']['x']}")
                logging.info(f"Y: {location['geometry']['y']}")
            else:
                logging.info(f"hasZ: {location['geometry']['hasZ']}")
                logging.info(f"hasM: {location['geometry']['hasM']}")
                for path in location['geometry']['paths']:
                    for i in range(len(path)):
                        logging.info(f"path[{i}]: {path[i]}")

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
            "outSR": f"{outSR}",
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

        # pointLocations = {
        #     "routeId": "I391 NB",
        #     "measure": 3.290
        # }

        # lineLocations = {
        #     "routeId": "I391 NB",
        #     "fromMeasure": 3.290,
        #     "toMeasure": 3.3
        # }

        pointLocations = {
            "routeId": "PK907A",
            "measure": 10.3873
        }

        lineLocations = {
            "routeId": "IN678",
            "fromMeasure": 11.6545,
            "toMeasure": 11.6863
        }
    
        locations = []

        locations.append(pointLocations)

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