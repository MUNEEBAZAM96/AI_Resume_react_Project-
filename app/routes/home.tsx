import type { Route } from "./+types/home";
import Navbar from "../components/nav_bar";
import { resumes } from "../constants";
import ResumeCard from "../components/Resume_card";
import { Link, useNavigate, useLocation } from "react-router";
import { useEffect } from "react";
import { usePuterStore } from "../lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume AI — Track & Rate Your Resumes" },
    { name: "description", content: "Smart AI feedback for your resume." },
  ];
}

export default function Home() {
  const { auth } = usePuterStore();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.search.split("next=")[1];

  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
    auth.checkAuthStatus();
  }, [auth.isAuthenticated, next, navigate]);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="main-section mt-6">
        <div className="page-heading">
          <h1>Track your Applications &amp; Resume Ratings</h1>
          <h2>
            Get AI-powered feedback and an ATS score so you always put your best
            resume forward.
          </h2>

          {/* CTA row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link to="/upload">
              <button className="primary-button w-fit px-8 py-3 text-base">
                Upload a Resume
              </button>
            </Link>
            {auth.isAuthenticated && (
              <button
                onClick={auth.signOut}
                className="border border-gray-300 rounded-full px-6 py-3 text-sm font-medium text-dark-200 hover:bg-gray-50 transition-colors"
              >
                Sign out
              </button>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="flex flex-wrap justify-center gap-8 text-center mt-4">
          {[
            { label: "Resumes analysed", value: "2 k+" },
            { label: "Avg. score boost", value: "+18 pts" },
            { label: "ATS pass-rate", value: "94 %" },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-gradient">{value}</span>
              <span className="text-sm text-dark-200">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Resume cards ── */}
      {resumes.length > 0 ? (
        <section className="resumes-section py-10 px-6">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </section>
      ) : (
        /* Empty state */
        <section className="flex flex-col items-center gap-6 py-24 px-6 text-center">
          <div className="primary-gradient w-16 h-16 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-3xl">📄</span>
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">
            No resumes yet
          </h3>
          <p className="text-dark-200 max-w-sm">
            Upload your first resume and get instant AI feedback on how to
            improve it.
          </p>
          <Link to="/upload">
            <button className="primary-button w-fit px-8 py-3 text-base">
              Upload Resume
            </button>
          </Link>
        </section>
      )}
    </main>
  );
}
