import Link from 'next/link'; // Add this import

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-red-500 to-blue-600 p-6 mt-auto shadow-lg">
      <div className="container text-center text-white">
        <div className="bg-gray-700 p-3 rounded-lg mb-4 shadow-md">
          <p className="text-sm"><i className="fas fa-ad mr-2"></i>Keep ToolHubX Free!</p>
        </div>
        <p className="text-sm">
          © {new Date().getFullYear()} ToolHubX |{' '}
          <Link href="/privacy" className="hover:text-blue-200 transition duration-150">
            Cookie & Privacy Policy
          </Link>{' '}
          |{' '}
          <a href="mailto:support@toolhubx.uk" className="hover:text-blue-200 transition duration-150">
            Contact Us
          </a>
        </p>
      </div>
    </footer>
  );
}