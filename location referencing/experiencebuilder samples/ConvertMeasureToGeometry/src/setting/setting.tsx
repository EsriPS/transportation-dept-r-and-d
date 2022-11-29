/** @jsx jsx */
/**
  Licensing

  Copyright 2022 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/


/** @jsx jsx */
/**
  Licensing

  Copyright 2022 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/
import { React, FormattedMessage, css, jsx } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { TextInput } from "jimu-ui";
import {
  MapWidgetSelector,
  SettingSection,
  SettingRow
} from "jimu-ui/advanced/setting-components";
import { IMConfig } from "../config";
import defaultMessages from "./translations/default";

export default class Setting extends React.PureComponent<
  AllWidgetSettingProps<IMConfig>,
  any
> {

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    });
  };

  onAcceptNetworkUrlValue = (event) => {
    console.log("onAcceptNetworkUrlValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "networkurl",
        event
      ),
    });
  };

  onAcceptM2GUrlValue = (event) => {
    console.log("onAcceptM2GUrlValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "m2gurl",
        event
      ),
    });
  };

  render() {
    const style = css`
      .widget-setting-addLayers {
        .checkbox-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
      }
    `;

    return (
      <div css={style}>
        <div className="widget-setting-addLayers">

          <SettingSection className="map-selector-section" title={this.props.intl.formatMessage({id: "mapWidgetLabel",defaultMessage: defaultMessages.selectMapWidget})}>
            <SettingRow>
              <MapWidgetSelector
                onSelect={this.onMapWidgetSelected}
                useMapWidgetIds={this.props.useMapWidgetIds}
              />
            </SettingRow>
          </SettingSection>

          <SettingSection title={this.props.intl.formatMessage({id: "settingsLabel", defaultMessage: defaultMessages.settings })}>

          <SettingRow>

            <div style={{display: 'flex',flexDirection: 'column'}}>
              <label style={{justifyContent:'left'}}>
                Network Url:{' '}
              </label>
              <TextInput
                  // className="w-100"
                  style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                  // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                  // placeholder="https://..."
                  defaultValue={this.props.config.networkurl}
                  onAcceptValue={this.onAcceptNetworkUrlValue}></TextInput>
            </div>

          </SettingRow>

          <SettingRow>

            <div style={{display: 'flex',flexDirection: 'column'}}>
              <label style={{justifyContent:'left'}}>
                m2g Url:{' '}
              </label>
              <TextInput
                  // className="w-100"
                  style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                  // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                  // placeholder="https://..."
                  defaultValue={this.props.config.m2gurl}
                  onAcceptValue={this.onAcceptM2GUrlValue}></TextInput>
            </div>

          </SettingRow>

          </SettingSection>
        </div>
      </div>
    );
  }
}


// import { React, FormattedMessage, css, jsx } from "jimu-core";
// import { AllWidgetSettingProps } from "jimu-for-builder";
// import { TextInput } from "jimu-ui";
// import {
//   MapWidgetSelector,
//   SettingSection,
//   SettingRow
// } from "jimu-ui/advanced/setting-components";
// import { IMConfig } from "../config";
// import defaultMessages from "./translations/default";

// export default class Setting extends React.PureComponent<
//   AllWidgetSettingProps<IMConfig>,
//   any
// > {

//   onMapWidgetSelected = (useMapWidgetIds: string[]) => {
//     this.props.onSettingChange({
//       id: this.props.id,
//       useMapWidgetIds: useMapWidgetIds
//     });
//   };

//   onAcceptValue = (event) => {
//     console.log("onAcceptValue called")
//     this.props.onSettingChange({
//       id: this.props.id,
//       config: this.props.config.set(
//         "networkurl",
//         event
//       ),
//     });
//   };

//   render() {
//     const style = css`
//       .widget-setting-addLayers {
//         .checkbox-row {
//           display: flex;
//           justify-content: space-between;
//           margin-bottom: 8px;
//         }
//       }
//     `;

//     return (
//       <div css={style}>
//         <div className="widget-setting-addLayers">

//           <SettingSection className="map-selector-section" title={this.props.intl.formatMessage({id: "mapWidgetLabel",defaultMessage: defaultMessages.selectMapWidget})}>
//             <SettingRow>
//               <MapWidgetSelector
//                 onSelect={this.onMapWidgetSelected}
//                 useMapWidgetIds={this.props.useMapWidgetIds}
//               />
//             </SettingRow>
//           </SettingSection>

//           <SettingSection title={this.props.intl.formatMessage({id: "settingsLabel", defaultMessage: defaultMessages.settings })}>

//           <SettingRow>

//             <div style={{display: 'flex',flexDirection: 'column'}}>
//               <label style={{justifyContent:'left'}}>
//                 NetworkURL:{' '}

//               </label>
//               <TextInput
//                   // className="w-100"
//                   style={{ whiteSpace: "nowrap", minWidth: "200px" }}
//                   // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
//                   // placeholder="https://..."
//                   defaultValue={"https://..."}
//                   onAcceptValue={this.onAcceptValue}></TextInput>

//               <label style={{justifyContent:'left'}}>
//                 Route ID:{' '}

//               </label>
//               <TextInput
//                   // className="w-100"
//                   style={{ whiteSpace: "nowrap", minWidth: "200px" }}
//                   // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
//                   // placeholder="https://..."
//                   defaultValue={"routeid"}
//                   onAcceptValue={this.onAcceptValue}></TextInput>

//               <label style={{justifyContent:'left'}}>
//                 Route Name:{' '}
//               </label>
//               <TextInput
//                   // className="w-100"
//                   style={{ whiteSpace: "nowrap", minWidth: "200px" }}
//                   // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
//                   // placeholder="https://..."
//                   defaultValue={"routename"}
//                   onAcceptValue={this.onAcceptValue}></TextInput>

//               <label style={{justifyContent:'left'}}>
//                 Route Type:{' '}
//               </label>
//               <TextInput
//                   // className="w-100"
//                   style={{ whiteSpace: "nowrap", minWidth: "200px" }}
//                   // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
//                   // placeholder="https://..."
//                   defaultValue={"routename"}
//                   onAcceptValue={this.onAcceptValue}></TextInput>

//             </div>

//           </SettingRow>


//           </SettingSection>
//         </div>
//       </div>
//     );
//   }
// }
