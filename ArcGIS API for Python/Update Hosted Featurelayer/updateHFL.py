import time
from arcgis.gis import GIS
from arcgis.features import FeatureLayer
# from arcgis.features import FeatureSet

"""
Simple example of...
1. Delete all features from the hosted feature layer
2. Add features to a hosted feature layer
3. Query the hosted feature layer for a specific feature
4. Update the feature from step 2.
5. Delete all features from the hosted feature layer

Prereqs:
1. Publish a hosted featurelayer on arcgis.com. Use settings tab to enable desired editing
    Example schema:
        OBJECTID ObjectID
        TicketNo String
        TicketDateTime Date
        AuditDateTime Date
        Net Integer
        Unit Small Integer
        Description String
        CustomerName String
        JobName String
        VoidStatus Small Integer
        LocationID Small Integer
        LocationName String
        CarrierID Small Integer
        VehicleID Small Integer
        TodayLoads Integer
        Qty Integer
        ProductID String
        Deputy Small Integer
        Supplier Small Integer
        Plant Small Integer
        ProjectID String
        DOTLatitude Double
        DOTLongitude Double
        ContractorLatitude Double
        ContractorLongitude Double
        GlobalID GlobalID
        CreationDate Date
        Creator String
        EditDate Date
        Editor String
2. Update GIS object creation below to use your org, username and password. Usertype=Editor, Role=Data Editor
3. Update layer_index below to be the specific layer you wish to use for testing
4. Create a group
5. Share the featurelayer into the group (owner + group)
6. Add the user to the same group

Py usage notes:
1. Set break points in this py to "pause" execution and review results within the service

Useful references:
1. Online unix time converte: https://www.unixtimestamp.com/
2. Rest service end point: https://services6.arcgis.com/KQPLo5Nh7ljZGmv4/ArcGIS/rest/services/HaulHubTester/FeatureServer/0/query
    2.1 Set Where to be 1=1, Outfields to be: * and click Query(Get)... to see features existing in the service

"""

# ------------------------------------------------------------------------------
# Global Variables
# ------------------------------------------------------------------------------

gis = GIS(url="YOUR-ARCGIS-COM", username="YOUR-USERNAME",
          password="YOUR-PASSWORD", verify_cert=False)

# -------------------------------------------------------------------------------
# feature_layer object (ArcGIS API for Python)
# ------------------------------------------------------------------------------

# itemid of the published hosted featurelayer
item = gis.content.get("YOUR-HOSTED-FEATURELAYER-ITEMID")

# index of the item within the featurelayer to be edited
layer_index = 0

# return reference to the featurelayer
feature_layer = item.layers[layer_index]

# -------------------------------------------------------------------------------
# addFeatures
# ------------------------------------------------------------------------------

def addFeatures():
    print("addFeatures started.")

    start_time = time.time()

    try:
        # simple array of two features to add
        # source of this content is up-to-you
        features_to_append = [
                {"attributes":{"OBJECTID":1,"TicketNo":"1","TicketDateTime":1683558000000,"AuditDateTime":1683558000000,"Net":7,"Unit":1,"Description":"Desc-1","CustomerName":"Customer-1","JobName":"Test Project-1","VoidStatus":1,"LocationID":1,"LocationName":"Location-1","CarrierID":1,"VehicleID":1,"TodayLoads":1,"Qty":1,"ProductID":"1","Deputy":1,"Supplier":1,"Plant":1,"ProjectID":"ID-1","DOTLatitude":34.001511368072727,"DOTLongitude":-117.81887276566927,"ContractorLatitude":34.001511368072698,"ContractorLongitude":-117.81887276566898},"geometry":{"x":-13040450.7103,"y":4036849.5451000035}},
                {"attributes":{"OBJECTID":2,"TicketNo":"2","TicketDateTime":1683558000000,"AuditDateTime":1683558000000,"Net":7,"Unit":2,"Description":"Desc-2","CustomerName":"Customer-1","JobName":"Test Project-2","VoidStatus":2,"LocationID":2,"LocationName":"Location-2","CarrierID":2,"VehicleID":2,"TodayLoads":2,"Qty":2,"ProductID":"2","Deputy":2,"Supplier":2,"Plant":2,"ProjectID":"ID-2","DOTLatitude":34.0014482,"DOTLongitude": -117.8188657,"ContractorLatitude":34.0014482,"ContractorLongitude":-117.8188657},"geometry":{"x":-13040450.815486103,"y":4036849.5451000035}},
            ]
        
        result = feature_layer.edit_features(adds=features_to_append)
            
        if 'addResults' in result:
            print("Features appended successfully.")
        else:
            print("Failed to append features.")

    except Exception as e:
        print(f"...addFeatures failed: {e}")

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        print("addFeatures completed, Elapsed time (seconds): %02d" % elapsed_time)

# -------------------------------------------------------------------------------
# deleteAllFeatures
# ------------------------------------------------------------------------------

def deleteAllFeatures():
    print("deleteAllFeatures started.")

    start_time = time.time()

    try:
        feature_layer.delete_features(where="1=1")

    except Exception as e:
        print(f"...updateFeature failed: {e}")

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        print("deleteAllFeatures completed, Elapsed time (seconds): %02d" % elapsed_time)

# -------------------------------------------------------------------------------
# def updateFeature():
# ------------------------------------------------------------------------------

def updateFeature(feat):

    print("updateFeature started.")

    start_time = time.time()

    feat.attributes['JobName'] = "New JobName"

    try:
        feature_layer.edit_features(updates=[feat])

    except Exception as e:
        print(f"...updateFeature failed: {e}")

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        print("updateFeature completed, Elapsed time (seconds): %02d" % elapsed_time)

# -------------------------------------------------------------------------------
# queryFeature
# ------------------------------------------------------------------------------

def queryFeature(whereClause):
    print("queryFeature started")

    start_time = time.time()

    result = None

    try:
        feature_set = feature_layer.query(
            where=whereClause, 
            out_fields='*', 
            return_count_only=False, 
            return_ids_only=False, 
            return_geometry=False)

        print(f'featureset len: {len(feature_set)}, features: {feature_set.features}')

        result = feature_set.features[0]

    except Exception as e:
        print.error(f"...queryFeature failed: {e}")
        result = None

    finally:
        end_time = time.time()
        elapsed_time = end_time - start_time
        print("queryFeature completed, Elapsed time (seconds): %02d" % elapsed_time)
        return result

# -------------------------------------------------------------------------------
# main
# ------------------------------------------------------------------------------

def main():

    try:
        start_time = time.time()

        # start demo with an empty feature layer
        deleteAllFeatures()

        # add a couple of features
        addFeatures()

        # query for a specific feature
        feat = queryFeature("JobName='Test Project-1'")

        # update an attribute of the feature
        updateFeature(feat)

        # delete all features
        deleteAllFeatures()

    except Exception as e:
        print(f"...updateHFL failed: {e}")

    finally:
        end_time = time.time()

        elapsed_time = end_time - start_time
        print("updateHFL completed, Elapsed time (seconds): %02d" % elapsed_time)

if __name__ == "__main__":
    main()