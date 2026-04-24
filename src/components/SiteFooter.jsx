import { Link, useLocation } from "react-router-dom";

const HIDE_ON = ["/marketing-request", "/login"];

export default function SiteFooter() {
  const { pathname } = useLocation();
  if (HIDE_ON.includes(pathname)) return null;

  return (
    <footer className="bg-gray-900/40 border-t border-white/10 backdrop-blur-md py-12 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h3 className="font-switch-bold text-2xl text-white mb-4">
          Need something custom?
        </h3>
        <p className="text-gray-400 mb-6">
          Contact the marketing team for custom collateral requests.
        </p>
        <Link
          to="/marketing-request"
          className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-br from-[#0951fa]/60 from-0% via-[#0951fa]/15 via-45% to-gray-900/60 to-100% border border-[#0951fa]/40 hover:border-[#0951fa]/70 shadow-xl backdrop-blur-md transition-all"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          Submit Marketing Request
        </Link>
      </div>
    </footer>
  );
}
