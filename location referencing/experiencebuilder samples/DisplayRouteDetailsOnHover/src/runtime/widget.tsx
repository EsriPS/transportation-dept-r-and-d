import { React, AllWidgetProps } from 'jimu-core';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { useState, useRef } from 'react';
import { IMConfig } from "../config";
import FeatureLayer from 'esri/layers/FeatureLayer'
import Extent from 'esri/geometry/Extent'
import request from 'esri/request'

/**
 * Widget
 * @param props 
 * @returns 
 */
export default function Widget (props:AllWidgetProps<IMConfig>) {

  /**
   * refs
   * Note: useRef returns an object whose reference will not change across re-renders. The actual value for x is then kept in the ".current" property of the useRef object. 
   * Mutating the .current property *****doesn’t cause a re-render*****
   * https://reactjs.org/docs/hooks-reference.html#useref
   */

  /**
   * refs
   */
   let Graphic = useRef(null);
   let fl = useRef(null);

  /**
   * state 
   */
  const [jmv, setjimuMapView] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [uom, setUOM] = useState("");
  const [routeID, setRouteID] = useState("");
  const [measure, setMeasure] = useState("");

  /**
   * Styles
   */
  const styles = {
    ButtonStyle: {
        marginRight: "5px",
        marginTop: "5px",
        marginBottom: "5px"
    },
    Wrapper : {
      display: "flex",
      flexDirection: "column" as "column",
      alignItems: "center",
      width: "100%",
      height: "100%",
      padding: "5px",
      margin: "0px",
      color: "#444",
      overflow: "hidden"
    },
    row: {
      display: 'flex',
      flexDirection: "row" as "row",
      flexWrap: "wrap" as "wrap",
      width: '100%'
    }
  }

  /**
   * addNetwork
   */
  const addNetwork = (jmv) => {
    console.log("addNetwork called");

    fl.current = new FeatureLayer({url: props.config.networkurl});

    jmv.view.map.add(fl.current);

    jmv.view.whenLayerView(fl.current).then(function(layerView) {
      console.log("we now have a layerView...");
    });

  }

  /**
   * zoomToExtent
   * @param jmv 
   * @param xmin 
   * @param ymin 
   * @param xmax 
   * @param ymax 
   * @param sr 
   */
  const zoomToExtent = (jmv, xmin,ymin,xmax,ymax,sr) => {
    let extent = new Extent({xmin:xmin, ymin:ymin, xmax:xmax, ymax:ymax, spatialReference: sr});
    jmv.view.goTo(extent)
  }

  /**
   * processRequest
   * @param jmv 
   * @param pt 
   */
  const processRequest = (jmv, x, y) => {
    console.log("processRequest called")

    let locations = [
      {
        'geometry': {
            'x': x,
            'y': y
        }
      }
    ];

    let fivePixels = (jmv.view.extent.width / jmv.view.width) * 5;

    let content = {
        'locations': JSON.stringify(locations),
        'tolerance': fivePixels,
        'inSR': jmv.view.spatialReference.wkid,
        'f': "json"
    };

    let soeURL = props.config.g2murl

    request(soeURL, {
      responseType: "json",
      query: content,
    }).then((response) => {
        
        console.log(response.data)

        jmv.view.graphics.removeAll()

        // Parse the response
        const measureUnit = response.data.unitsOfMeasure;
        const locations = response.data.locations;
        //const title = "Route Location";
        //let content = "Unit of Measure: " + measureUnit;

        let i = 0;

        while (response.data.locations[i]) {
            let status = response.data.locations[i].status;
            // Removing the "esriLocating" part from the status result.
            if (status.indexOf("esriLocating") == 0) {
                status = status.substring("esriLocating".length);
            }
            if (status === "OK") {
              let results = response.data.locations[i].results;
              for (let j = 0; j < results.length; j++) {
                  setUOM(measureUnit)
                  setRouteID(results[j].routeId)
                  setMeasure(results[j].measure)
              }
            }
            i++;
        }

      }, (error) => {
        console.log("geometrytomeasure api error: " + error)
      });
  }

  /**
   * activeViewChangeHandler
   * @param jmv 
   */
  const activeViewChangeHandler = (jmv: JimuMapView) => {
    console.log("activeViewChangeHandler called...");
      
    // note: jmv.view is a arcgis javascript 4.x mapview instance
    if (jmv) {

      console.log("activeViewChangeHandler called, JMV: ", jmv);

      jmv.view.popup.visible= false

      setjimuMapView(jmv)

      addNetwork(jmv)

      // could get from the FL upon loaded
      let xmin = -8241602.81762082
      let ymin = 4972629.538129259
      let xmax = -8204989.48107227
      let ymax =  4985031.445968512
      let sr = 102100

      zoomToExtent(jmv, xmin, ymin, xmax, ymax, sr)

      jmv.view.on('pointer-move', function(evt) {
        console.log('pointer-move')
        jmv.view.hitTest(evt).then(function(r) {
         if(r.results.length > 0 && r.results[0].graphic) {

          console.log("evt.x= " + evt.x + ", evt.y= " + evt.y);

          processRequest(jmv, r.results[0].mapPoint.x, r.results[0].mapPoint.y)

         } else {
            console.log("no results found")
         }
       });
      });

    }

  }

  // if (props.state='CLOSED') {
  //  do-something...
  //}

  /**
   * the UI
   */
  return <div className="widget-starter jimu-widget" style={{ overflow: "auto" ,padding: "0px"}}>

      {props.hasOwnProperty("useMapWidgetIds") &&
        props.useMapWidgetIds &&
        props.useMapWidgetIds.length === 1 && (
          <JimuMapViewComponent
            useMapWidgetId={props.useMapWidgetIds?.[0]}
            onActiveViewChange={activeViewChangeHandler}
          />
        )
      }

      <div style={styles.Wrapper}>
        <div style={styles.row}>
          <div >
            <div >
              <p>Hover over a route to display details</p>
              <p><b>Unit of measure:</b> {uom}</p>
              <p><b>RouteID:</b> {routeID}</p>
              <p><b>Measure:</b> {measure}</p>
            </div>
          </div>
        </div>
      </div>

    </div>

  }