import React, { useState } from 'react';

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

function WallpaperCard({ wp }) {
  const [hoverLoaded, setHoverLoaded] = useState(false);

  return (
    <div
      className="group rounded-xl overflow-hidden bg-gradient-to-br from-[#ff4f00]/20 from-0% via-[#ff4f00]/5 via-45% to-gray-900/70 to-100% border border-white/10 hover:border-[#ff4f00]/50 shadow-xl hover:shadow-2xl backdrop-blur-md transition-all duration-300"
      onMouseEnter={() => setHoverLoaded(true)}
      onFocus={() => setHoverLoaded(true)}
    >
      <div className="relative h-48 overflow-hidden bg-gray-900/40">
        <img
          src={wp.defaultImg}
          alt={wp.name}
          width="800"
          height="384"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-opacity duration-200 group-hover:opacity-0"
        />
        {hoverLoaded && (
          <img
            src={wp.hoverImg}
            alt=""
            aria-hidden="true"
            width="800"
            height="384"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        )}
      </div>
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-2 text-white">{wp.name}</h2>
        <p className="text-sm text-gray-300 mb-4">{wp.description}</p>
        <a
          href={wp.downloadUrl}
          download
          className="block px-4 py-2 rounded-lg text-sm font-medium text-white text-center bg-gradient-to-br from-[#ff4f00]/60 from-0% via-[#ff4f00]/15 via-45% to-gray-900/60 to-100% border border-[#ff4f00]/40 hover:border-[#ff4f00]/70 backdrop-blur-md transition-all"
        >
          {wp.buttonText}
        </a>
      </div>
    </div>
  );
}

export default function Wallpapers() {
  return (
    <div className="p-8 flex-1 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-switch-bold text-4xl mb-8 text-center bg-gradient-to-r from-[#ff4f00] to-[#ff7f50] bg-clip-text text-transparent">Wallpapers</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {wallpapers.map((wp) => (
            <WallpaperCard key={wp.id} wp={wp} />
          ))}
        </div>
      </div>
    </div>
  );
}

