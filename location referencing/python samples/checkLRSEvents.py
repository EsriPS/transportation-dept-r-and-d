#
# -------------------------------------------------------------------------------
# Simple py to run location referencing checkevents
#
# Usage notes:
# 	checkLRSEvent eventlist 			<- show list of event names and their service indexes
#
# 	checkLRSEvent analyze 3,7,8 	<- call check events for these three events
#
# Processing notes:
# 	for each event fc get the list of unique route ids
# 	call checkevents using the unique route_ids for the event fc
# -------------------------------------------------------------------------------
#

import json
import os
import datetime
import arcpy
import sys

# -------------------------------------------------------------------------------
# Initialize required settings
# -------------------------------------------------------------------------------
sdeConnection = "C:\\Users\\robe3501\\Documents\\ArcGIS\\Projects\\AKDOT Tester\\Testing as SA.sde/Testing.SDE.ALRS"
baseurl = "https://transdemo3.esri.com/server/rest/services/akdot-test/lrs_service/MapServer"

networklayersIndex = '2'

checkGaps = True
checkOverlaps = True
checkMeasuresNotOnRoute = True

route_id_field = "Route_ID"

# -------------------------------------------------------------------------------
# call_service
# -------------------------------------------------------------------------------
def call_service(url, query_dict):
    import urllib.request, urllib.parse, urllib.error
    import json

    query_string = urllib.parse.urlencode( query_dict ).encode("utf-8") 

    with urllib.request.urlopen( url, data=query_string ) as response: 
        resp = json.loads(response.read())
    return resp
				
# -------------------------------------------------------------------------------
# show Event Name and ID List
# -------------------------------------------------------------------------------   
def showEventNameAndIDList(): 
		
		try:
				#  Query to get event layer IDs
				url = baseurl + r'/exts/LRServer/eventLayers'
				query_dict = {
						'f': 'json'
				}

				resp = call_service(url, query_dict)

				for each_res in resp['eventLayers']:
						print(f"...featureClassName: {each_res['featureClassName']} ID: {each_res['id']}")
				
		except Exception as e:
				print("...showEventNameAndIDList failed: " + str(e))
														
		return

# -------------------------------------------------------------------------------
# get Event ID,FC List
# -------------------------------------------------------------------------------   
def getEventIDandFCList(): 
		
		eventIDandFCList = []
	
		try:
				#  Query to get event layer IDs
				url = baseurl + r'/exts/LRServer/eventLayers'
				query_dict = {
						'f': 'json'
				}

				resp = call_service(url, query_dict)

				for each_res in resp['eventLayers']:
						eventIDandFCList.append(f"{each_res['id']},{each_res['featureClassName']}")
				
		except Exception as e:
				eventIDandFCList = []
				print("...getEventIDandFCList failed: " + str(e))
		finally:
				return eventIDandFCList

# -------------------------------------------------------------------------------
# verify / log command line args
# -------------------------------------------------------------------------------

n = len(sys.argv)
if (n == 2):
		mode= sys.argv[1]
		if ("eventlist" in mode.lower()):
				showEventNameAndIDList()
				sys.exit()
		else:
				print("usage: python> checkEvents eventlist")
				print("usage: python> checkEvents analyze #,#,#")
				sys.exit()
elif (n == 3):
		mode= sys.argv[1]
		if ("analyze" in mode.lower()):
				eventListArg = sys.argv[2]
				eventList = eventListArg.split(',')
				numericEventList = [int(i) for i in eventListArg.split(',')]
				for event in eventList:
						if not event.isnumeric():
								print("usage: python> checkEvents eventlist")
								print("usage: python> checkEvents analyze #,#,#")
								sys.exit()  
		else:
				print("usage: python> checkEvents eventlist")
				print("usage: python> checkEvents analyze #,#,#")
				sys.exit()	
# -------------------------------------------------------------------------------
# get unique values for a field in a table
# -------------------------------------------------------------------------------    
def unique_values(table, field):
		with arcpy.da.SearchCursor(table, [field],route_id_field + " is not Null") as cursor:
				return sorted({row[0] for row in cursor})

# -------------------------------------------------------------------------------
# process event
# -------------------------------------------------------------------------------
def processEvent(event, routes):
		
		try:
				resp = None
				
				url = baseurl + r'/exts/LRServer/networkLayers/' + networklayersIndex +'/checkEvents'
				query_dict = {
						'eventLayerIds': [event],
						'locations': json.dumps(routes),
						'checkGaps': checkGaps,
						'checkOverlaps': checkOverlaps,
						'checkMeasuresNotOnRoute': checkMeasuresNotOnRoute,
						'f': 'json'
				}

				resp = call_service(url, query_dict)
		except Exception as e:
				resp = None
				print("...processEvent failed: " + str(e))
		
		return resp

# -------------------------------------------------------------------------------
# analyzeEvents
# -------------------------------------------------------------------------------

def analyzeEvents():
		
		try:
				arcpy.env.workspace = sdeConnection
		
				eventIdAndNameList = getEventIDandFCList()
				if (not eventIdAndNameList):
					print("...checkEvents aborted")
					sys.exit()
	
				serv_res = {}
			
				for event in eventList:

					index = [idx for idx, val in enumerate(eventIdAndNameList) if event in val]
					eventFromList = eventIdAndNameList[index[0]].split(",")
					eventID = eventFromList[0]
					eventFCName = eventFromList[1]
		 
					routeListSourceFC = eventFCName
		 
					routeList = unique_values(routeListSourceFC, route_id_field)
					
					print(f"...Analyzing Event id: {eventID}, event FC name: {eventFCName}, Unique routes: {len(routeList)}")
		 
					routeTuple = ()
					routes = list(routeTuple) 
					for route in routeList:
							routes.append({"routeId": route})

					resp = processEvent(eventID, routes)
					
					for each_res in resp["results"]:
							if each_res['layerId'] not in serv_res:
									serv_res[each_res['layerId']] = [each_res["type"] + ': ' + each_res["routeId"] + ' from Measure ' +
										str(each_res["fromMeasure"]) + ' to  Measure ' + str(each_res["toMeasure"])]
							else:
									serv_res[each_res['layerId']].append(each_res["type"] + ': ' + each_res["routeId"] + ' from Measure ' +
										str(each_res["fromMeasure"]) + ' to  Measure ' + str(each_res["toMeasure"]))
									
				if (len(serv_res) > 0):
					for event in eventList:
						resultList=serv_res.get(int(event))
						if (resultList != None):
							print(f"\n...analysis results for event id: {event}")
							for result in resultList:
								print(result)
						else:
							print(f"\n...no problems found for event id: {event}")
				else:
					print("...no event problems found")		

		except Exception as e:
				print("...analyzeEvents failed: " + str(e))
		finally:
				return

# -------------------------------------------------------------------------------
# main 
# -------------------------------------------------------------------------------

if __name__ == '__main__':
		
	print("checkLRSEvents started\n")

	analyzeEvents()

	print("\ncheckLRSEvents completed")