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
export default function Widget (props:AllWidgetProps<IMConfig>) {

  /**
   * refs
   * Note: useRef returns an object whose reference will not change across re-renders. The actual value for x is then kept in the ".current" property of the useRef object. 
   * Mutating the .current property *****doesn’t cause a re-render*****
   * https://reactjs.org/docs/hooks-reference.html#useref
   */

  let fl = useRef(null);

  let initRequired = useRef(true);
  let onClickHandler = useRef(null);

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
   * zoomToExtent
   * @param jmv 
   * @param xmin 
   * @param ymin 
   * @param xmax 
   * @param ymax 
   * @param sr 
   */
  const zoomToExtent = (xmin,ymin,xmax,ymax,sr) => {
    let extent = new Extent({xmin:xmin, ymin:ymin, xmax:xmax, ymax:ymax, spatialReference: sr});
    jmv.view.goTo(extent)
  }

  /**
   * showFeature
   * @param feature 
   * @param pt 
   * @param jmv 
   */
  const showFeature = (feature, pt) => {
    console.log("showFeature called...");

    jmv.view.graphics.removeAll()

    let lineSymbol = {
      type: "simple-line",  // autocasts as new SimpleFillSymbol()
      color: [ 255,0,0],
      style: "dash",
      width: "4"
    };
    
    feature.symbol= lineSymbol;

    jmv.view.graphics.add(feature)

    //construct infowindow title and content
    let attr = feature.attributes;
    let title = "Route " + attr.routename;
    let content = "Route ID : " + attr.routeid +
        "<br/>Route Name : " + attr.routename +
        "<br/>Mile Length : " + attr.milelength;

    const popupRoutes = {
      "title": title,
      "content": content
    }

    fl.current.popupTemplate =  popupRoutes
  }

  /**
   * showFeatureSet
   * @param fset 
   * @param pt 
   * @param jmv 
   */
  const showFeatureSet = (fset, pt) => {
    console.log("showFeatureSet called...");

    jmv.view.graphics.removeAll()

    //Save the feature set for later drilling down on a single feature
    let featureSet = fset;
    var numFeatures = featureSet.length;

    //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the infowindow.
    var title = "You have selected " + numFeatures + " routes.";
    var content = "Please select the desired route from the list below.<br />";

    for (var i = 0; i < numFeatures; i++) {
        var graphic = featureSet[i];
        //content = content + "Route: " + graphic.attributes.routename + " (<a href='javascript:void(0)' onclick='showFeature(featureSet[" + i + "]);'>show</a>)<br/>";
        content = content + "Route: " + graphic.attributes.routename + "<br/>";
    }

    const popupRoutes = {
      "title": title,
      "content": content
    }

    fl.current.popupTemplate =  popupRoutes

  }

  /**
   * queryUsingSpatialFilter
   */
  const queryUsingSpatialFilter = (x, y) => {
    console.log("queryUsingSpatialFilter called...");

    jmv.view.whenLayerView(fl.current).then(function(layerView) {
      console.log("we now have a layerView...");

      let query = fl.current.createQuery();

      let fivePixels = (jmv.view.extent.width / jmv.view.width) * 5;

      let xmin = x - fivePixels
      let ymin = y - fivePixels
      let xmax = x + fivePixels
      let ymax = y + fivePixels
      let sr = jmv.view.spatialReference.wkid

      let extent = new Extent({xmin:xmin, ymin:ymin, xmax:xmax, ymax:ymax, spatialReference: sr})
        
      query.geometry = extent;
  
      query.distance = 1;
      query.units = "feet";
      query.spatialRelationship = "intersects";  // this is the default
      query.returnGeometry = true;

      query.outFields = [ "*" ];

      const pt = jmv.view.toScreen(x,y);

      fl.current.popupEnabled=true;

      fl.current.queryFeatures(query).then(function(results){
        // prints an array of all the features in the service to the console
        console.log(results.features);
        if (results.features.length === 1) {
          showFeature(results.features[0], pt);
        } else if (results.features.length !== 0) {
          showFeatureSet(results.features, pt);
        }
      });

    });

  }

  /**
   * addNetwork
   * @param jmv 
   */
    const addNetwork = () => {
      console.log("addNetwork called");

      fl.current = new FeatureLayer({url: props.config.networkurl});
      jmv.view.map.add(fl.current);
  
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

      addNetwork()

      let xmin = -8779565.491
      let ymin = 5308898.15
      let xmax = -8768418.742
      let ymax =  5315478.761
      let sr = 102100

      zoomToExtent(xmin, ymin, xmax, ymax, sr)

      initRequired.current = false;
    }

    console.log("props.state = " + props.state);

    if (props.state=='OPENED' && !onClickHandler.current) {
      if (jmv) {
        onClickHandler.current = jmv.view.on("click", evt => {

          console.log("evt.x= " + evt.x + ", evt.y= " + evt.y);
          console.log("evt.mapPoint.x= " + evt.mapPoint.x + ", evt.mapPoint.y= " + evt.mapPoint.y)

          const pt = jmv.view.toMap(evt.mapPoint.x,evt.mapPoint.y);

          queryUsingSpatialFilter(evt.mapPoint.x, evt.mapPoint.y)

        });
      }
    } else if (props.state=='CLOSED') {
      onClickHandler.current.remove();
      onClickHandler.current = null;
      fl.current.popupEnabled=false;
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
        <p>Click on a route to run a query</p>
      </div>

    </div>

}