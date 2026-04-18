import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Login() {
  const { user, login, signup } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <img
            src="/logos/switch/Logo Main/SC Logo Main - White.png"
            alt="Switch Commerce"
            className="mx-auto h-12 mb-6"
          />
          <h1 className="text-3xl font-bold text-white">Team Portal</h1>
          <p className="mt-2 text-gray-400">Sign in to access marketing resources</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={login}
            className="w-full py-3 px-4 bg-[#0951fa] hover:bg-[#0951fa]/90 text-white font-semibold rounded-lg transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={signup}
            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold rounded-lg transition-colors"
          >
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
}
