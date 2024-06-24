import React from 'react';

function ReferentResults({ results }) {
  return (
    <div className='referentDetails' style={{ display: 'flex' }}>
      <div style={{ width: '8rem' }}>
        {results.map((result, index) => (
          <div key={index}>
            {Object.entries(result).map(([key, value]) => (
              <p key={key}>{key}</p>
            ))}
          </div>
        ))}
      </div>
      <div>
        {results.map((result, index) => (
          <div key={index}>
            {Object.entries(result).map(([key, value]) => (
              <p key={key}>{value}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReferentResults;
