import React, { useEffect, useState } from "react";
import type { Route } from "./+types/home";
import Navbar from "../components/nav_bar";
import ResumeCard from "../components/Resume_card";
import { Link, useNavigate, useLocation } from "react-router";
import { usePuterStore } from "../lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume AI — Track & Rate Your Resumes" },
    { name: "description", content: "Smart AI feedback for your resume." },
  ];
}

/* ── Skeleton card shown while resumes are loading ── */
const SkeletonCard = () => (
  <div className="resume-card animate-pulse pointer-events-none select-none">
    <div className="resume-card-header">
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-20 bg-gray-200 rounded-full" />
        <div className="h-5 w-36 bg-gray-200 rounded-full" />
      </div>
      <div className="w-[100px] h-[100px] rounded-full bg-gray-200 shrink-0" />
    </div>
    <div className="flex-1 rounded-xl bg-gray-100 min-h-[180px]" />
    <div className="h-2 w-full bg-gray-200 rounded-full" />
  </div>
);

export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.search.split("next=")[1];

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);

  /* Redirect unauthenticated users */
  useEffect(() => {
    if (!auth.isAuthenticated) navigate("/auth?next=/");
    auth.checkAuthStatus();
  }, [auth.isAuthenticated, next, navigate]);

  /* Fetch all resume records from Puter KV */
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    (async () => {
      setLoadingResumes(true);
      try {
        const items = (await kv.list("resume_*", true)) as KVItem[] | undefined;
        if (!items || items.length === 0) {
          setResumes([]);
          return;
        }

        const loaded = items
          .map((item) => {
            try {
              return JSON.parse(item.value) as Resume;
            } catch {
              return null;
            }
          })
          .filter((r): r is Resume => r !== null);

        /* Newest first — UUIDs don't sort by time, so we rely on list order */
        setResumes(loaded);
      } catch (err) {
        console.error("Failed to load resumes:", err);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    })();
  }, [auth.isAuthenticated]);

  const isEmpty = !loadingResumes && resumes.length === 0;

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

          <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
            <Link to="/upload">
              <button className="primary-button w-fit px-8 py-3 text-base">
                Upload a Resume
              </button>
            </Link>
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

      {/* ── Resume list section ── */}
      {loadingResumes ? (
        /* Skeleton grid */
        <section className="resumes-section py-10 px-6">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </section>
      ) : isEmpty ? (
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
      ) : (
        /* Real resume cards */
        <section className="resumes-section py-10 px-6">
          <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto w-full px-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Your Resumes
              <span className="ml-2 text-sm font-normal text-dark-200">
                ({resumes.length} {resumes.length === 1 ? "resume" : "resumes"})
              </span>
            </h2>
            <Link to="/upload">
              <button className="primary-button w-fit px-5 py-2 text-sm font-semibold">
                + New Resume
              </button>
            </Link>
          </div>
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </section>
      )}
    </main>
  );
}
