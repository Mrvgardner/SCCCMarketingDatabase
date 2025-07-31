import React from 'react';
import { Link } from "react-router-dom";
import { CompanyValues } from './components/ui/CompanyValues';

const ModifiedHome = () => {
  // Use try-catch to prevent the entire app from crashing if something fails
  try {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Team Switch Commerce</h1>
          <p className="text-xl text-gray-600 mb-8">Your central hub for team resources</p>
          
          {/* Company Values Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-12">
            <h2 className="text-2xl font-bold mb-6">Company Values</h2>
            <CompanyValues />
          </div>
        </div>
        
        {/* Tools Section */}
        <h2 className="text-2xl font-bold mb-6">Tools & Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Slack", description: "Team communication and collaboration" },
            { name: "BambooHR", description: "HR and employee management" },
            { name: "Assembly", description: "Recognition and rewards" },
            { name: "Jira", description: "Project tracking and management" }
          ].map((tool) => (
            <div key={tool.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">{tool.name}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{tool.description}</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Go to {tool.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering ModifiedHome:", error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl text-red-500 mb-4">Something went wrong</h1>
        <p>There was an error rendering the home page component.</p>
        <pre className="bg-gray-100 p-4 mt-4 text-left overflow-auto">
          {error.toString()}
        </pre>
      </div>
    );
  }
};

export default ModifiedHome;
