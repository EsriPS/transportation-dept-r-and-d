import { React, AllWidgetProps, FormattedMessage } from 'jimu-core';
//import defaultMessages from "./translations/default";
//import { styled } from 'jimu-theme';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Spinner } from 'reactstrap';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
//import { useState } from 'react';
import { IMConfig } from "../config";
import {loadArcGISJSAPIModules} from 'jimu-arcgis';
import { TextInput, TextArea, WidgetPlaceholder } from 'jimu-ui';
//import { vmEvent } from 'esri/widgets/support/widget';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui'
//import { FontStyle } from 'jimu-ui/advanced/style-setting-components';
import { useState, useEffect, useRef } from "react";
//const { useEffect, useRef } = React;

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
   * The useRef Hook allows you to persist values between renders.
   * It can be used to store a mutable value that does not cause a re-render when updated.
   * 
   * https://www.w3schools.com/react/react_useref.asp
   */
   let apiLoaded = useRef(false);
   let Request = useRef(null);
   
  /**
   * state
   * 
   * The React useState Hook allows us to track state in a function component.
   * State generally refers to data or properties that need to be tracking in an application.
   * 
   * https://www.w3schools.com/react/react_usestate.asp
   */
  const [jmv, setjimuMapView] = useState(null);
  const [events, setEvents] = useState([]);
  const [versions, setVersions] = useState([]);
  const [eventName, setEventName] = useState("");
  const [outputFormat, setOutputformat] = useState("CSV");
  const [includeEventGeometries, setIncludeEventGeometries] = useState("No");
  const [lastInvokedTime, setLastInvokedTime] = useState(null);
  const [LRSTime, setLRSTime] = useState(null);
  const [lastLRSTime, setLastLRSTime] = useState(null);
  const [gdbVersion, setGDBVersion] = useState("Select");
  const [executeEnabled, setExecuteEnabled] = useState(false);
  const [processing, setProcessing] = useState(false)

  /**
   * useEffect allows you to perform side effects in your components.
   * 
   * useEffect accepts two arguments. The second argument is optional.
   * useEffect(<function>, <dependency>)
   * 
   * Runs on the first render and any time any dependency value changes
   * 
   */
  useEffect(() => {
    enableExecute()}, 
    [eventName, lastInvokedTime, LRSTime, lastLRSTime, outputFormat, gdbVersion, includeEventGeometries, gdbVersion]
  )

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
   * enableExecute
   */
  const enableExecute = () => {
    console.log("enableExecute called")
    const tmp_lastInvokedTime = Date.parse(lastInvokedTime)
    const tmp_LRSTime = Date.parse(LRSTime)
    const tmp_lastLRSTime = Date.parse(lastLRSTime)
    if (eventName.length > 0) {
      setExecuteEnabled(true)
    } else {
      setExecuteEnabled(false)
    }
  }

  /**
   * execute
   */
  const execute = () => {
    console.log("execute called");

    setProcessing(true);

    const options = {
      query: {
        eventName: eventName,
        outputFormat: outputFormat,
        lrsTime: LRSTime,
        lastLrsTime: lastLRSTime,
        lastInvokedTime: lastInvokedTime,
        f: "json"
      },
      responseType: "json"
    };

    //const the_url= "https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/RelocateEvents/MapServer/exts/LRServer/networkLayers/1/relocateEvent"
    const the_url = props.config.relocateEventUrl

    Request.current(the_url, options)
    .then((response) => {
      const responseJSON = JSON.stringify(response, null, 2);
      console.log("responseJSON", responseJSON);
      relocateEventResponse(response)
      console.log("response", response);
    }).catch((error) => {
      setProcessing(false);
      console.error(error);
    });

  }

  /**
   * relocateEventResponse
   * @param response 
   */
  const relocateEventResponse = (response) => {
    console.log("relocateEventResponse called")
    const statusURL = response.data.statusURL;

    var options = {
      query: {
        f: "json"
      },
      responseType: "json"
    };

    Request.current(statusURL, options)
    .then((statusResponse) => {
      console.log("statusResponse", statusResponse);
      var statusResponseJSON = JSON.stringify(statusResponse, null, 2);
      gpJobStatus(statusResponse);
      if (statusResponse.data.status == "esriJobSubmitted" || statusResponse.data.status == "esriJobExecuting") {
        setTimeout(
          function() {
            relocateEventResponse(response);
          }, 3000)
      } else {
        gpJobStatus(statusResponse);
        if (statusResponse.status == "esriJobFailed") {
          gpJobFailed(statusResponse);
        } else {
          gpJobComplete(statusResponse);
        }        
      };
    }).catch((error) => {
      setProcessing(false);
      console.error(error);
    });

  }

  /**
   * gpJobStatus
   * @param response 
   */
  const gpJobStatus = (response) => {
    console.log("gpJobStatus response: " + response.data.status);
  }

  /**
   * gpJobFailed
   * @param error 
   */
  const gpJobFailed = (error) => {
    console.log("gpJobFailed called: " + error)
    setProcessing(false);
    alert("Error running relocate events geoprocessing service (see console).");
  }

  /**
   * gpJobComplete
   * @param response 
   */
  const gpJobComplete = (response) => {

    const resultsUrl = response.data.relocateEventJobResult.url;

    const options = {
      query: {
        f: "text"
      },
      responseType: "text"
    };

    Request.current(resultsUrl, options)
    .then((response) => {
      console.log("response", response);
      const responseJSON = JSON.stringify(response, null, 2);
      downloadFile(response.data);
      setProcessing(false);
    }).catch((error) => {
      setProcessing(false);
      console.error(error);
    });

  }

  /**
   * downloadFile
   * @param data 
   * @param name 
   */
  const downloadFile = (data, name="results.csv") => {

    // specify type that browser must download
    const blob = new Blob([data], {type: "octet-stream"});

    // creates a string containing a URL representing the object given in the parameter
    // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
    const href = URL.createObjectURL(blob);

    // copies all enumerable own properties from one or more source objects to a target object. It returns the modified target object.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
    const a = Object.assign(document.createElement("a"), {
      href,
      style: "display:none",
      download: name,
    });

    document.body.appendChild(a);

    a.click()

    URL.revokeObjectURL(href);

    a.remove();
  }

  /**
   * getJSAPI
   * 
   */
  const getJSAPI = () => {
    console.log("getJSAPI called...");

    // lazy load required js api modules
    // By default, Experience Builder does not load the ArcGIS API for JavaScript (JSAPI) when the app loads.
    // https://developers.arcgis.com/experience-builder/guide/extend-base-widget/?adumkts=product&aduc=social&adum=external&aduSF=twitter&aduca=mi_arcgis_experience_bundle&adulb=multiple&adusn=multiple&aduat=arcgis_online_portal&adupt=awareness&sf_id=701f2000000iIgWAAU
    loadArcGISJSAPIModules([
        'esri/request'
      ]).then(modules => {
          
        [Request.current] = modules;

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

          //jmv.view.popup.visible= true

          setjimuMapView(jmv)

          // addEvent(jmv)

          // let xmin = -8250602.81762082
          // let ymin = 4967129.538129259
          // let xmax = -8213989.48107227
          // let ymax =  4979531.445968512

          // let sr = 102100

          // zoomToExtent(jmv, xmin, ymin, xmax, ymax, sr)
          
          //setApplyEditsEnabled(true);
          
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

  // only need to get once
  if (!apiLoaded.current) getJSAPI();

  /**
   * eventNameChangeHandler
   * @param item 
   */
  const eventNameChangeHandler = (evt) => {
    console.log("eventNameChangeHandler called: " + evt)
    setEventName(evt)
  }

  /**
   * lastInvokedTimeChangeHandler
   * @param evt 
   */
  const lastInvokedTimeChangeHandler = (evt) => {
    console.log("lastInvokedTimeChangeHandler called...")
    setLastInvokedTime(evt)
  }

  /**
   * includeEventGeometriesChangeHandler
   * @param item 
   */
  const includeEventGeometriesChangeHandler = (item) => {
    console.log("includeEventGeometriesChangeHandler called: " + item.target.innerText)
    setIncludeEventGeometries(item.target.innerText)
  }

  /**
   * lrsTimeChangeHandler
   * @param evt 
   */
  const lrsTimeChangeHandler = (evt) => {
    console.log("lrsTimeChangeHandler called...")
    setLRSTime(evt)
  }

  /**
   * lastLRSTimeChangeHandler
   * @param evt 
   */
  const lastLRSTimeChangeHandler = (evt) => {
    console.log("lastLRSTimeChangeHandler called...")
    setLastLRSTime(evt)
  }

  /**
   * outputFormatChangeHandler
   * @param item 
   */
  const outputFormatChangeHandler = (item) => {
    console.log("outputFormatChangeHandler called: " + item.target.innerText)
    setOutputformat(item.target.innerText)
    //enableExecute();
  }

  /**
   * gdbVersionChangeHandler
   * @param item 
   */
  const gdbVersionChangeHandler = (item) => {
    console.log("gdbVersionChangeHandler called: " + item.target.innerText)
    setGDBVersion(item.target.innerText)
  }

  // if (props.state='CLOSED') {
  //  do-something...
  //}

  /**
   * the UI
   */
  return <div className="widget-starter jimu-widget" style={{ overflow: "auto" ,padding: "5px"}}>
      
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

        <div style={{ overflow: "auto" ,margin: "5px"}}>

          <p style={styles.p}>Event name:</p>
          <div>
            <TextInput className='runtime-title w-50' title={"External Event"} onAcceptValue={(e) => { eventNameChangeHandler(e); }} />
          </div>
          <p style={styles.p}>Last Invoked Time (optional):</p>
          <TextInput  type='datetime-local' className='runtime-title' title={"Last Invoked Time"}   onAcceptValue={(e) => {lastInvokedTimeChangeHandler(e); }} />
          <p style={styles.p}>LRS Time (optional):</p>
          <TextInput type='datetime-local' className='runtime-title' title={"LRS Time"}   onAcceptValue={(e) => {lrsTimeChangeHandler(e); }} />
          <p style={styles.p}>Last LRS Time (optional):</p>
          <TextInput type='datetime-local' className='runtime-title' title={"Last LRS Time"}   onAcceptValue={(e) => {lastLRSTimeChangeHandler(e); }} />
          <p style={styles.p}>Output Format:</p>
          <div>
            <Dropdown style={{width:"200px", border: "1px lightgray solid"}}>
              <DropdownButton>
                {outputFormat}
              </DropdownButton>
              <DropdownMenu>
                  <DropdownItem onClick={outputFormatChangeHandler} dropDownValue="CSV"><i className="fa fa-envelope fa-fw"></i>CSV</DropdownItem>
                  <DropdownItem onClick={outputFormatChangeHandler} dropDownValue="FGDB"><i className="fa fa-money fa-fw"></i>FGDB</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>   
          <p style={styles.p}>Include Event Geometries (optional):</p> 
          <div>
            <Dropdown style={{width:"200px", border: "1px lightgray solid"}}>
              <DropdownButton>
                {includeEventGeometries}
              </DropdownButton>
              <DropdownMenu>
                  <DropdownItem onClick={includeEventGeometriesChangeHandler} dropDownValue="true"><i className="fa fa-plane fa-fw"></i>Yes</DropdownItem>
                  <DropdownItem onClick={includeEventGeometriesChangeHandler} dropDownValue="false"><i className="fa fa-envelope fa-fw"></i>No</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>                          
        </div>
        <p style={{margin: "10px 0px 0px 5px", fontWeight: "bold"}}>GDB Version (optional):</p> 
        <div>
            <TextInput className='runtime-title w-50' title={"Route ID:"}  onChange={(e) => {gdbVersionChangeHandler(e); }} />
        </div>  

        <div style={styles.row}>
          <Button color="primary" style={{margin: "10px 0px 0px 5px!important"}} onClick={execute} disabled={!executeEnabled}>
            {!processing ? "Execute" : "Executing "} 
            {processing ? (
              <Spinner
                style={{ width: ".9rem", height: ".9rem" }}
                type="border"
                color="Yellow"
              />
            ) : null }
          </Button>
        </div>


      </div>
    </div>
  }