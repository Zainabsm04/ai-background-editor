import React from 'react';

const backgrounds = [
  { id: 1, name: 'Beach', url: '/backgrounds/beach.jpg' },
  { id: 2, name: 'Sunset', url: '/backgrounds/sunset.jpg' },
  { id: 3, name: 'City', url: '/backgrounds/city.jpg' },
];

export default function BackgroundSelector({ selected, onSelect }) {
  return (
    <div style={{ marginTop: 20 }}>
      <h3>Select Background</h3>
      <div style={{ display: 'flex', gap: 10 }}>
        {backgrounds.map((bg) => (
          <img
            key={bg.id}
            src={bg.url}
            alt={bg.name}
            width="100"
            style={{ 
              border: selected === bg.id ? '3px solid blue' : '1px solid gray', 
              cursor: 'pointer',
              borderRadius: '8px'
            }}
            onClick={() => onSelect(bg.id)}
          />
        ))}
      </div>
    </div>
  );
}
