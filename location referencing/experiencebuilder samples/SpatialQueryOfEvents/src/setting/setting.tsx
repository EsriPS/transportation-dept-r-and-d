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

  onAcceptMapServiceValue = (event) => {
    console.log("onAcceptMapServiceValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "mapservice",
        event
      ),
    });
  };

  onAcceptVisibleLayersValue = (event) => {
    console.log("onAcceptVisibleLayersValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "visiblelayers",
        event
      ),
    });
  };

  onAcceptQueryLayerValue = (event) => {
    console.log("onAcceptQueryLayerValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "querylayerindex",
        event
      ),
    });
  };

  onAcceptEventIDValue = (event) => {
    console.log("onAcceptEventIDValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "eventid",
        event
      ),
    });
  };

  onAcceptRouteIDValue = (event) => {
    console.log("onAcceptRouteIDValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "routeid",
        event
      ),
    });
  };

  onAcceptFromMeasureValue = (event) => {
    console.log("onAcceptFromMeasureValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "frommeasure",
        event
      ),
    });
  };

  onAcceptToMeasureValue = (event) => {
    console.log("onAcceptToMeasureValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "tomeasure",
        event
      ),
    });
  };

  onAcceptFunctionalClasstypeValue = (event) => {
    console.log("onAcceptFunctionalClasstypeValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "functionalclasstype",
        event
      ),
    });
  };

  onAcceptTo_DateValue = (event) => {
    console.log("onAcceptTo_DateValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "to_date",
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
                  Map Service:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.mapservice}
                    onAcceptValue={this.onAcceptMapServiceValue}></TextInput>
              </div>
            </SettingRow>
            <SettingRow>
              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  Visible Layers:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.visiblelayers}
                    onAcceptValue={this.onAcceptVisibleLayersValue}></TextInput>
              </div>
            </SettingRow>
            <SettingRow>
              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  Query Layer Index:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.querylayerindex}
                    onAcceptValue={this.onAcceptQueryLayerValue}></TextInput>
              </div>
            </SettingRow>
            <SettingRow>
              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  EventID:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.eventid}
                    onAcceptValue={this.onAcceptEventIDValue}></TextInput>
              </div>
            </SettingRow>
            <SettingRow>
              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  RouteID:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.routeid}
                    onAcceptValue={this.onAcceptRouteIDValue}></TextInput>
              </div>
            </SettingRow>
            <SettingRow>
              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  From Measure:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.frommeasure}
                    onAcceptValue={this.onAcceptFromMeasureValue}></TextInput>
              </div>
            </SettingRow>
            <SettingRow>
              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  To Measure:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.tomeasure}
                    onAcceptValue={this.onAcceptToMeasureValue}></TextInput>
              </div>
            </SettingRow>
            <SettingRow>
              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  FunctionalClass Type:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.functionalclasstype}
                    onAcceptValue={this.onAcceptFunctionalClasstypeValue}></TextInput>
              </div>
            </SettingRow>
            <SettingRow>
              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  To Date:{' '}
                </label>
                <TextInput
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    defaultValue={this.props.config.to_date
                    onAcceptValue={this.onAcceptTo_DateValue}></TextInput>
              </div>
            </SettingRow>
          </SettingSection>

        </div>
      </div>
    );
  }
}