| Sample  | Description    | Exb Version
| :---:   | :---: | :---: |
| measuretogeometry | simple experiencebuilder widget that calls location referencing API measuretogeometry   | 1.9 |
| geometrytomeasure | simple experiencebuilder widget that calls location referencing API geometrytomeasure   | 1.9 |
| relocateevent | simple experiencebuilder widget that calls location referencing API geometrytomeasure   | 1.9 |
| spatialqueryofroutes | simple experiencebuilder widget that spatially queries routes   | 1.9 |
| displayroutedetailsonhover | simple experiencebuilder widget that displays route details when hovering over the network   | 1.9 |
| spatialqueryofevents | simple experiencebuilder widget that displays spatial queries for event details   | 1.9 |
| attributequeryofevents | simple experiencebuilder widget that displays attribute queries for event details   | 1.9 |
| attributequeryofroutes | simple experiencebuilder widget that displays attribute queries for route details   | 1.9 |
| SessionManagerTester | simple test harness to investigate session manager and APP_CONFIG_PROCESSOR   | 1.10 |
| PointToReferent | simple experiencebuilder widget that locates a referent along a route | 1.13 |

# Deployment / usage
1. Copy the widget to the your-drive:\your-folder\your-dev-edition-experience-builder-deployment\client\your-extensions\widgets folder
2. Add the widget to your experience
3. Update the widgets settings
4. Example settings... (based on roadsandhighways samples / sample server)

   Network url: https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer/2 
   
   G2m Url: https://roadsandhighwayssample.esri.com/server/rest/services/RoadsHighways/NewYork/MapServer/exts/LRServer/networkLayers/3/geometryToMeasure

