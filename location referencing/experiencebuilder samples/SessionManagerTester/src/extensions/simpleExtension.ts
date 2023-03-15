import { extensionSpec, AppConfig, utils, createIntl, getAppStore } from 'jimu-core'
//import defaultMessage from '../runtime/translations/default'

export default class SimpleExtension implements extensionSpec.AppConfigProcessorExtension {
  id = 'simpleExtension'
  widgetId: string

  async process (appConfig: AppConfig): Promise<AppConfig> {

    debugger;

    // Do not replace when run in builder.
    if(window.jimuConfig.isInBuilder){
      return Promise.resolve(appConfig)
    }
    const widgetJson = appConfig.widgets[this.widgetId]

    // The process function of the AppConfigProcessor extension point will be invoked after the app config is loaded. 
    // Pass the loaded app config into this extension and this extension will return the processed app config.

    // Note you can update widget config file entries, for example:
    console.log("original appConfig.widgets.widget_3.config.editurl: " + appConfig.widgets.widget_3.config.editurl)
    appConfig.widgets.widget_3.config.editurl="123"
    console.log("modified appConfig.widgets.widget_3.config.editurl: " + appConfig.widgets.widget_3.config.editurl)
    //  to see the change break inside the widget for the updated config and review the change using props.config
    //  these changes can be used to "configure" widget capabilities based on the users rights which could be their portal group affiliations

    // const intl = createIntl({
    //   locale: getAppStore().getState().appContext.locale,
    //   messages: Object.assign({}, defaultMessage, widgetJson.manifest.i18nMessages)
    // })

    // utils.replaceI18nPlaceholdersInObject(appConfig, intl, defaultMessage)
    return Promise.resolve(appConfig)
  }
}