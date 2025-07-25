import React from 'react';

// Wallpaper options
const wallpapers = [
  {
    id: 'desktop',
    name: 'Desktop Wallpaper',
    defaultImg: '/wallpapers/images/MartixBeautyShots-Macbook.png',
    hoverImg: '/wallpapers/images/MartixBeautyShots-Desktop.png',
    downloadUrl: '/wallpapers/images/SC-Matrix-Desktop.jpg',
    description: 'Optimized for widescreen monitors and laptops.',
    buttonText: 'Download Desktop Wallpaper',
  },
  {
    id: 'tablet',
    name: 'Tablet Wallpaper',
    defaultImg: '/wallpapers/images/MartixBeautyShots-ipad2.png',
    hoverImg: '/wallpapers/images/MartixBeautyShots-ipad1.png',
    downloadUrl: '/wallpapers/images/SC-Matrix-Tablet.jpg',
    description: 'Crisp resolution tailored for tablet devices.',
    buttonText: 'Download Tablet Wallpaper',
  },
  {
    id: 'phone',
    name: 'Phone Wallpaper',
    defaultImg: '/wallpapers/images/MartixBeautyShots-iPhone1.png',
    hoverImg: '/wallpapers/images/MartixBeautyShots-iPhone2.png',
    downloadUrl: '/wallpapers/images/SC-Matrix-Phone.jpg',
    description: 'Perfectly sized for smartphone screens.',
    buttonText: 'Download Phone Wallpaper',
  },
];

export default function Wallpapers() {
  return (
    <div className="p-8 min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <h1 className="text-4xl font-bold mb-6 text-center text-white">Wallpapers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {wallpapers.map((wp) => (
          <div key={wp.id} className="group bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
            {/* Hover image */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={wp.defaultImg}
                alt={wp.name}
                className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-0"
              />
              <img
                src={wp.hoverImg}
                alt={`${wp.name} hover`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              />
            </div>
            {/* Details and download */}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{wp.name}</h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{wp.description}</p>
              <a
                href={wp.downloadUrl}
                download
                className="block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center"
              >
                {wp.buttonText}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

