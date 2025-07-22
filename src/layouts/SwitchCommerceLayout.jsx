import { Link } from 'react-router-dom';

export default function SwitchCommerceLayout({ children }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logos/switch-commerce-logo.png" alt="Switch Commerce Logo" className="h-10" />
          <h1 className="font-bold text-xl">Switch Commerce Branding & Marketing</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/switch-commerce" className="hover:text-gray-200">
                Home
              </Link>
            </li>
            <li>
              <Link to="/switch-commerce/branding" className="hover:text-gray-200">
                Brand Guidelines
              </Link>
            </li>
            <li>
              <Link to="/switch-brochure" className="hover:text-gray-200">
                Resources
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-gray-200">
                Team Portal
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}