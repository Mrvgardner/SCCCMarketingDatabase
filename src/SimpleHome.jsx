import React from 'react';
import { Link } from "react-router-dom";

const SimpleHome = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Team Switch Commerce</h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Your central hub for team resources</p>
        
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          marginBottom: '2rem' 
        }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Company Values</h2>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem', 
            justifyContent: 'center' 
          }}>
            {["Integrity", "Excellence", "Innovation", "Teamwork", "Customer Focus"].map((value) => (
              <div key={value} style={{
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '200px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{value}</h3>
                <p>Description of {value.toLowerCase()} as a company value.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Tools & Resources</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '1rem' 
      }}>
        {["Slack", "BambooHR", "Assembly", "Jira"].map((tool) => (
          <div key={tool} style={{
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{tool}</h3>
            <p style={{ marginBottom: '1rem' }}>Description of {tool}</p>
            <a href="#" style={{ 
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              textDecoration: 'none'
            }}>Go to {tool}</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimpleHome;
