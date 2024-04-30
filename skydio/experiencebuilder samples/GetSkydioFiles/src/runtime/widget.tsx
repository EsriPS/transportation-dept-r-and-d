import { React, AllWidgetProps } from 'jimu-core';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { useState, useRef, useEffect } from 'react';
import { IMConfig } from "../config";
import esriRequest from "esri/request";
import { TextInput } from 'jimu-ui'
import { Button } from 'jimu-ui'
import { TextArea } from 'jimu-ui'
import { FolderOutlined } from 'jimu-icons/outlined/application/folder'
import "../css/widget.css";
import {RotatingLines} from 'react-loader-spinner';

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
   * 
   * skydioapi: https://apidocs.skydio.com/reference/introduction
   */

  /**
   * refs (note: changing the value of a ref does not cause a re-render)
   */
  let vehicleID = useRef(null);
  let capturedAfter = useRef(null);
  let capturedBefore = useRef(null);
  let folderHandle = useRef(null);
  let jmv = useRef(null);

  /**
   * state 
   */

  const [isGoDisabled, setIsGoDisabled] = useState(true);
  const [statusMessage, setStatusMessage] = useState(props.config.userGuidance)
  const [projectFolder, setProjectFolder] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  let folderIcon = <FolderOutlined />

  /**
   * enableGo
   */
  const enableGo = () => {
    console.log('enableGo called')
    if (vehicleID.current && capturedAfter.current && capturedBefore.current && folderHandle.current) {
      setIsGoDisabled(false);
      console.log('...enabling Go button')
    } else {
      setIsGoDisabled(true);
      console.log('...disabling Go button')
    }
  }

  /**
   * handleVehicleID
   * @param value 
   */
  const handleVehicleID = (value) => {
    console.log('handleVehicleID called, Vehicle ID:', value)
    vehicleID.current = value;
    enableGo();
  }

  /**
   * handleCapturedAfter
   * @param value 
   */
  const handleCapturedAfter = (value) => {
    console.log('handleCapturedAfter called, Captured After:', value)
    capturedAfter.current = value;
    enableGo();
  }

  /**
   * handleCapturedBefore
   * @param value 
   */
  const handleCapturedBefore = (value) => {
    console.log('handleCapturedBefore called, Captured Before:', value)
    capturedBefore.current = value;
    enableGo();
  }

  /**
   * handleChooseFolder
   */
  const handleChooseFolder = async () => {
    try {
      folderHandle.current = await (window as any).showDirectoryPicker();
      console.log('folderHandle.name:', folderHandle.current.name);
      setProjectFolder(folderHandle.current.name);
      enableGo();
    } catch (error) {
      console.error('Error choosing folder:', error);
    }
  };
  
  /**
   * go
   */
  const go = async () => {
    try {
      console.log("go called");
  
      // create a sample text file in the selected folder
      // writeFile(folderHandle.current, 'FSAPIExample.txt', 'Hello, world!');
  
      // uncomment to list folder contents
      // for await (const entry of folderHandle.current.values()) {
      //   console.log(entry.kind, entry.name);
      // }
  
      // setStatusMessage("Downloading files...")
  
      // try {
        setIsLoading(true);
        await downloadFiles();
        setStatusMessage("Downloading completed...")
        setIsLoading(false);
      //   console.log('Download completed');
      // } catch (error) {
      //   console.error('An error occurred:', error);
      // }
  
    } catch (error) {
  
      console.error('go failed:', error);
  
    } finally {
  
      console.log('go completed');
  
    }
  };

  /**
   * downloadFiles
   */
  async function downloadFiles() {

    setStatusMessage("downloadFiles started")

    let startTime = Date.now();
    let startDate = new Date(startTime);
    let dateString = startDate.toString();

    console.log(`downloadFiles called: ${dateString}`);

    let base_url = props.config.baseUrl;
    let vehicle_serial = vehicleID.current;
    let per_page = props.config.perPageCount
    let pre_signed_download_urls = true;
    let token = props.config.token; 
    let kind = "vehicleImage";
  
    let page1Url = `${base_url}?vehicle_serial=${vehicle_serial}&kind=${kind}&pre_signed_download_urls=${pre_signed_download_urls}&per_page=${per_page}&page_number=1`;
  
    let headers = {
      "accept": "application/json",
      "Authorization": `${token}`
    };
  
    let totalPhotosDownloaded = 0;
    let totalPhotos = 0;
    let statusMsg= ''

    try {

      let response = await esriRequest(page1Url, {
        useProxy: false,
        method: "get",
        headers: headers,
      });
  
      console.log(`response.text: ${response.data}`);
  
      let data = response.data;
      let pagination = data.data.pagination;
      let current_page = pagination.current_page;
      let max_per_page = pagination.max_per_page;
      let total_pages = pagination.total_pages;
  
      console.log(`Current Page: ${current_page}`);
      console.log(`Max Per Page: ${max_per_page}`);
      console.log(`Total Pages: ${total_pages}`);
  
      // let files = data.data.files;
  
      for (let page = 1; page <= total_pages; page++) {
        let pageUrl = `${base_url}?vehicle_serial=${vehicle_serial}&kind=${kind}&pre_signed_download_urls=${pre_signed_download_urls}&per_page=${per_page}&page_number=${page}`;
        let response = await esriRequest(pageUrl, {
          useProxy: false,
          method: "get",
          headers: headers,
        });
  
        let page_data = response.data;
        let files = page_data.data.files;

        for (let file of files) {
          totalPhotos += 1;
          let download_url = file.download_url;
          let filename = file.filename;
  
          let response = await esriRequest(download_url, {
            responseType: "blob",
          });
  
          let blob = response.data;
          let reader = new FileReader();

          reader.onload = function() {
            if (this.readyState == 2) {
              let arrayBuffer: ArrayBuffer = this.result as ArrayBuffer;
              writeFile(filename, new Uint8Array(arrayBuffer));
              statusMsg = `...Downloaded: ${totalPhotos}, ${filename}`
              console.log(statusMsg);
              setStatusMessage(statusMsg)
              totalPhotosDownloaded += 1;
            }
          };
          
          reader.readAsArrayBuffer(blob);
        } // end of for loop

      } // end of for loop

    } catch (e) {
      statusMsg = `...downloadFiles failed: ${e}`
      console.error(statusMsg);
      setStatusMessage(statusMsg)

    } finally {
      let elapsedTime = Date.now() - startTime;
      statusMsg = `Download completed, elapsedTime: ${elapsedTime / 60000} minutes. Average minutes per image: ${(elapsedTime / totalPhotos) / 60000}`
      console.log(statusMsg);
      setStatusMessage(statusMsg);
    
    }
  }

  /**
   * writeFile
   * @param fileName  
   * @param contents 
   */
  async function writeFile(fileName, contents) {
    try {
      // Create a new file handle.
      const fileHandle = await folderHandle.current.getFileHandle(fileName, { create: true });
  
      // Create a writable stream.
      const writable = await fileHandle.createWritable();
  
      // Write the contents to the file.
      await writable.write(contents);
  
      // Close the writable stream.
      await writable.close();

    } catch (error) {
      console.error('Permission was not granted or an error occurred:', error);

    }
  }

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

  // useEffect(() => {
  //   getNetworkMetaData()
  // }, []);

  // useEffect(() => {
  //   console.log("g2m useEffect called")
  //   if (g2mData.length > 0) {
  //     handleMeasureRowClicked(JSON.stringify(g2mResults.current[0]))
  //     // setg2mData(g2mResults.current)
  //   }
  // }, [g2mData]);

  // useEffect(() => {
  //   console.log("status message useEffect called")

  // }, [statusMessage]);

  // const removeLineNameColumn = (columns) => {
  //   return columns.filter(column => column.Header !== 'Line Name');
  // }

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

      // setjimuMapView(jmv)

      // addNetwork(jmv)

      // // could get from the FL upon loaded
      // let xmin = -8241602.81762082
      // let ymin = 4972629.538129259
      // let xmax = -8204989.48107227
      // let ymax =  4985031.445968512
      // let sr = 102100

      // zoomToExtent(jmv, xmin, ymin, xmax, ymax, sr)
      
      jmv.current.view.on("immediate-click", evt => {

          console.log("evt.x= " + evt.x + ", evt.y= " + evt.y);
          console.log("evt.mapPoint.x= " + evt.mapPoint.x + ", evt.mapPoint.y= " + evt.mapPoint.y)

          // const pt = jmv.view.toMap(evt.mapPoint.x,evt.mapPoint.y);

          // setg2mData([])
          // g2mRouteList.current = []
          // setg2rData([])

          // process_g2m_Request(evt.mapPoint.x, evt.mapPoint.y)

      });

    }

  }

    // if (props.state==='CLOSED') {
    //   setg2mData([])
    //   g2mRouteList.current = []
    //   setg2rData([])
    // }


  /**
   * the UI
   */
  return (
    <div className="widget-starter jimu-widget" style={{ position: 'relative', overflow: "auto" ,padding: "0px"}}>
      <div style={{ pointerEvents: isLoading ? 'none' : 'auto', opacity: isLoading ? 0.5 : 1 }}>
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
                <div className="control">Vehicle ID: <TextInput onAcceptValue={handleVehicleID} type="text"/></div>
                <div className="control">Captured After: <TextInput onAcceptValue={handleCapturedAfter} type="datetime-local"/></div>
                <div className="control">Captured Before: <TextInput onAcceptValue={handleCapturedBefore} type="datetime-local"/></div>

                <div className="control">
                  Project Folder: 
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <TextInput style={{ flex: 1 }} onAcceptValue={function noRefCheck(){}} type="text" value={projectFolder} readOnly />
                    <Button
                      onClick={handleChooseFolder}
                      icon = {true}
                      style={{ marginLeft: "5px", width: 30}}
                    >
                      <div className='d-flex list-item-icon mx-2'>{folderIcon}</div>
                    </Button>
                  </div>
                </div>

                <div className="control" style={{ textAlign: 'right' }}>
                  <Button
                    onClick={go}
                    size="default"
                    disabled={isGoDisabled}
                  >
                    Go
                  </Button>
                </div>

                <div className="control" style={{ width: '100%', height:'100%'}}>
                  <TextArea
                    height={100}
                    className="mb-4"
                    readOnly
                    value={statusMessage}
                    style={{ width: '100%', overflowY: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        }}>
          <RotatingLines
            visible={true}
            height="96"
            width="96"
            color="grey"
            strokeWidth="5"
            animationDuration="0.75"
            ariaLabel="rotating-lines-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
      )}
    </div>
  );
}