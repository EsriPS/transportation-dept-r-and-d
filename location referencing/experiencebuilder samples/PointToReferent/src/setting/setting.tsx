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
import { TextInput, Dropdown, DropdownButton, DropdownItem, DropdownMenu } from "jimu-ui";
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

  constructor(props) {
    super(props);
    this.state = {
      selectedPadFeatureId: "Yes",
      selectedDefaultOffset: "nearestUpstream",
      selectedDefaultOffsetUnit: "esriMiles"
    };
  }

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    });
  };

  // onAcceptNetworkUrlValue = (event) => {
  //   console.log("onAcceptNetworkUrlValue called: " + event)
  //   this.props.onSettingChange({
  //     id: this.props.id,
  //     config: this.props.config.set(
  //       "networkurl",
  //       event
  //     ),
  //   });
  // };

  onAcceptG2MUrlValue = (event) => {
    console.log("onAcceptG2MUrlValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "g2murl",
        event
      ),
    });
  };

  onAcceptG2RUrlValue = (event) => {
    console.log("onAcceptG2RUrlValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "g2rurl",
        event
      ),
    });
  };

  onAcceptG2RLayerIdValue = (event) => {
    console.log("onAcceptG2RLayerIdValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "g2rLayerId",
        event
      ),
    });
  };

  onAcceptFeatureIdFieldNameValue = (event) => {
    console.log("onAcceptFeatureIdFieldNameValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "featureIdFieldName",
        event
      ),
    });
  };
  
  onAcceptPadFeatureIdValue = (event) => {
    console.log("onAcceptPadFeatureIdValue called: " + event.target.textContent)


    this.setState({selectedPadFeatureId: event.target.textContent})


    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "padFeatureId",
        event.target.textContent
      ),
    });
  };

  onAcceptDefaultOffsetValue = (event) => {
    console.log("onAcceptDefaultOffsetValue called: " +  event.target.textContent)

    this.setState({selectedDefaultOffset: event.target.textContent})


    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "defaultOffset",
        event.target.textContent
      ),
    });
  };

  onAcceptOffsetUnitRoundingValue = (event) => {
    console.log("onAcceptOffsetUnitRoundingValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "offsetUnitRounding",
        event
      ),
    });
  };
  
  // onAcceptXYOutputUnitsValue = (evt, value, selectedValues) => {
  //   this.setState(
  //       {
  //         xyOutputUnits2: selectedValues
  //       },
  //       () => {
  //           this.props.onSettingChange({
  //               id: this.props.id,
  //               config: this.props.config.setIn(['xyOutputUnitConfig', 'hideDeleteByStatus'], selectedValues)
  //           })
  //       }
  //   )
  // }
  
  onAcceptOutSRValue = (event) => {
    console.log("onAcceptOutSRValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "outSR",
        event
      ),
    });
  };

  onAcceptToleranceValue = (event) => {
    console.log("onAcceptToleranceValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "tolerance",
        event
      ),
    });
  };

  onAcceptOutOffsetUnitValue = (event) => {
    console.log("onAcceptOutOffsetUnitValue called: " + event.target.textContent)

    this.setState({selectedDefaultOffsetUnit: event.target.textContent})

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "outOffsetUnit",
        event.target.textContent
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

  onAcceptPosReferentSeperatorValue = (event) => {
    console.log("onAcceptPosReferentSeperatorValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "posReferentSeperator",
        event
      ),
    });
  };

  onAcceptNegReferentSeperatorValue = (event) => {
    console.log("onAcceptNegReferentSeperatorValue called: " + event)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(
        "negReferentSeperator",
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
                  g2m Url:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.g2murl}
                    onAcceptValue={this.onAcceptG2MUrlValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  g2r Url:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.g2rurl}
                    onAcceptValue={this.onAcceptG2RUrlValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                  g2rLayerId:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.g2rLayerId}
                    onAcceptValue={this.onAcceptG2RLayerIdValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                featureId field name:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.featureIdFieldName}
                    onAcceptValue={this.onAcceptFeatureIdFieldNameValue}></TextInput>
              </div>

            </SettingRow>
            
            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                pad featureId:{' '}
                </label>

                  <Dropdown>
                      <DropdownButton
                        // onClick={this.onAcceptPadFeatureIdValue}
                        // onChange={this.onAcceptPadFeatureIdValue} 
                        size="sm"
                        title="Small"
                      >
                        {/* {this.state.selectedItem !== null ? this.state.selectedItem : "Select an item"} */}
                        {this.state.selectedPadFeatureId}
                      </DropdownButton>
                      <DropdownMenu
                        offset={[
                          0,
                          4
                        ]}
                      >
                        <DropdownItem active={"Yes" === this.state.selectedPadFeatureId} onClick={this.onAcceptPadFeatureIdValue}>
                          Yes
                        </DropdownItem>
                        <DropdownItem active={"No" === this.state.selectedPadFeatureId} onClick={this.onAcceptPadFeatureIdValue}>
                          No
                        </DropdownItem>
                      </DropdownMenu>
                  </Dropdown>

              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                default offset:{' '}
                </label>

                  <Dropdown>
                      <DropdownButton
                        // onClick={this.onAcceptDefaultOffsetValue}
                        size="sm"
                        title="Small"
                      >
                        {/* {this.props.config.defaultOffset} */}
                        {this.state.selectedDefaultOffset}
                      </DropdownButton>
                      <DropdownMenu
                        offset={[
                          0,
                          4
                        ]}
                      >
                        <DropdownItem active={"nearestUpstream" === this.state.selectedDefaultOffset} onClick={this.onAcceptDefaultOffsetValue}>
                          nearestUpstream
                        </DropdownItem>
                        <DropdownItem active={"closest" === this.state.selectedDefaultOffset} onClick={this.onAcceptDefaultOffsetValue}>
                          closest
                        </DropdownItem>
                      </DropdownMenu>
                  </Dropdown>

              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                offset unit rounding:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.offsetUnitRounding}
                    onAcceptValue={this.onAcceptOffsetUnitRoundingValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                outSR WKID:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.outSR}
                    onAcceptValue={this.onAcceptOutSRValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                tolerance:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.tolerance}
                    onAcceptValue={this.onAcceptToleranceValue}></TextInput>
              </div>

            </SettingRow>

            {/* esriInches | esriFeet | esriYards | esriMiles | esriNauticalMiles | esriMillimeters | 
              esriCentimeters | esriMeters | esriKilometers | esriDecimalDegrees | esriDecimeters | 
              esriIntInches | esriIntFeet | esriIntYards | esriIntMiles | esriIntNauticalMiles */}

            <SettingRow>

            <div style={{display: 'flex',flexDirection: 'column'}}>
              <label style={{justifyContent:'left'}}>
              default offset unit:{' '}
              </label>

                <Dropdown>
                    <DropdownButton
                      // onClick={this.onAcceptOutOffsetUnitValue}
                      size="sm"
                      title="Small"
                    >
                      {/* {this.props.config.outOffsetUnit} */}
                      {this.state.selectedDefaultOffsetUnit}
                    </DropdownButton>
                    <DropdownMenu
                      offset={[
                        0,
                        4
                      ]}
                    >
                      <DropdownItem active={"esriInches" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriInches
                      </DropdownItem>
                      <DropdownItem active={"esriFeet" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriFeet
                      </DropdownItem>
                      <DropdownItem active={"esriYards" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriYards
                      </DropdownItem>
                      <DropdownItem active={"esriMiles" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriMiles
                      </DropdownItem>
                      <DropdownItem active={"esriNauticalMiles" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriNauticalMiles
                      </DropdownItem>
                      <DropdownItem active={"esriMillimeters" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriMillimeters
                      </DropdownItem>
                      <DropdownItem active={"esriCentimeters" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriCentimeters
                      </DropdownItem>
                      <DropdownItem active={"esriMeters" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriMeters
                      </DropdownItem>
                      <DropdownItem active={"esriKilometers" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriKilometers
                      </DropdownItem>
                      <DropdownItem active={"esriDecimalDegrees" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriDecimalDegrees
                      </DropdownItem>
                      <DropdownItem active={"esriDecimeters" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriDecimeters
                      </DropdownItem>
                      <DropdownItem active={"esriIntInches" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriIntInches
                      </DropdownItem>
                      <DropdownItem active={"esriIntFeet" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriIntFeet
                      </DropdownItem>
                      <DropdownItem active={"esriIntYards" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriIntYards
                      </DropdownItem>
                      <DropdownItem active={"esriIntMiles" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriIntMiles
                      </DropdownItem>
                      <DropdownItem active={"esriIntNauticalMiles" === this.state.selectedDefaultOffsetUnit} onClick={this.onAcceptOutOffsetUnitValue}>
                        esriIntNauticalMiles
                      </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

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

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                pos referent seperator:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.posReferentSeperator}
                    onAcceptValue={this.onAcceptPosReferentSeperatorValue}></TextInput>
              </div>

            </SettingRow>

            <SettingRow>

              <div style={{display: 'flex',flexDirection: 'column'}}>
                <label style={{justifyContent:'left'}}>
                neg referent seperator:{' '}
                </label>
                <TextInput
                    // className="w-100"
                    style={{ whiteSpace: "nowrap", minWidth: "200px" }}
                    // style={{ whiteSpace: "nowrap", minHeight: "100px" }}
                    // placeholder="https://..."
                    defaultValue={this.props.config.negReferentSeperator}
                    onAcceptValue={this.onAcceptNegReferentSeperatorValue}></TextInput>
              </div>
              
            </SettingRow>

          </SettingSection>
        </div>
      </div>
    );
  }
}