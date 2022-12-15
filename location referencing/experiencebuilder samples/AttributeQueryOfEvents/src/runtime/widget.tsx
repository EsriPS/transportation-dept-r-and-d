import { React, AllWidgetProps } from 'jimu-core';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { IMConfig } from "../config";
import {loadArcGISJSAPIModules} from 'jimu-arcgis';
import { TextInput } from 'jimu-ui';
import { useState, useRef } from 'react';

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
   let apiLoaded = useRef(false);
   let GraphicsLayer = useRef(null);
   let Graphic = useRef(null);
   let Query = useRef(null);
   let Point = useRef(null);
   let FeatureLayer = useRef(null);
   let Extent = useRef(null);

  /**
   * state 
   */
  const [jmv, setjimuMapView] = useState(null);
  const [whereClause, setWhereClause] = useState("rid = '10042302' and meas between 3.0 and 4.0");
  const [results, setResults] = useState("");
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [event, setEvent] = useState(null);
  const [showResults, setShowResults] = useState(false)

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
      // justifyContent: "center",
      width: "100%",
      height: "100%",
      padding: "5px",
      margin: "0px",
      color: "#444",
      overflow: "hidden"
      // border: "1px solid #1890ff",
    },
    row: {
      display: 'flex',
      flexDirection: "row" as "row",
      flexWrap: "wrap" as "wrap",
      width: '100%'
    },
    column: {
      display: 'flex',
      flexDirection: "column" as "column",
      // flexBasis: '100%',
      flex: 2
    },
    column1: {
      display: 'flex',
      flexDirection: "column" as "column",
      flexBasis: '100%',
      flex: 1,
      padding: "5px",
      //backgroundColor:"#ff0000",
      border: "1px solid #0c0c0c18"
    },
    column2: {
      display: 'flex',
      flexDirection: "column" as "column",
      flexBasis: '100%',
      flex: 1,
      padding: "5px",
      //backgroundColor: "#90ee90",
      border: "1px solid #0c0c0c18"
    },
    column3: {
      display: 'flex',
      flexDirection: "column" as "column",
      flexBasis: '100%',
      flex: 1,
      padding: "5px",
      //backgroundColor: "#d5ee90",
      //border: "1px solid #0c0c0c18"
    },
    resultsDiv: {
      overflowY: 'auto',
      height: "150px"
    }
  }

