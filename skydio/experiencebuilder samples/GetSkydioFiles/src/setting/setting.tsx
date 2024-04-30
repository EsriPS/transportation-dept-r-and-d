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

  onAcceptBaseUrlValue = (event) => {
    console.log("onAcceptBaseUrlValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "baseUrl",
        event
      ),
    });
  };

  onAcceptPerPageCountValue = (event) => {
    console.log("onAcceptPerPageCountValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "perPageCount",
        event
      ),
    });
  };

  onAcceptTokenValue = (event) => {
    console.log("onAcceptTokenValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "token",
        event
      ),
    });
  };

  onAcceptUserGuidanceValue = (event) => {
    console.log("onAcceptUserGuidanceValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "userGuidance",
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
                Base url:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.baseUrl}
                    onAcceptValue={this.onAcceptBaseUrlValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                Per page count:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.perPageCount}
                    onAcceptValue={this.onAcceptPerPageCountValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                Token:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.token}
                    onAcceptValue={this.onAcceptTokenValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                user guidance:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.userGuidance}
                    onAcceptValue={this.onAcceptUserGuidanceValue}></TextInput>
              </div>

            </SettingRow>

          </SettingSection>
        </div>
      </div>
    );
  }
}