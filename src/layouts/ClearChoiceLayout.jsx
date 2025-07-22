import { Link } from 'react-router-dom';

export default function ClearChoiceLayout({ children }) {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
      <header className="bg-brand-orange text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img src="/logos/clear-choice-logo.png" alt="Clear Choice Logo" className="h-10" />
          <h1 className="font-bold text-xl">Clear Choice Branding & Marketing</h1>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link to="/clear-choice" className="hover:text-gray-200">
                Home
              </Link>
            </li>
            <li>
              <Link to="/clear-choice/branding" className="hover:text-gray-200">
                Brand Guidelines
              </Link>
            </li>
            <li>
              <Link to="/clear-choice/resources" className="hover:text-gray-200">
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