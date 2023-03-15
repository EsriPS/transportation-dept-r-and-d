import { React, AllWidgetProps, SessionManager } from 'jimu-core';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'reactstrap';
import { JimuMapViewComponent, JimuMapView } from "jimu-arcgis";
import { IMConfig } from "../config";

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
   * styles
   */
  const styles = {
    ButtonStyle: {
        marginRight: "5px",
        marginTop: "5px",
        marginBottom: "5px"
    }
  }

  /**
   * runSessionMgrTests
   */
  const runSessionMgrTests = () => {
    console.log("runSessionMgrTests called")

    const session = SessionManager.getInstance()
    const instance = session.getMainSession()

    // log some session related stuff for reference
    // if already logged in the user and portal props are available

    console.log("session.token: " + instance?.token)
    console.log("session.username: " +  instance?.username)
    console.log("session.tokenDuration: " + instance?.tokenDuration)
    console.log("%j", props);
    console.log("props.user.username: " + props?.user?.username)
    console.log("props.user.fullName: " + props?.user?.fullName)
    console.log("props.user.firstName: " + props?.user?.firstName)
    console.log("props.user.groups.length: " + props?.user?.groups?.length)

    if (props?.user?.groups?.length > 0) {
      console.log("props.user.groups[0].title: " + props.user.groups[0].title)
    }

    // pause here to review the console
    alert("Review the console for Test results. Then click OK to see the signin() challenge");

    // reference: https://developers.arcgis.com/experience-builder/api-reference/jimu-core/SessionManager
    //
    // Some observations/ideas...
    //
    // notes
    //  get session
    //  get instance
    //  if instance == null
    //   user is not logged in
    //  else
    //    refer to props.user... for equvalent getPortal() and getUser() info

    const yourPortal = "https://transdemo3.esri.com/portal"
    const yourAppID = "AeOyWgFqvJ40pbyA"  // see Add item->Application...be sure to set redirects

    session.signIn(window.jimuConfig.mountPath,true,yourPortal, yourAppID).then((sess) => {
      console.log("then fired %j", sess)
      sess.getPortal().then(response => {
        console.log(response.name); 
      })
      sess.getUser().then(response => {
        console.log(response.fullName); 
      })
    })
 
  }

  /**
   * activeViewChangeHandler
   * @param jmv 
   */
    const activeViewChangeHandler = (jmv: JimuMapView) => {
      console.log("activeViewChangeHandler called...");
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

        <div >
          <Button color="primary" style={styles.ButtonStyle} onClick={runSessionMgrTests}>Run tests</Button>
        </div>

    </div>

  }