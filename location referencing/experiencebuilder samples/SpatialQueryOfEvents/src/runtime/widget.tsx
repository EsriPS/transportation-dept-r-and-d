import { React, AllWidgetProps, FormattedMessage } from 'jimu-core';
import { useState, useEffect, useRef } from 'react';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { IMConfig } from "../config";
import FeatureLayer from 'esri/layers/FeatureLayer'
import Extent from 'esri/geometry/Extent'

/**
 * Functional Component
 * @param props 
 * @returns 
 */

//
// Description:
// --------------------------------------------------
// Simple app to do a query and display event results (current as well as historical)
//
// Sample component settings:
// --------------------------------------------------
// Map Service: https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer
// Visible Layers: 0,1
// Query layer Index: 1 (index position within Visible Layers)
// Event ID (attribute name within your event fc, eg. eventid)
// Route ID (attribute name within your event fc, eg. routeid
// From Measure (attribute name within your event fc, , eg. frommeasure)
// To Measure (attribute name within your event fc, eg. tomeasure)
// Functional Class Type (attribute name within your event fc, , eg. functionalclasstype)
// To Date (attribute name within your event fc, , eg. todate)
// ---------------------------------------------------
// Map Service: https://transdemo3.esri.com/server/rest/services/akdot-test/lrs_service/MapServer
// Visible Layers: 7,8
// Query layer Index: 1 (index position within Visible Layers)
// Event ID (attribute name within your event fc, eg. Event_ID)
// Route ID (attribute name within your event fc, eg. Route_ID
// From Measure (attribute name within your event fc, , eg. From_MPT)
// To Measure (attribute name within your event fc, eg. To_MPT)
// Functional Class Type (attribute name within your event fc, , eg. Functional_Class)
// To Date (attribute name within your event fc, , eg. To_Date)

// Notes:
// Upon launching the component it initially zooms to the query layer extent center

