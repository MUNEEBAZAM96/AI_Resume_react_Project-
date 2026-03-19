import React, { useEffect } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "../lib/puter";

export const meta = () => [
  {
    title: "Auth | Resume AI Tracker",
    name: "description",
    content: "Login to your account to continue",
  },
];

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) navigate("/");
  }, [auth.isAuthenticated]);

  return (
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center px-4">
      <div className="gradient-border shadow-2xl rounded-3xl p-[2px]">
        <section className="flex flex-col items-center gap-8 bg-white rounded-3xl px-12 py-14 w-full max-w-md text-center">

          {/* Logo / brand mark */}
          <div className="flex flex-col items-center gap-3">
            <div className="primary-gradient w-14 h-14 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white text-2xl font-bold">R</span>
            </div>
            <h1 className="text-3xl font-bold text-gradient tracking-tight">
              Resume AI
            </h1>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-slate-900">
              {auth.isAuthenticated ? `Welcome back!` : "Get started today"}
            </h2>
            <p className="text-sm text-dark-200 leading-relaxed">
              {auth.isAuthenticated
                ? "You're already signed in. Redirecting…"
                : "Sign in to track your job applications and get AI-powered resume feedback."}
            </p>
          </div>

          {/* Features list */}
          {!auth.isAuthenticated && (
            <ul className="text-sm text-dark-200 space-y-2 text-left w-full">
              {[
                "AI resume scoring & detailed feedback",
                "ATS compatibility analysis",
                "Track applications across companies",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-indigo-500">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          )}

          {/* Action button */}
          <div className="w-full">
            {isLoading ? (
              <button
                className="auth-button animate-pulse opacity-70"
                disabled
              >
                Signing in…
              </button>
            ) : auth.isAuthenticated ? (
              <button className="auth-button" onClick={auth.signOut}>
                Sign out
              </button>
            ) : (
              <button className="auth-button" onClick={auth.signIn}>
                Sign in with Puter
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400">
            By signing in you agree to our{" "}
            <span className="underline cursor-pointer">Terms of Service</span>.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Auth;