/**
 * textInputChangeHandler
 * @param evt 
 */
  const textInputChangeHandler = (evt) => {
    console.log("textInputChangeHandler called...")
    // do-something...
  }

  /**
   * resetUI
   */
  const resetUI = () => {
    if (jmv) {
      jmv.view.graphics.removeAll()
      setResults("")
      setShowResults(false);
    }
  }

  /**
   * addEvent
   */
  const addEvent = (jmv) => {
    let featureLayer = new FeatureLayer.current(props.config.eventurl);
  
    setEvent(featureLayer)

    jmv.view.map.add(featureLayer);

    jmv.view.whenLayerView(featureLayer).then(function(layerView) {
      console.log("we now have a layerView...");
    });

  }

  /**
   * doQuery
   */
  const doQuery = () => {
    console.log("doQuery called...");

    setResults("")

    let query = event.createQuery();

    query.where = whereClause;
    query.returnGeometry = true;
    query.outFields = [ "*" ];
    query.outSpatialReference = jmv.view.spatialReference;

    event.queryFeatures(query).then(function(results){

      console.log(results.features);

      let numFeatures = results.features.length;

      let resultText = "You have selected " + numFeatures + " event" + (numFeatures==1?"":"s") + ".";

      if (numFeatures > 0) {
          resultText += '<br/><br/><table style="border:solid 1px #666666; border-collapse:collapse;" border="1" cellspacing="0" cellpadding="3">';
          resultText += '<tr><th>Event ID</th><th>Measure</th></tr>';
          for (var i = 0; i < numFeatures; i++) {
              var graphic = results.features[i];
              if (results.geometryType == "point") {
                drawPointSymbol(jmv, graphic.geometry)
              } else {
                drawLineSymbol(jmv, graphic.geometry)
              }
              let attrs = graphic.attributes;
              resultText += "<tr><td>" + attrs.eventid + "</td><td>" + attrs.meas + "</td></tr>";
          }
          resultText += "</table>";
          setResults(resultText)
          setShowResults(true)
        }

    });
  }

  /**
   * updateQueryClause
   */
  const updateQueryClause = (queryType) => {
    switch (queryType) {
      case 1:
        setWhereClause("eventid = 148160")
        resetUI()
        break;
      case 2:
        setWhereClause("rid in ('10042302', '10023602')")
        resetUI()
        break;
      case 3:
        setWhereClause("rid = '10042302' and meas < 3.5")
        resetUI()
        break;
      case 4:
        setWhereClause("rid = '10042302' and meas between 3.0 and 4.0")
        resetUI()
        break;
      default:
        break;
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
  const zoomToExtent = (jmv, xmin,ymin,xmax,ymax,sr) {
    let extent = new Extent.current(xmin, ymin, xmax, ymax, sr);
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
      color: [ 51,51, 204, 0.9 ],
      style: "solid",
    };

    const lineGraphic = new Graphic.current({
      geometry: geom,
      symbol: lineSymbol
    });

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
      color: [ 51,51, 204, 0.9 ],
      style: "diamond",
      size: "12px"
    };

    const pointGraphic = new Graphic.current({
      geometry: geom,
      symbol: pointSymbol
    });

    // Add the graphics to the view's graphics layer
    jmv.view.graphics.add(pointGraphic)
  }

  /**
   * getJSAPI
   */
  const getJSAPI = () => {
    console.log("getJSAPI called...");

    // lazy load required js api modules
    loadArcGISJSAPIModules([
        'esri/layers/GraphicsLayer',
        'esri/Graphic',
        'esri/rest/support/Query',
        'esri/geometry/Point',
        'esri/layers/FeatureLayer',
        'esri/geometry/Extent'
      ]).then(modules => {
          
        [GraphicsLayer.current, Graphic.current, Query.current, Point.current, FeatureLayer.current, Extent.current] = modules;

        apiLoaded.current = true;

      })

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

        addEvent(jmv)

        let xmin = -8234449
        let ymin = 4969729
        let xmax = -8216142
        let ymax =  4975931
        let sr = 102100

        zoomToExtent(jmv, xmin, ymin, xmax, ymax, sr)
        
        setQueryEnabled(true);

    }

  }

  if (!apiLoaded.current) getJSAPI();

  const createMarkup = () => {
    return {__html: results};
  }
  
  const QueryResults = () => {
    return <div dangerouslySetInnerHTML={createMarkup()} style={{ overflowY: "auto", height: "300px", width:'50%'}} />;
  }

    // if (props.state='CLOSED') {
    //  do-something...
    //}

    /**
     * the UI
     */
    let labelText = "Find events where: "
    let placeholderText = "My Placeholder"

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
          <div style={styles.column1}>
            <div >
              <label style={{fontSize:"1.5em", fontWeight: "bold"}}>Attribute query of events</label>
              <p>Find events where</p><TextInput className='runtime-title w-100' title={labelText}  placeholder={placeholderText} value={whereClause} onChange={(e) => { textInputChangeHandler(e); }} />
              <Button color="primary" style={styles.ButtonStyle} onClick={doQuery} disabled={!queryEnabled}>Query</Button>
            </div>
          </div>
          <div style={styles.column2}>
            <div>
              <label style={{fontSize:"1.5em", fontWeight: "bold"}}>Sample where clauses</label>
              <br/>
              <Button color="primary" style={styles.ButtonStyle} onClick={() => updateQueryClause(1)}>by event ID</Button>
              <Button color="primary" style={styles.ButtonStyle} onClick={() => updateQueryClause(2)}>by route</Button>
              <Button color="primary" style={styles.ButtonStyle} onClick={() => updateQueryClause(3)}>by route and measure</Button>
              <Button color="primary" style={styles.ButtonStyle} onClick={() => updateQueryClause(4)}>by route and measure range</Button>
            </div>
          </div>
        </div>
        <div  style={styles.row}>
          <div style={styles.column3}>
          { showResults ? <label style={{fontSize:"1.5em", fontWeight: "bold"}}>Query Results</label> : null }
            <div >
              <QueryResults/>
            </div>
          </div>
        </div>
      </div>

    </div>

  }