import { React, AllWidgetProps, FormattedMessage } from 'jimu-core';
//import defaultMessages from "./translations/default";
import { styled } from 'jimu-theme';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { useState } from 'react';
import { IMConfig } from "../config";
import {loadArcGISJSAPIModules} from 'jimu-arcgis';
import { TextInput, TextArea, WidgetPlaceholder } from 'jimu-ui';

const { useEffect, useRef } = React;

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
   let graphicsLayer = useRef(null);
   let apiLoaded = useRef(false);
   let GraphicsLayer = useRef(null);
   let Graphic = useRef(null);
   let Query = useRef(null);
   let Point = useRef(null);
   let FeatureLayer = useRef(null);
   let Extent = useRef(null);
   let esriCfg = useRef(null);

  /**
   * state
   */

  const [jmv, setjimuMapView] = useState(null);
  const [whereClause, setWhereClause] = useState("routename = 'IN278'");
  const [results, setResults] = useState("");
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [network, setNetwork] = useState(null);
  const [showResults, setShowResults] = useState(false);

  /**
   * styles
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
      // border: "1px solid #0c0c0c18"
    },
    resultsDiv: {
      overflowY: 'auto',
      height: "150px"
    }
  }
 
  const StyledButton = styled.button`
  color: white;
  background-color: blue;
  transition: 0.15s ease-in all;
  &:hover {
    background-color: darkblue;
  }
`;

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
    //if (graphicsLayer.current) graphicsLayer.current.removeAll()
    if (jmv) {
      jmv.view.graphics.removeAll()
      setResults("")
      setShowResults(false);
    }
  }

  /**
   * addNetwork
   */
  const addNetwork = (jmv) => {
    let featureLayer = new FeatureLayer.current(props.config.networkurl);
  
    setNetwork(featureLayer)

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

    //let featureLayer = new FeatureLayer.current(props.config.networkurl);

    //jmv.view.map.add(featureLayer);

      //jmv.view.whenLayerView(featureLayer).then(function(layerView) {
      //  console.log("we now have a layerView...");

        let query = network.createQuery();

        query.where = whereClause;
        query.returnGeometry = true;
        query.outFields = [ "*" ];
        query.outSpatialReference = jmv.view.spatialReference;

        network.queryFeatures(query).then(function(results){
          console.log(results.features);

          let numFeatures = results.features.length;

          let resultText = "You have selected " + numFeatures + " route" + (numFeatures==1?"":"s") + ".";

          resultText += '</br></br>';

          if (numFeatures > 0) {
              for (var i = 0; i < numFeatures; i++) {
                  let graphic = results.features[i];
                  drawLineSymbol(jmv, graphic.geometry)
                  resultText += graphic.attributes.routeid + ", ";
              }
              resultText = resultText.substring(0, resultText.length - 2);

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
        setWhereClause("routeid = '10020401'")
        resetUI()
        break;
      case 2:
        setWhereClause("routename = 'IN278'")
        resetUI()
        break;
      case 3:
        setWhereClause("routename like 'IN%'")
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
      type: "simple-line",  // autocasts
      color: [ 51,51, 204, 0.9 ],
      style: "solid",
    };

    const lineGraphic = new Graphic.current({
      geometry: geom,
      symbol: lineSymbol
    });

    jmv.view.graphics.add(lineGraphic)
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
        'esri/geometry/Extent',
        'esri/config'
      ]).then(modules => {
          
        [GraphicsLayer.current, Graphic.current, Query.current, Point.current, FeatureLayer.current, Extent.current, esriCfg.current] = modules;

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

          addNetwork(jmv)

          let xmin = -8259908
          let ymin = 4963428
          let xmax = -8186683
          let ymax =  4991232
          let sr = 102100

          zoomToExtent(jmv, xmin, ymin, xmax, ymax, sr)
          
          setQueryEnabled(true);
          
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

    if (!apiLoaded.current) getJSAPI();

    const createMarkup = () => {
    //function createMarkup() {
      return {__html: results};
    }
    
    const QueryResults = () => {
    //function QueryResults() {
      return <div dangerouslySetInnerHTML={createMarkup()} style={{ overflowY: "auto", height: "300px", width:'50%'}} />;
    }

    // if (props.state='CLOSED') {
    //  do-something...
    //}

    /**
     * the UI
     */

    let labelText = "Find Routes Where: "
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
                <label style={{fontSize:"1.5em", fontWeight: "bold"}}>Attribute query of routes</label>
                <p>Find Routes Where</p><TextInput className='runtime-title w-50' title={labelText}  placeholder={placeholderText} value={whereClause} onChange={(e) => { textInputChangeHandler(e); }} />
                <Button color="primary" style={styles.ButtonStyle} onClick={doQuery} disabled={!queryEnabled}>Query</Button>
              </div>
            </div>
            <div style={styles.column2}>
              <div>
                <label style={{fontSize:"1.5em", fontWeight: "bold"}}>Sample Queries</label>
                <br/>
                <Button color="primary" style={styles.ButtonStyle} onClick={() => updateQueryClause(1)}>by route ID</Button>
                <Button color="primary" style={styles.ButtonStyle} onClick={() => updateQueryClause(2)}>by route name</Button>
                <Button color="primary" style={styles.ButtonStyle} onClick={() => updateQueryClause(3)}>by route type</Button>
              </div>
            </div>
          </div>
          <div  style={styles.row}>
            <div style={styles.column3}>
              {showResults ? <label style={{fontSize:"1.5em", fontWeight: "bold"}}>Query Results</label> : null }  
              <div >
                <QueryResults/>
                {/* <div style={styles.resultsDiv}>
                  <TextArea
                    id={"ta"}
                    className='w-100'
                    style={{ height: 150 }}
                    value={results}
                    readOnly
                  />            
                </div> */}
              </div>
            </div>
          </div>
        </div>

    </div>

  }