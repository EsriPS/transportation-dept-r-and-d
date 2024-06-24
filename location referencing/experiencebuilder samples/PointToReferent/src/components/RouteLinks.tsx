// import React, { useState } from 'react';
// import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, Tooltip } from 'jimu-ui';

// const RouteLinks = ({ routes, onRouteClick, disabled }) => {
//     console.log("RouteLinks called");



//   const handleRouteClick = (routeid) => {
//     console.log(`RouteLinks->handleRouteClick called: routeid = ${routeid}`);

//     const selectedRoute = routes.find((route) => route.RouteID === routeid);
//     onRouteClick(selectedRoute);
//   };

//   const [selectedChoice, setSelectedChoice] = useState('');

//   const handleChoiceSelect = (choice) => {
//     console.log(`RouteLinks->handleChoiceSelect called: choice = ${choice}`);
//     setSelectedChoice(choice);
//     debugger;
//   };

//   return (
//     <div style={{ width: 250 }}>
//       <Dropdown style={{ borderRadius: '.25rem', border: '1px solid lightgray' }} disabled={disabled}>
//         <Tooltip title={selectedChoice ? selectedChoice.RouteID : "This is a tooltip"}>
//           <DropdownButton a11y-description="Please pick an action">
//             {selectedChoice ? selectedChoice.RouteName : 'Selection required'}
//           </DropdownButton>
//         </Tooltip>
//         <DropdownMenu offset={[0, 4]}>
//           {routes.map((route, index) => (
//             <DropdownItem
//               key={index}
//               onClick={() => {
//                 handleChoiceSelect(route);
//                 handleRouteClick(route.RouteID);
//               }}
//               active={selectedChoice.RouteName === route.RouteName}
//             >
//               {route.RouteName}
//             </DropdownItem>
//           ))}
//         </DropdownMenu>
//       </Dropdown>
//     </div>
//   );
// };

// export default RouteLinks;

import React, { useState } from 'react';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, Tooltip } from 'jimu-ui';

const RouteLinks = ({ routes, onRouteClick, disabled, selectedChoice, handleChoiceSelect }) => {
  console.log("RouteLinks called");

  const handleRouteClick = (routeid) => {
    console.log(`RouteLinks->handleRouteClick called: routeid = ${routeid}`);

    const selectedRoute = routes.find((route) => route.RouteID === routeid);
    onRouteClick(selectedRoute);
  };

  return (
    <div style={{ width: 250 }}>
      <Dropdown style={{ borderRadius: '.25rem', border: '1px solid lightgray', width: '12rem' }} disabled={disabled}>
        <Tooltip title={selectedChoice ? selectedChoice.RouteName + ', LRS RouteID: ' + selectedChoice.RouteID : ""}>
          <DropdownButton a11y-description="Please pick an action">
            {selectedChoice ? selectedChoice.RouteName : 'Selection required'}
          </DropdownButton>
        </Tooltip>
        <DropdownMenu offset={[0, 4]}>
          {routes.map((route, index) => (
            <DropdownItem
              key={index}
              onClick={() => {
                handleChoiceSelect(route);
                handleRouteClick(route.RouteID);
              }}
              active={selectedChoice.RouteName === route.RouteName}
            >
              {route.RouteName}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default RouteLinks;

