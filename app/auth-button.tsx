"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

interface AuthButtonProps {
  googleEnabled?: boolean;
  azureEnabled?: boolean;
}

interface ProviderButtonProps {
  provider: "github" | "google" | "microsoft-entra-id";
  children: React.ReactNode;
}

function ProviderButton({ provider, children }: ProviderButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Base styles for all buttons
  const baseStyles =
    "flex items-center justify-center gap-3 px-6 py-3 font-semibold text-white rounded-lg transform transition-all duration-300 shadow-lg hover:shadow-xl";

  // Provider-specific styles
  const providerStyles = {
    github: isHovered
      ? "scale-105 bg-gradient-to-r from-gray-800 to-gray-900"
      : "bg-gradient-to-r from-gray-700 to-gray-800",
    google: isHovered
      ? "scale-105 bg-gradient-to-r from-red-600 to-red-700"
      : "bg-gradient-to-r from-red-500 to-red-600",
    "microsoft-entra-id": isHovered
      ? "scale-105 bg-gradient-to-r from-blue-700 to-blue-800"
      : "bg-gradient-to-r from-blue-600 to-blue-700",
  };

  return (
    <button
      onClick={() => signIn(provider)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseStyles} ${providerStyles[provider]}`}
    >
      {children}
    </button>
  );
}

function GitHubIcon({ isHovered }: { isHovered: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`h-5 w-5 transition-transform duration-300 ${
        isHovered ? "rotate-12" : ""
      }`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path
        transform="scale(0.8)"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
    >
      <path
        transform="scale(0.8)"
        d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
      />
    </svg>
  );
}

export default function AuthButton({ googleEnabled = false, azureEnabled = false }: AuthButtonProps) {
  const { data: session, status } = useSession();

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex items-center gap-4">
        <div className="w-32 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <img
            src={session.user?.image || "/default-avatar.png"}
            alt={session.user?.name || "User"}
            className="w-8 h-8 rounded-full"
          />
          <p className="text-gray-700 font-medium truncate max-w-[120px]">
            {session.user?.name || "User"}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* GitHub is always enabled */}
      <ProviderButton provider="github">
        <GitHubIcon isHovered={false} />
        <span>Sign in with GitHub</span>
      </ProviderButton>

      {/* Google provider - only show if enabled */}
      {googleEnabled && (
        <ProviderButton provider="google">
          <GoogleIcon />
          <span>Sign in with Google</span>
        </ProviderButton>
      )}

      {/* Microsoft Entra ID provider - only show if enabled */}
      {azureEnabled && (
        <ProviderButton provider="microsoft-entra-id">
          <MicrosoftIcon />
          <span>Sign in with Microsoft</span>
        </ProviderButton>
      )}
    </div>
  );
}
