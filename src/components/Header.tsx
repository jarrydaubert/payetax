'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-red-500 to-blue-600 p-4 sticky top-0 z-20 shadow-lg">
      <div className="container flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <Link href="/" className="text-xl font-bold md:text-2xl text-white flex items-center">
          <i className="fas fa-tools mr-2 text-yellow-300"></i>ToolHubX
        </Link>
        {/* Commented out ad space and BMC link until AdSense approval */}
        {/* <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-gray-700 p-2 rounded-lg text-white text-sm shadow-md">
            <p><i className="fas fa-ad mr-2"></i>Support ToolHubX!</p>
          </div>
        </div> */}
      </div>
    </header>
  );
}