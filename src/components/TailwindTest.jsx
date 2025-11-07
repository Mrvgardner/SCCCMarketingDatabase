import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Tailwind CSS Test</h1>
      <p className="text-lg text-gray-700 mb-6 text-center">
        If this text is styled properly, Tailwind CSS is working!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Blue Card</h2>
          <p className="text-blue-700">This card has blue styling</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-green-800 mb-2">Green Card</h2>
          <p className="text-green-700">This card has green styling</p>
        </div>
        
        <div className="bg-purple-100 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-purple-800 mb-2">Purple Card</h2>
          <p className="text-purple-700">This card has purple styling</p>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Tailwind Button
        </button>
      </div>
    </div>
  );
};

export default TailwindTest;
