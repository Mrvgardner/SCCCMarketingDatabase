import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      margin: '2rem', 
      backgroundColor: '#f0f0f0', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', color: '#333' }}>Test Component</h1>
      <p style={{ fontSize: '1.2rem', color: '#666' }}>
        If you can see this, basic React rendering is working!
      </p>
    </div>
  );
};

export default TestComponent;
