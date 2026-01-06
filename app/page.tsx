import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AuthButton from "./auth-button";

export default async function HomePage() {
  const session = await auth();

  // If the user is already logged in, redirect them to the admin page.
  if (session) {
    redirect("/admin");
  }

  // Check which providers are enabled via environment variables
  const googleEnabled = !!(
    process.env.AUTH_GOOGLE_ID &&
    process.env.AUTH_GOOGLE_SECRET
  );
  const azureEnabled = !!(
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET &&
    process.env.AUTH_MICROSOFT_ENTRA_ID_ISSUER
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-500">
      <div className="glass-effect w-full relative z-10 animate-slide-in-up">
        {/* Avatar / Logo Section */}
        <div className="flex justify-center mb-6 animate-slide-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 overflow-hidden hover:scale-110 transition-transform duration-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white drop-shadow-sm"
        >
          Magic Link
        </h1>

        {/* Description */}
        <div className="max-w-md mx-auto mb-8 text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-200 font-medium">
            Secure authentication with multiple OAuth providers
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Please sign in with your account to continue
          </p>
        </div>

        {/* Auth Buttons */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-sm">
            <AuthButton googleEnabled={googleEnabled} azureEnabled={azureEnabled} />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2026 Magic Link. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