export default function Widget (props:AllWidgetProps<IMConfig>) {

  /**
   * refs
   * Note: useRef returns an object whose reference will not change across re-renders. The actual value for x is then kept in the ".current" property of the useRef object. 
   * Mutating the .current property *****doesn’t cause a re-render*****
   * https://reactjs.org/docs/hooks-reference.html#useref
   */

  let fl = useRef([]);
  const queryLayerIndex = useRef(parseInt(props.config.querylayerindex))

  let initRequired = useRef(true);
  let onClickHandler = useRef(null);

  let resultFeatures = useRef(null);
  let resultPt = useRef(null);
  let isTriggered = useRef(false);

  const [jmv, setjimuMapView] = useState(null);

  /**
   * useEffect is fired at startup and when jmv variable changes
   */
  useEffect(() => {
    console.log("jmv useEffect called");
    
    if (jmv && initRequired.current) {
      init();
    } else {
      console.log("jmv useEffect called -- processing skipped");
    }
  }, 
    [jmv]
  )

  /**
   * reset
   */
    const reset = () => {
    if (jmv) {
      jmv.view.graphics.removeAll()
    }
  }

  /**
   * showFeature
   * @param feature 
   * @param pt 
   * @param jmv 
   */
  const showFeature = (feature, pt) => {
    console.log("showFeature called...");

    //construct infowindow title and content
    let attr = feature.attributes;

    let title = "Functional Class Event " + attr[props.config.eventid].replaceAll("{","(").replaceAll("}",")");

    let status = !attr[props.config.to_date] ? "Current" : "Historical";

    let content = "Route ID : " + attr[props.config.routeid] +
    "<br/>Begin Measure : " + attr[props.config.frommeasure] +
    "<br/>End Measure : " + attr[props.config.tomeasure] + 
    "<br/>Functional Class Type : " + attr[props.config.functionalclasstype] +
    "<br/>Status : " + status
    
    const popupRoutes = {
      "title": title,
      "content": content
    }

    fl.current[queryLayerIndex.current].popupTemplate =  popupRoutes
  }

  /**
   * queryUsingSpatialFilter
   */
  const queryUsingSpatialFilter = (x, y) => {
    console.log("queryUsingSpatialFilter called...");

    console.log("we now have a layerView...");

    let query = jmv.view.layerViews.items[queryLayerIndex.current].createQuery();

    let pixelBuffer = (jmv.view.extent.width / jmv.view.width) * 10;

    let xmin = x - pixelBuffer
    let ymin = y - pixelBuffer
    let xmax = x + pixelBuffer
    let ymax = y + pixelBuffer

    let sr = jmv.view.spatialReference.wkid

    let extent = new Extent({xmin:xmin, ymin:ymin, xmax:xmax, ymax:ymax, spatialReference: sr})
      
    query.geometry = extent;

    query.distance = 1;
    query.units = "feet";
    query.spatialRelationship = "intersects";  // this is the default
    query.returnGeometry = true;

    query.outFields = [ "*" ];

    const pt = jmv.view.toScreen(x,y);

    fl.current[queryLayerIndex.current].popupEnabled=true;

    fl.current[queryLayerIndex.current].queryFeatures(query).then(function(results){
      // prints an array of all the features in the service to the console
      console.log(results.features);
      resultFeatures.current = results.features
      resultPt.current = pt
      if (results.features.length > 0) {
        showFeature(results.features[0], pt);
      }
    });

  }

  /**
   * addMapLayers
   * @param jmv 
   */
    const addMapLayers = () => {
      console.log("addMapLayers called");

      const flArray = props.config.visiblelayers.split(',')

      for (let index = 0; index < flArray.length; index++) {
        let flUrl = `${props.config.mapservice}/${flArray[index]}`
        fl.current[index] = new FeatureLayer({url: flUrl});

        if (String(index) === props.config.querylayerindex) {
          fl.current[index].when(() => {
            const initialExtent = Extent.fromJSON(fl.current[index].sourceJSON.extent);
            jmv.view.goTo(initialExtent.center);
          });
        }
      }

      jmv.view.map.addMany(fl.current);
  
      jmv.view.popup.watch("selectedFeature", function(e) {
        console.log("selectedFeature called: " + jmv.view.popup.selectedFeatureIndex)

        if (e) {
          showFeature(resultFeatures.current[jmv.view.popup.selectedFeatureIndex], resultPt.current)
        } else {
          // the < > popup result navigator is not triggered
          isTriggered.current = false;
          console.log("selectedFeature called, e is null or triggered")
        }
      });
    }

  /**
   * activeViewChangeHandler
   * @param jmv 
   */
    const activeViewChangeHandler = (jmv: JimuMapView) => {
      console.log("activeViewChangeHandler called");

      setjimuMapView(jmv)
    }

    /**
     * init
     */
    const init = () => {
      console.log("init called");

      addMapLayers()

      initRequired.current = false;
    }

    console.log("props.state = " + props.state);

    if (props.state=='OPENED' && !onClickHandler.current) {
      if (jmv) {
        onClickHandler.current = jmv.view.on("click", evt => {

          console.log("evt.x= " + evt.x + ", evt.y= " + evt.y);
          console.log("evt.mapPoint.x= " + evt.mapPoint.x + ", evt.mapPoint.y= " + evt.mapPoint.y)

          const pt = jmv.view.toMap(evt.mapPoint.x,evt.mapPoint.y);

          jmv.view.popup.close();

          queryUsingSpatialFilter(evt.mapPoint.x, evt.mapPoint.y)

        });
      }
    } else if (props.state=='CLOSED') {
      onClickHandler.current.remove();
      onClickHandler.current = null;
      // fl.current.popupEnabled=false;
      jmv.view.graphics.removeAll();
      jmv.view.popup.close();
    }

    /**
     * the UI
     */
    return <div className="widget-starter jimu-widget" style={{ overflow: "auto" ,padding: "20px"}}>

      {props.hasOwnProperty("useMapWidgetIds") &&
        props.useMapWidgetIds &&
        props.useMapWidgetIds.length === 1 && (
          <JimuMapViewComponent
            useMapWidgetId={props.useMapWidgetIds?.[0]}
            onActiveViewChange={activeViewChangeHandler}
          />
        )}

      <div >
        <p>Click on a Functional Class line event to run a query.</p>
      </div>

    </div>

}