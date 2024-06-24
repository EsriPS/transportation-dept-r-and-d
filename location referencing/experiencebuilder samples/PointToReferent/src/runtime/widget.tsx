import { React, AllWidgetProps } from 'jimu-core';
import { TextInput, Tooltip } from "jimu-ui";
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { useState, useRef, useEffect } from 'react';
import { IMConfig } from "../config";
import FeatureLayer from 'esri/layers/FeatureLayer'
import request from 'esri/request'
import ReferentResults from "../components/ReferentResults";
import SelectionType from '../components/SelectionType';
import RouteLinks from '../components/RouteLinks';
import "../css/widget.css";
import { toInteger, toLower } from 'lodash-es';

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
   * refs (stores mutable values that do not trigger a re-render)
   */
  let fl = useRef(null);
  let g2mResults = useRef([]);
  let g2rResults = useRef([]);
  let supportsLines = useRef(false);
  let lineNameFieldName = useRef(null);
  let g2mResultsDisabled = useRef(true);
  let g2mRouteList = useRef([]);
  let jmv = useRef(null);   
  let selectionType = useRef('nearestUpstream');
  let selectionTolerance = useRef(20);
  let lastSelectedOutOffsetUnit = useRef(''); 

  /**
   * state (triggers a re-render when it changes)
   */

  const [mapUnitsOfMeasure, setmapUnitsOfMeasure] = useState('');
  const [selectedOutOffsetUnit, setSelectedOutOffsetUnit] = useState(lastSelectedOutOffsetUnit.current);
  const [g2rData, setg2rData] = useState([]);
  const [statusMessage, setStatusMessage] = useState(props.config.userGuidance)
  const [selectedChoice, setSelectedChoice] = useState('');

  /**
   * constants
   */

  const selectionTypes = ['nearestUpstream', 'closest'];
  // const units = ['esriInches' , 'esriFeet' , 'esriYards' , 'esriMiles' , 'esriNauticalMiles' , 'esriMillimeters' , 
  //   'esriCentimeters' , 'esriMeters' , 'esriKilometers' , 'esriDecimalDegrees' , 'esriDecimeters' , 
  //   'esriIntInches' , 'esriIntFeet' , 'esriIntYards' , 'esriIntMiles' , 'esriIntNauticalMiles'];

  const units = ['Inches' , 'Feet' , 'Yards' , 'Miles' , 'Nautical Miles' , 'Millimeters' , 
  'Centimeters' , 'Meters' , 'Kilometers' , 'Decimal Degrees' , 'Decimeters' , 
  'Int Inches' , 'Int Feet' , 'Int Yards' , 'Int Miles' , 'Int Nautical Miles'];

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
      overflow: "auto"
    },
    label : {
      marginLeft: "2rem"
    },
    row: {
      display: 'flex',
      flexDirection: "row" as "row",
      flexWrap: "wrap" as "wrap",
      width: '100%',
      padding: '20px'
    }
  }
  
  /**
   * useEffects
   */
  useEffect(() => {
    getNetworkMetaData()
    selectionTolerance.current = props.config.tolerance;
    setSelectedOutOffsetUnit(formatAsEsri(props.config.outOffsetUnit));
    lastSelectedOutOffsetUnit.current = extractUnit(props.config.outOffsetUnit)
  }, []);

  useEffect(() => {
    console.log("status message useEffect called")
  }, [statusMessage]);

  /**
   * extractUnit
   * @param sarg 
   * @returns 
   */
  const extractUnit = (sarg) => {
    // Remove the 'esri' prefix and split the string into words
    let words = sarg.replace('esri', '').match(/[A-Z][a-z]+/g);

    // Join the words with spaces to form the final string
    return words.join(' ');
  }

  /**
   * formatAsEsri
   * @param sarg 
   * @returns 
   */
  const formatAsEsri = (sarg) => {
    // Remove the 'esri' prefix and split the string into words
    let words = sarg.replace('esri', '').match(/[A-Z][a-z]+/g);
  
    // Join the words with spaces to form the final string
    let formattedString = words.join(' ');
  
    // Add the 'esri' prefix back to the formatted string
    formattedString = 'esri' + formattedString.replace(/\s/g, '');
  
    return formattedString;
  };

  /**
   * handleChoiceSelect
   * @param choice 
   */
  const handleChoiceSelect = (choice) => {
    setSelectedChoice(choice);
    console.log(`ParentComponent->handleChoiceSelect called: choice = ${choice}`);
  };

  /**
   * handleRouteClick
   * @param selectedItem 
   */
  const handleRouteClick = (selectedItem) => {
    console.log(`handleRouteClick called: Route clicked: ${selectedItem.RouteName}, ${selectedItem.RouteID}`)

    g2mResultsDisabled.current = false;

    let selectedg2mRow = g2mResults.current.find((row) => row.RouteName === selectedItem.RouteName);

    console.log('selectedg2mRow:', selectedg2mRow);

    handleChoiceSelect(selectedg2mRow);

    process_g2r_Request(selectedg2mRow)

  };

  /**
   * handleSelectionTypeSelect
   * @param choice 
   */
  const handleSelectionTypeSelect = (choice) => {
    console.log(`handleSelectionTypeSelect called: choice: ${choice}`)
    selectionType.current = choice
  };

  /**
   * handleOutOffsetUnitSelect
   * @param choice 
   */
  const handleOutOffsetUnitSelect = (choice) => {
    console.log(`handleOutOffsetUnitSelect called: choice: ${choice}`)
    if (choice !== '') {
      const formattedChoice = formatAsEsri(choice)
      console.log(`handleOutOffsetUnitSelect formattedChoice: ${formattedChoice}`)
      setSelectedOutOffsetUnit(formattedChoice)
      lastSelectedOutOffsetUnit.current = formattedChoice
    }
  };

  /**
   * handleToleranceSelect
   * @param tolerance 
   */
  const handleToleranceSelect = (tolerance) => {
    console.log(`handleToleranceSelect called`)
    selectionTolerance.current = tolerance
    console.log(`...tolerance is now: ${tolerance}`)
  };

  // const getFeatureLayerByTitle = (map, layerTitle) => {
  //   const layers = map.layers;
  
  //   for (const layer of layers) {
  //     if (layer.title === layerTitle && layer.type === "feature") {
  //       return layer;
  //     }
  //   }
  
  //   return null;
  // };

  let mpColumns = React.useMemo(
    () => [
      {
        Header: 'Line Name',
        accessor: 'LineName',
      },
      {
        Header: 'MP',
        accessor: 'MP',
      },
      {
        Header: 'LRS RouteID',
        accessor: 'LRSRouteID',
      },
      {
        Header: 'LRS Route Name',
        accessor: 'LRSRouteName',
      },
      {
        Header: 'LRS Measure',
        accessor: 'LRSMeasure',
      },
      {
        Header: 'X',
        accessor: 'X',
      },
      {
        Header: 'Y',
        accessor: 'Y',
      },
    ],
    []
  );

  /**
   * removeLineNameColumn
   * @param columns : ;
   * @returns 
   */
  const removeLineNameColumn = (columns) => {
    return columns.filter(column => column.Header !== 'Line Name');
  }

  /**
   * getNetworkMetaData
   */
  const getNetworkMetaData = () => {
    console.log("getNetworkMetaData called")

    let content = {
      'f': "json"
    };

    let url = props.config.g2murl;
    let lastIndex = url.lastIndexOf('/');
    let soeURL = url.substring(0, lastIndex);

    // https://esri-rhpro-lrs.esri.com/server/rest/services/TDOT/Edit_LRS_Network/MapServer
    // units

    console.log("getNetworkMetaData->soeURL= " + soeURL)

    request(soeURL, {
      responseType: "json",
      query: content,
    }).then((response) => {
        supportsLines.current = response.data.supportsLines
        console.log("getNetworkMetaData->supportsLines= " + response.data.supportsLines)
        lineNameFieldName.current = response.data.lineNameFieldName
        if (!supportsLines.current) {
          mpColumns = removeLineNameColumn(mpColumns);
        }
    }, (error) => {
      console.log("getNetworkMetaData->error: " + error)
    });

    soeURL = "https://esri-rhpro-lrs.esri.com/server/rest/services/TDOT/Edit_LRS_Network/MapServer"

    request(soeURL, {
      responseType: "json",
      query: content,
    }).then((response) => {
        setmapUnitsOfMeasure(response.data.units)
        console.log("getNetworkMetaData->units= " + response.data.units)
        if (!supportsLines.current) {
          mpColumns = removeLineNameColumn(mpColumns);
        }
    }, (error) => {
      console.log("getNetworkMetaData->error: " + error)
    });

  }

  /**
   * process_g2m_Request
   * 
   * @param jmv 
   * @param x 
   * @param y 
   */
  const process_g2m_Request = (x, y) => {
    console.log("process_g2m_Request called")

    let locations = [
      {
        'geometry': {
            'x': x,
            'y': y
        }
      }
    ];

    // notes: For example, if the map is using a spatial reference system with meters as the unit of measurement, then the map units would be meters. 
    // Similarly, if the map is using a spatial reference system with feet as the unit of measurement, then the map units would be feet
    // const toleranceInMapUnits = props.config.tolerance * jmv.current.view.resolution
    const toleranceInMapUnits = selectionTolerance.current //props.config.tolerance 
    console.log("toleranceInMapUnits= " + toleranceInMapUnits)

    let content = {
        'locations': JSON.stringify(locations),
        'tolerance': toleranceInMapUnits,
        'inSR': jmv.current.view.spatialReference.wkid,
        'f': "json"
    };

    console.log("jmv.current.view.spatialReference.wkid= " + jmv.current.view.spatialReference.wkid)

    let soeURL = props.config.g2murl

    console.log("soeURL= " + soeURL)

    request(soeURL, {
      responseType: "json",
      query: content,
    }).then((response) => {
        
        console.log("process_g2m_Request (response.data)->" + JSON.stringify(response.data))
        console.log("process_g2m_Request (response.data.locations)->" + JSON.stringify(response.data.locations))

        if (response.data.locations[0].status == "esriLocatingCannotFindLocation") {

          setStatusMessage("Route location not found. Please retry")

        } else if (response.data.locations[0].status == "esriLocatingOK" || response.data.locations[0].status == "esriLocatingMultipleLocation") {

          jmv.current.view.graphics.removeAll()

              g2mResults.current = []
              let routeId = ''
              let measure = 0.0
              let distance = 0.0    
              let tmp = []

              response.data.locations[0].results.forEach(async function(result, index) {

                routeId = result.routeId
                measure = result.measure.toFixed(6)
                distance = result.distance.toFixed(6)             
  
                tmp.push({routeId: routeId, measure: measure, distance: distance})

                console.log("process_g2m_Request->1-routeId= " + routeId + ", measure= " + measure + ", distance= " + distance);

                if (!fl.current){
                  const flUrl = props.config.g2murl.replace(/MapServer\/.*/, "MapServer/111");
 
                  fl.current = new FeatureLayer({url:flUrl});
                }

                let query = fl.current.createQuery();
  
                query.where = "RouteId = '" + routeId + "'";
                query.returnGeometry = false;

                if (supportsLines.current) {
                  query.outFields = [ "RouteName", lineNameFieldName.current ];
                } else {
                  query.outFields = [ "RouteName" ];
                }
  
                await fl.current.queryFeatures(query).then(function(result){
  
                  console.log("process_g2m_Request->2-routeId= " + routeId + ", measure= " + measure + ", distance= " + distance);
  
                  if (supportsLines.current) {
                    g2mResults.current.push({RouteName: result.features[0].attributes.RouteName, RouteID: tmp[index].routeId, Measure: tmp[index].measure, Distance: tmp[index].distance, LineName:result.features[0].attributes[lineNameFieldName.current]})
                  } else {
                    g2mResults.current.push({RouteName: result.features[0].attributes.RouteName, RouteID: tmp[index].routeId, Measure: tmp[index].measure, Distance: tmp[index].distance, test:'test'})
                  }

                  if (index == response.data.locations[0].results.length - 1) {
                    console.log("process_g2m_Request->results= " + JSON.stringify(g2mResults.current))

                    g2mRouteList.current = g2mResults.current.map(result => ({
                      RouteName: result.RouteName,
                      RouteID: result.RouteID
                    }));
                    
                    console.log("g2mRouteList.current: " + g2mRouteList.current);

                    handleRouteClick(g2mResults.current[0])

                  }

                });

                console.log("process_g2m_Request->index= " + index)
              });

        } else if (response.data.locations[0].status == "esriLocatingError") {

          setStatusMessage("Route locating error. Please retry")

        }

      }, (error) => {
        console.log("process_g2m_Request->error: " + error)
      });
  }

  /**
   * process_g2r_Request
   * 
   * @param jmv 
   * @param x 
   * @param y 
   */
  const process_g2r_Request = (selectedG2MRow) => {
    console.log("process_g2r_Request called")

    let locations = []

    locations.push({layerId: props.config.g2rLayerId, routeId: selectedG2MRow.RouteID, measure: selectedG2MRow.Measure})

    // notes: For example, if the map is using a spatial reference system with meters as the unit of measurement, then the map units would be meters. 
    // Similarly, if the map is using a spatial reference system with feet as the unit of measurement, then the map units would be feet
    const toleranceInMapUnits = selectionTolerance.current
    console.log("process_g2r_Request->toleranceInMapUnits= " + toleranceInMapUnits)

    let content = {
        'locations': JSON.stringify(locations),
        'tolerance': toleranceInMapUnits,
        'referentSelectionType': selectionType.current,
        'featureIdFieldName': props.config.featureIdFieldName, 
        'inSR': jmv.current.view.spatialReference.wkid,
        'outSR': props.config.outSR,
        'outOffsetUnit': lastSelectedOutOffsetUnit.current,
        'f': "json"
    };

    console.log("process_g2r_Request->jmv.current.view.spatialReference.wkid= " + jmv.current.view.spatialReference.wkid)

    let soeURL = props.config.g2rurl

    console.log("process_g2r_Request->soeURL= " + soeURL)

    request(soeURL, {
      responseType: "json",
      query: content,
    }).then((response) => {
        
        console.log("process_g2r_Request (response.data)->" + JSON.stringify(response.data))
        console.log("process_g2r_Request (response.data.locations)->" + JSON.stringify(response.data.locations))

        if (response.data.locations[0].status == "esriLocatingCannotFindLocation") {

          setStatusMessage("Route location not found. Please retry")

        } else if (response.data.locations[0].status == "esriLocatingCannotFindRoute") {

          setStatusMessage("The route does not exist. Please retry")

        } else if (response.data.locations[0].status == "esriLocatingRouteShapeEmpty") {

          setStatusMessage("The route does not have a shape or the shape is empty. Please retry")

        } else if (response.data.locations[0].status == "esriLocatingRouteMeasuresNull") {

          setStatusMessage("The route does not have measures or the measures are null")

        } else if (response.data.locations[0].status == "esriLocatingRouteNotMAware") {

          setStatusMessage("The route is not an m-aware polyline. Please retry")

        } else if (response.data.locations[0].status == "esriLocatingCannotFindLocation") {

          setStatusMessage("The route location's shape cannot be found because the route has no measures or the route location's measures do not exist on the route. Please retry")

        } else if (response.data.locations[0].status == "esriLocatingReferentOffsetSpansGap") {

          setStatusMessage("The offset value found spans across a gap. Please retry")
          
        } else if (response.data.locations[0].status == "esriLocatingOK" || response.data.locations[0].status == "esriLocatingMultipleLocation") {

          jmv.current.view.graphics.removeAll()

          g2rResults.current = []

          let mp = ''
          let LRSRouteID = ''
          let LRSRouteName = ''
          let LRSMeasure = ''
          let x = 0.0
          let y = 0.0

          response.data.locations[0].results.forEach(function(result) {
            
            // note: 26 vs 026, and positive vs negative offset seperator
            console.log("process_g2r_Request->result.offset= " + Math.abs(result.offset).toFixed(toInteger(props.config.offsetUnitRounding)))

            if (props.config.padFeatureId) {
              if (result.offset < 0) {
                mp = '0' + result.featureId.toString() + 
                  props.config.negReferentSeperator + 
                  Math.abs(result.offset).toFixed(toInteger(props.config.offsetUnitRounding)) +
                  ' (' + extractUnit(lastSelectedOutOffsetUnit.current) + ')'
              } else {
                mp = '0' + result.featureId.toString() + 
                  props.config.posReferentSeperator + 
                  Math.abs(result.offset).toFixed(toInteger(props.config.offsetUnitRounding)) +
                  ' (' + extractUnit(lastSelectedOutOffsetUnit.current) + ')'
              }
            } else {
              if (result.offset < 0) {
                mp = result.featureId.toString() + 
                  props.config.negReferentSeperator + 
                  Math.abs(result.offset).toFixed(toInteger(props.config.offsetUnitRounding)) +
                  ' (' + extractUnit(lastSelectedOutOffsetUnit.current) + ')'
              } else {
                mp = result.featureId.toString() + 
                  props.config.posReferentSeperator + 
                  Math.abs(result.offset).toFixed(toInteger(props.config.offsetUnitRounding)) +
                  ' (' + extractUnit(lastSelectedOutOffsetUnit.current) + ')'
              }
            }

            const routeInfo = getLRSinfoForRouteId(result.routeId);
            console.log("process_g2r_Request->" + JSON.stringify(routeInfo)); // Output: { routeName: 'Route B', routeMeasure: 15 }

            LRSRouteID = result.routeId
            LRSRouteName = routeInfo.routeName
            LRSMeasure = routeInfo.routeMeasure

            x = result.geometry.x.toFixed(3)
            y = result.geometry.y.toFixed(3)

            if (supportsLines.current) {
              g2rResults.current.push({LineName: routeInfo.lineName, MP: mp, LRSRouteName: LRSRouteName, LRSMeasure: LRSMeasure, X: x, Y: y})
            } else {
              g2rResults.current.push({MP: mp, LRSRouteName: LRSRouteName, LRSMeasure: LRSMeasure, X: x, Y: y})
            }
            
            console.log("process_g2r_Request->results= " + JSON.stringify(g2rResults.current))

            setStatusMessage(props.config.userGuidance)

          });

          if (response.data.locations[0].results.length === 0) {
            setStatusMessage("No results returned. Please select another location or route")
          }

          setg2rData(g2rResults.current)

        } else if (response.data.locations[0].status == "esriLocatingError") {

          setStatusMessage("Route locating error. Please retry")

        }

      }, (error) => {
        console.log("process_g2r_Request->error: " + error)
      });
  }

  /**
   * getLRSinfoForRouteId
   * @param routeId 
   * @returns 
   */
  const getLRSinfoForRouteId = (routeId) => {
    console.log("getLRSinfoForRouteId called")

    const route =  g2mResults.current.find((route) => route.RouteID === routeId);

    // If a matching route is found, return its name and measure
    if (route) {
      if (supportsLines.current) {
        return { routeName: route.RouteName, routeMeasure: route.Measure, lineName: route.LineName};
      } else {
        return { routeName: route.RouteName, routeMeasure: route.Measure };
      }
    }
  
    // If no matching route is found, return an error message or handle it as needed
    return { routeName: "unknown", routeMeasure: "unknown" };
    
  }

  /**
   * activeViewChangeHandler
   * @param jmv 
   */
  const activeViewChangeHandler = (j: JimuMapView) => {
    console.log("activeViewChangeHandler called");
      
    // note: jmv.view is a arcgis javascript 4.x mapview instance
    if (j) {

      console.log("activeViewChangeHandler called, JMV: ", jmv);

      j.view.popup.visible= false

      jmv.current = j
  
      jmv.current.view.on("immediate-click", evt => {

          console.log("activeViewChangeHandler->evt.x= " + evt.x + ", evt.y= " + evt.y);
          console.log("activeViewChangeHandler->evt.mapPoint.x= " + evt.mapPoint.x + ", evt.mapPoint.y= " + evt.mapPoint.y)

          g2mRouteList.current = []
          setg2rData([])

          // only process if the widget is open
          if (props.state !== 'CLOSED') {
            process_g2m_Request(evt.mapPoint.x, evt.mapPoint.y)
          }

      });

    }

  }

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
          <div style={{ width: '100%' }}>
            <div >

              <div className="status">
                {statusMessage}
              </div>

              <div className="dropdown">
                <div className="labelContainer">
                  <p style={{ width: '6.5rem' }}>Selection Type:</p>
                </div>
                <div className="componentContainer">
                  <SelectionType choices={selectionTypes} 
                    defaultChoice={props.config.defaultOffset} 
                    onSelect={handleSelectionTypeSelect} 
                    tooltipTitle={'Specifies how the referent will be selected along a route.'}/>
                </div>
              </div>

              <div className="dropdown">
                <div className="labelContainer">
                  <p style={{ width: '6.5rem' }}>Out Offset Units:</p>
                </div>
                <div className="componentContainer">
                  <SelectionType choices={units}
                  defaultChoice={selectedOutOffsetUnit !== '' ? extractUnit(selectedOutOffsetUnit): ''} 
                  onSelect={handleOutOffsetUnitSelect}  
                  tooltipTitle={'Specifies the unit used for output offset values.'} />
                </div>
              </div>

              <div className="dropdown">
                <div className="labelContainer">
                  <p style={{ width: '6.5rem' }}>Tolerance:</p>
                </div>
                <Tooltip title="The maximum distance in map units (see unitsOfMeasure in the metadata) to snap a point to the closest location on a nearby route.">
                  <TextInput
                    // className="componentContainer"
                    allowClear
                    style={{ 
                      whiteSpace: "nowrap", 
                      marginLeft: "10px", 
                      marginBottom: "20px", 
                      width: "5rem"
                    }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={props.config.tolerance}
                    onAcceptValue={handleToleranceSelect}>
                  </TextInput>
                </Tooltip>
                  <div className="labelContainer">
                  <p style={{ marginLeft: ".25rem", width: '6rem' }}>{mapUnitsOfMeasure === '' ? '': extractUnit(mapUnitsOfMeasure)}</p>
                </div>
              </div>

              <div className="dropdown">
                <div className="labelContainer">
                  <p style={{ width: '6.5rem' }}>Select Route:</p>
                </div>
                <div className="componentContainer">
                  <RouteLinks 
                    routes={g2mRouteList.current} 
                    onRouteClick={handleRouteClick} 
                    disabled={g2mResultsDisabled.current} 
                    selectedChoice={selectedChoice}
                    handleChoiceSelect={handleChoiceSelect}/>
                </div>
              </div>

              <p>Referent details:</p>

              <div>
               <ReferentResults results={g2rData} />
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>

  }