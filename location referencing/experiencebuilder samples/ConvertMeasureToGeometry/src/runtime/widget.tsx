import { React, AllWidgetProps } from 'jimu-core';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Spinner, Popover, PopoverBody, PopoverHeader} from 'reactstrap';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { useState, useEffect, useRef } from 'react';
import { IMConfig } from "../config";
import { TextInput} from 'jimu-ui';
import Graphic from 'esri/Graphic'
import FeatureLayer from 'esri/layers/FeatureLayer'
import Extent from 'esri/geometry/Extent'
import request from 'esri/request'

// /const { useEffect, useRef } = React;

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
  // let sample = useRef(null);
  // example access: sample.current
  //
  // The useRef Hook allows you to persist values between renders.
  // It can be used to store a mutable value that does not cause a re-render when updated.
  // https://www.w3schools.com/react/react_useref.asp

  /**
   * state
   */

  const [jmv, setjimuMapView] = useState(null);
  const [results, setResults] = useState("");
  const [locateEnabled, setLocateEnabled] = useState(false);
  const [network, setNetwork] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [routeID, setRouteID] = useState("");
  const [fromMeasure, setFromMeasure] = useState("");
  const [toMeasure, setToMeasure] = useState("");
  const [processing, setProcessing] = useState(false)
  const [popoverResults, setPopoverResults] = useState("Stretch the widget to see processing details")
  const [showM2GResults, setShowM2GResults] = useState(false)

  useEffect(() => {
    enableLocate()}
    , [routeID,fromMeasure,toMeasure])

  /**
   * styles
   */
   const styles = {
    row: {
      display: 'flex',
      flexDirection: "row" as "row",
      flexWrap: "wrap" as "wrap",
      width: '100%',
      padding: "5px",
      marginTop: "10px",
      justifyContent: "center"
    },
    p: {
      margin: "10px 5px 0px 0px",
      fontWeight: "bold"
    }
  }

  /**
   * enableLocate
   */
  const enableLocate = () => {
    console.log("enableLocate called")

    if (routeID.length > 0 && fromMeasure.length > 0) {
      setLocateEnabled(true)
    } else {
      setLocateEnabled(false)
    }
  }

  /**
   * routeIDChangeHandler
   * @param evt 
   */
  const routeIDChangeHandler = (evt) => {
    console.log("routeIDChangeHandler called...: " + evt)
    setRouteID(evt)
  }

  /**
   * fromMeasureChangeHandler
   * @param evt 
   */
  const fromMeasureChangeHandler = (evt) => {
    console.log("fromMeasureChangeHandler called...: " + evt)
    setFromMeasure(evt)
  }

  /**
   * toMeasureChangeHandler
   * @param evt 
   */
  const toMeasureChangeHandler = (evt) => {
    console.log("toMeasureChangeHandler called...:" + evt)
    setToMeasure(evt)
  }

  /**
   * resetUI
   */
  const resetUI = () => {
    if (jmv) {
      jmv.view.graphics.removeAll()
    }
  }

  /**
   * addNetwork
   */
  const addNetwork = (jmv) => {

    let featureLayer = new FeatureLayer({url: props.config.networkurl});

    setNetwork(featureLayer)

    jmv.view.map.add(featureLayer);

    jmv.view.whenLayerView(featureLayer).then(function(layerView) {
      console.log("we now have a layerView...");
    });

  }

  /**
   * locate
   */
  const locate = () => {

    setProcessing(true);

    // Set up SOE URL and parameters
    //let soeURL = "https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer/exts/LRServer/networkLayers/3/measureToGeometry"
    let soeURL = props.config.m2gurl

    let routeId = routeID;
    let beginMeasure = fromMeasure;
    let endMeasure = toMeasure;

    // note: any used to facilitate ts / dynamic properties
    let measureLocation:any = {
        'routeId': routeId
    };

    if (endMeasure && endMeasure.replace(/\s/g, "") != "") {
        measureLocation.fromMeasure = beginMeasure;
        measureLocation.toMeasure = endMeasure;
    } else {
        measureLocation.measure = beginMeasure;
    }

    let locations = [measureLocation];

    let content = {
        'locations': JSON.stringify(locations),
        'outSR': jmv.view.spatialReference.wkid,
        'f': "json"
    };

    request(soeURL, {
      responseType: "json",
      query: content,
    }).then((response) => {
      setProcessing(false);
      showResponse(response)
    }, (error) => {
      setProcessing(false);
      showError(error)
    });

  }

  /**
   * showError
   * @param error 
   */
  const showError = (error) => {
    console.log("showError called")
    let results = "<p>Request Failed</p>"
    results += "<br/><br/>"
    results += error.message
    setResults(results)
    setShowResults(true)
  }

  /**
   * showResponse
   * @param response 
   */
  const showResponse = (response) => {
    console.log("showResponse called")

    setShowM2GResults(true)

    jmv.view.graphics.removeAll()

    // Parse the response
    let locations = response.data.locations;

    let content = "<b>Processing details</b>";

    for (var i = 0; i < locations.length; i++) {
        const location = locations[i];
        const routeId = location.routeId;
        const geometryType = location.geometryType;
        let status = location.status;

        // Remove the "esriLocating" part from the status result.
        if (status.indexOf("esriLocating") == 0) {
            status = status.substring("esriLocating".length);
        }

        content+= "<br/>Status: " + status
        content+="<br/>Route ID: " + routeId
        content+="<br/>Geometry Type: " + geometryType
        const geometryJson = JSON.stringify(location.geometry) 
        content+="<br/>Geometry: " + (geometryJson.length < 300 ? geometryJson : (geometryJson.substr(0, 1000)+  "......."))

        setResults(content)

        if (location.geometry == null)
            continue;

        if (geometryType == "esriGeometryPoint") {
          let zm = 12;
  
          jmv.view.center.x = location.geometry.x
          jmv.view.center.y = location.geometry.y

          jmv.view.goTo({
            target: jmv.view.center
          });

          drawPointSymbol(jmv, location.geometry)

        } else {

          drawLineSymbol(jmv, location.geometry)
        }
    }
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
   * drawLineSymbol
   * @param jmv 
   * @param geom 
   */
   const drawLineSymbol = (jmv, geom) => {
    console.log("drawLineSymbol called...");

    let lineSymbol = {
      type: "simple-line",  // autocasts as new SimpleFillSymbol()
      color: [ 255,0,0],
      style: "dash",
      width: "4"
    };

    geom.type = "polyline"
    geom.spatialReference = jmv.view.spatialReference

    const lineGraphic = new Graphic({
      geometry: geom,
      symbol: lineSymbol
    });

    zoomToExtent(jmv, 
      lineGraphic.geometry.extent.xmin, 
      lineGraphic.geometry.extent.ymin, 
      lineGraphic.geometry.extent.xmax, 
      lineGraphic.geometry.extent.ymax,
      jmv.view.spatialReference)
    
    // Add the graphics to the view's graphics layer
    jmv.view.graphics.add(lineGraphic)
  }

  /**
   * drawPointSymbol
   * @param jmv 
   * @param geom 
   */
  const drawPointSymbol = (jmv, geom) => {
    console.log("drawPointSymbol called...");

    let pointSymbol = {
      type: "simple-marker",  // autocasts 
      color: [ 255,0, 0, 0.9 ],
      style: "circle",
      size: "20px"
    };

    geom.type = "point"
    geom.spatialReference = jmv.view.spatialReference

    const pointGraphic = new Graphic({
      geometry: geom,
      symbol: pointSymbol
    });

    // Add the graphics to the view's graphics layer
    jmv.view.graphics.add(pointGraphic)
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

          let xmin = -8241602.81762082
          let ymin = 4972629.538129259
          let xmax = -8204989.48107227
          let ymax =  4985031.445968512
          let sr = 102100

          zoomToExtent(jmv, xmin, ymin, xmax, ymax, sr)
          
          setLocateEnabled(true);
          
          // jmv.view.on("immediate-click", evt => {

          //     console.log("evt.x= " + evt.x + "evt.y= " + evt.y);

          //     const pt = jmv.view.toMap({
          //       x: evt.x,
          //       y: evt.y
          //     });

          //     do-something(jmv, pt)

          // });

      }

    }

    const createMarkup = () => {
      return {__html: results};
    }
    
    const LocateResults = () => {
      // dangerouslySetInnerHTML is React’s replacement for using innerHTML in the browser DOM
      // https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
      return <div dangerouslySetInnerHTML={createMarkup()} style={{ overflowY: "auto", height: "100%", width:'100%'}} />;
    }

    const closePopover = () {
      console.log("closePopover called")
      setShowM2GResults(false)
    }

    if (props.state=='CLOSED') {
     resetUI();
    }
    
    /**
     * the UI
     */
    return <div className="widget-starter jimu-widget" style={{ overflow: "hidden" ,padding: "0px"}}>

        {props.hasOwnProperty("useMapWidgetIds") &&
          props.useMapWidgetIds &&
          props.useMapWidgetIds.length === 1 && (
            <JimuMapViewComponent
              useMapWidgetId={props.useMapWidgetIds?.[0]}
              onActiveViewChange={activeViewChangeHandler}
            />
          )
        }

        <div  id="blockUserInput" style={{height:"100%", width:"100%", overflow: "hidden", pointerEvents: processing ? 'none' : 'all', opacity: processing ? '.4' : '1.0'}}>

          <div style={{ overflow: "hidden" ,margin: "5px"}}>

            <p style={styles.p}>RouteID:</p>
            <div>
              <TextInput className='runtime-title w-50' title={"Enter route ID (e.g. IN228)"} onAcceptValue={(e) => { routeIDChangeHandler(e); }} />
            </div>

            <p style={styles.p}>From Measure:</p>
            <div>
              <TextInput className='runtime-title w-50' title={"Enter from measure (e.g. 30)"} onAcceptValue={(e) => { fromMeasureChangeHandler(e); }} />
            </div>

            <p style={styles.p}>To Measure (optional):</p>
            <div>
              <TextInput className='runtime-title w-50' title={"Enter to measure (e.g. (31)"} onAcceptValue={(e) => { toMeasureChangeHandler(e); }} />
            </div>

          </div> 

          <div style={styles.row}>
            <Button id="Popover1" color="primary" style={{margin: "10px 0px 0px 5px!important"}} onClick={locate} disabled={!locateEnabled}>
              {!processing ? "Locate" : "Locating "} 
              {processing ? (
                <Spinner
                  style={{ width: ".9rem", height: ".9rem" }}
                  type="border"
                  color="White"
                />
              ) : null }
            </Button>

            {!processing ? (
              <Popover
                flip
                target="Popover1"
                isOpen={showM2GResults}
                toggle={function noRefCheck(){}}
              >
                <PopoverHeader style={{display:"flex", justifyContent: "center"}}>
                  <Button color="info" outline onClick={closePopover}>Dismiss</Button>
                </PopoverHeader>

                <PopoverBody>
                  {popoverResults}
                </PopoverBody>
              </Popover>
           ) : null }

            <div style={styles.row}>
              {showResults ? <label style={{fontSize:"1.5em", fontWeight: "bold"}}>Locate Results</label> : null }  
              <div style={{width: "100%"}}>
                <LocateResults/>
              </div>
            </div>

          </div>

      </div>

    </div>

  }