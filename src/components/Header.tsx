'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-red-500 to-blue-600 p-4 sticky top-0 z-20 shadow-lg">
      <div className="container flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <Link href="/" className="text-xl font-bold md:text-2xl text-white flex items-center">
          <i className="fas fa-tools mr-2 text-yellow-300"></i>ToolHubX
        </Link>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-gray-700 p-2 rounded-lg text-white text-sm shadow-md">
            <p><i className="fas fa-ad mr-2"></i>Support ToolHubX!</p>
          </div>
          <a
            href="https://www.buymeacoffee.com/toolhubx.uk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-300 hover:text-yellow-400 flex items-center transition duration-150"
          >
            <i className="fas fa-coffee mr-2" aria-hidden="true"></i>Buy Me a Coffee
          </a>
        </div>
      </div>
    </header>
  );
}