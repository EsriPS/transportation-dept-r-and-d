import {React, AllWidgetProps, jsx, AppMode, IMState} from 'jimu-core';
import {loadArcGISJSAPIModules} from 'jimu-arcgis';
//import request = require('esri/request');
import { IMConfig } from '../config';

/**
 * generic State declaration
 */
interface State {
  doRequestLoad: boolean;
  responseJson: '';
}

/**
 * generic Props declaration
 */
interface Props{
  appMode: AppMode,
}

/**
 * widget as a class component
 * 
 * references:
 * https://developers.arcgis.com/experience-builder/guide/extend-base-widget/
 */
export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig> & Props, State>{

  Request: typeof __esri.request;

  static mapExtraStateProps = (state: IMState, props: AllWidgetProps<IMConfig>): Props => {
    return {
      appMode: state?.appRuntimeInfo?.appMode,
    }
  }

  /**
   * 
   * @param props constructor
   */
  constructor(props) {
    super(props);
    const { config } = props;
    this.state = {
      doRequestLoad: false,
      responseJson: ''
    };
  }



  /**
   *  querySOE function
   */

  querySOE = () => {

    loadArcGISJSAPIModules([
      'esri/request'
    ]).then(modules => {
      [this.Request] = modules;

          //var url = "https://transdemo2.esri.com/server/rest/services/MAPIT/MAPITProjects/MapServer/exts/MaPPSServices/PI_GetMunicipalities?f=json";
    var url = "https://www.schoolsitelocator.com/server/rest/services/ssl_AB/MapServer/exts/SSL_API/SSL_Query?apiKey=1&districtCode=60006&address=8169+W+Victory+Road+Boise&location=&f=pjson";

    this.Request(url, {
      responseType: "json"
    }).then(function(response){

      this.setState({
        responseJson: response.data
      });

      console.log(response.data)
      debugger;
    }.bind(this));
    
      // this.querySOE();
      // debugger;

      this.setState({
      doRequestLoad: true
      });
    })

  


  }

  /**
   * render method
   */
  render() {
    return (
      <div>
        Hello from request-tester: {JSON.stringify(this.state.responseJson)}
      </div>
    )
  }
}
