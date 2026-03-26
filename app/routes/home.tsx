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

/* ── Confirmation modal ── */
interface ConfirmWipeModalProps {
  count: number;
  wiping: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmWipeModal = ({ count, wiping, onConfirm, onCancel }: ConfirmWipeModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    {/* Backdrop */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={!wiping ? onCancel : undefined}
    />

    {/* Panel */}
    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-6 animate-in fade-in-0 zoom-in-95 duration-200">
      {/* Icon */}
      <div className="flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <span className="text-3xl">🗑️</span>
        </div>
      </div>

      {/* Text */}
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-xl font-bold text-slate-900">Wipe all data?</h2>
        <p className="text-sm text-dark-200 leading-relaxed">
          This will permanently delete{" "}
          <span className="font-semibold text-slate-800">
            {count} {count === 1 ? "resume" : "resumes"}
          </span>{" "}
          — including all AI feedback and uploaded files. This action{" "}
          <span className="font-semibold text-red-500">cannot be undone</span>.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={wiping}
          className="flex-1 border border-gray-200 rounded-full py-3 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={wiping}
          className="flex-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full py-3 text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {wiping ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Wiping…
            </>
          ) : (
            "Yes, wipe all"
          )}
        </button>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { auth, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.search.split("next=")[1];

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [wiping, setWiping] = useState(false);

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

        setResumes(loaded);
      } catch (err) {
        console.error("Failed to load resumes:", err);
        setResumes([]);
      } finally {
        setLoadingResumes(false);
      }
    })();
  }, [auth.isAuthenticated]);

  /* ── Wipe all data ── */
  const handleWipeAll = async () => {
    setWiping(true);
    try {
      await Promise.all(
        resumes.map(async (resume) => {
          // Delete PDF + thumbnail from Puter FS (ignore individual failures)
          await Promise.allSettled([
            resume.resumePath ? fs.delete(resume.resumePath) : Promise.resolve(),
            resume.imagePath  ? fs.delete(resume.imagePath)  : Promise.resolve(),
          ]);
          // Delete the KV record
          await kv.delete(`resume_${resume.id}`);
        })
      );
      setResumes([]);
    } catch (err) {
      console.error("Wipe failed:", err);
    } finally {
      setWiping(false);
      setShowConfirm(false);
    }
  };

  const isEmpty = !loadingResumes && resumes.length === 0;

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      {/* Confirmation modal (portal-style overlay) */}
      {showConfirm && (
        <ConfirmWipeModal
          count={resumes.length}
          wiping={wiping}
          onConfirm={handleWipeAll}
          onCancel={() => setShowConfirm(false)}
        />
      )}

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
        <section className="resumes-section py-10 px-6">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </section>
      ) : isEmpty ? (
        <section className="flex flex-col items-center gap-6 py-24 px-6 text-center">
          <div className="primary-gradient w-16 h-16 rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-3xl">📄</span>
          </div>
          <h3 className="text-2xl font-semibold text-slate-900">No resumes yet</h3>
          <p className="text-dark-200 max-w-sm">
            Upload your first resume and get instant AI feedback on how to improve it.
          </p>
          <Link to="/upload">
            <button className="primary-button w-fit px-8 py-3 text-base">
              Upload Resume
            </button>
          </Link>
        </section>
      ) : (
        <section className="resumes-section py-10 px-6">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6 max-w-6xl mx-auto w-full px-2">
            <h2 className="text-xl font-semibold text-slate-900">
              Your Resumes
              <span className="ml-2 text-sm font-normal text-dark-200">
                ({resumes.length} {resumes.length === 1 ? "resume" : "resumes"})
              </span>
            </h2>

            {/* Wipe button */}
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Wipe all data
            </button>
          </div>

          {/* Resume cards */}
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </section>
      )}
    </main>
  );
}
