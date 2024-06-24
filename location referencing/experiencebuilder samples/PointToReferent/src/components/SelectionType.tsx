import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownButton, DropdownMenu, DropdownItem, Tooltip } from 'jimu-ui';

function SelectionType({ choices, defaultChoice, onSelect, tooltipTitle }) {
  const [selectedChoice, setSelectedChoice] = useState(defaultChoice);

  const handleSelect = (choice) => {
    setSelectedChoice(choice);
    onSelect(choice);
  };

  useEffect(() => {
    setSelectedChoice(defaultChoice);
    onSelect(defaultChoice);
  }, [defaultChoice]);

  return (
    <div style={{ width: 250 }}>
      <Dropdown style={{ borderRadius: '.25rem', border: '1px solid lightgray', width: '12rem' }}>
        <Tooltip title={tooltipTitle}>
          <DropdownButton a11y-description="Please select a choice">
            {selectedChoice ? selectedChoice : 'Select a choice'}
          </DropdownButton>
        </Tooltip>
        <DropdownMenu offset={[0, 4]}>
          {choices.map((choice) => (
            <DropdownItem
              key={choice}
              onClick={() => handleSelect(choice)}
              active={selectedChoice === choice}
            >
              {choice}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}

export default SelectionType;
