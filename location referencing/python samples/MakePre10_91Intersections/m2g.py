import urllib.request, urllib.parse, urllib.error
import json
import logging
import os
import datetime
import time
import sys

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

logger = logging.getLogger('')

# LRServer (example: https://your-server/server/rest/services/MAPIT/MAPITLRService/MapServer/exts/LRServer/networkLayers/3/measureToGeometry)
#LRServer_URL = r'https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer/exts/LRServer/networkLayers/3/measuretogeometry'
LRServer_URL = r'https://transdemo3.esri.com/server/rest/services/akdot-test/lrs_service/MapServer/exts/LRServer/networkLayers/2/measureToGeometry'

# -------------------------------------------------------------------------------
# formatResults
# ------------------------------------------------------------------------------

def formatResults(response_str):

    try:
        logger.info(f"formatResults started.")

        start_time = time.time()

        logger.info(f'response_str: {response_str}')

        ret = json.loads(response_str)

        spatialreference = ret['spatialReference']['wkid']
        logger.info(f"spatialreference: {spatialreference}")

        locations = ret['locations']
  
        for location in locations:
            return location['geometry']

    except Exception as e:
        logger.error(f"...formatResults failed: {e}")
        sys.exit()

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        logger.info("formatResults completed, Elapsed time (seconds): %02d" % elapsed_time)

# -------------------------------------------------------------------------------
# convertMeasureToGeometry
# ------------------------------------------------------------------------------

def convertMeasureToGeometry(routeID, meas, outSR):
    logger.info("convertMeasureToGeometry started")

    start_time = time.time()

    try:

        location = {
            "routeId": routeID,
            "measure": meas
        }

        locations =[]

        locations.append(location)

        url = f"{LRServer_URL}" 
        params ={
            "locations": f'{locations}', 
            "outSR": f"{outSR}",
            "f": "json"
        }  
        
        logger.info(f"...url: {url}, params: {params}")
        
        query_string = urllib.parse.urlencode( params ) 
        
        url = url + "?" + query_string 
 
        with urllib.request.urlopen( url ) as response: 
            response_text = response.read() 
            # showResults( response_text ) 
            return formatResults( response_text)

    except Exception as e:
        logger.error(f"...convertMeasureToGeometry failed: {e}")
        sys.exit()

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        logger.info("convertMeasureToGeometry completed, Elapsed time (seconds): %02d" % elapsed_time)
    