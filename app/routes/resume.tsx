import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import Navbar from "~/components/nav_bar";
import ScoreCircle from "~/components/Score_Circle";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "Resume Feedback — Resume AI" },
  { name: "description", content: "AI-powered resume feedback and ATS score." },
];

/* ─── config ─────────────────────────────────────────────── */

const CATEGORY_META: Record<
  string,
  { label: string; icon: string; description: string }
> = {
  ATS: {
    label: "ATS Compatibility",
    icon: "🤖",
    description: "How well your resume passes automated applicant tracking systems.",
  },
  toneAndStyle: {
    label: "Tone & Style",
    icon: "✍️",
    description: "Clarity, professionalism and consistency of your writing voice.",
  },
  content: {
    label: "Content",
    icon: "📋",
    description: "Relevance, depth and impact of the information you've included.",
  },
  structure: {
    label: "Structure",
    icon: "🏗️",
    description: "Organisation, layout and visual hierarchy of the document.",
  },
  skills: {
    label: "Skills",
    icon: "⚡",
    description: "Alignment of your listed skills with the role requirements.",
  },
};

const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-500" : "text-red-500";

const scoreBarColor = (s: number) =>
  s >= 80
    ? "bg-emerald-500"
    : s >= 60
    ? "bg-amber-400"
    : "bg-red-400";

const scoreLabel = (s: number) =>
  s >= 80 ? "Excellent" : s >= 60 ? "Good" : s >= 40 ? "Fair" : "Needs work";

/* ─── sub-components ─────────────────────────────────────── */

const TipBadge = ({ type }: { type: "good" | "improve" }) =>
  type === "good" ? (
    <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-badge-green text-badge-green-text flex items-center justify-center text-xs font-bold">
      ✓
    </span>
  ) : (
    <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-badge-red text-badge-red-text flex items-center justify-center text-xs font-bold">
      ↑
    </span>
  );

interface CategoryCardProps {
  categoryKey: string;
  category: {
    score: number;
    tips?: { type: "good" | "improve"; tip: string; explanation?: string }[];
  };
}

const CategoryCard = ({ categoryKey, category }: CategoryCardProps) => {
  const meta   = CATEGORY_META[categoryKey];
  const tips   = category.tips ?? [];
  const good   = tips.filter((t) => t.type === "good");
  const improve = tips.filter((t) => t.type === "improve");

  return (
    <div className="gradient-border rounded-3xl p-[2px] h-full">
      <div className="bg-white rounded-3xl p-6 flex flex-col gap-5 h-full">

        {/* Card header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shrink-0">
              {meta?.icon ?? "📊"}
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">
                {meta?.label ?? categoryKey}
              </h3>
              {meta?.description && (
                <p className="text-xs text-dark-200 mt-0.5 leading-snug">
                  {meta.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className={`text-2xl font-bold ${scoreColor(category.score)}`}>
              {category.score}
            </span>
            <span className="text-xs text-dark-200">{scoreLabel(category.score)}</span>
          </div>
        </div>

        {/* Score bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(category.score)}`}
              style={{ width: `${category.score}%` }}
            />
          </div>
          <span className="text-xs font-medium text-dark-200 w-12 text-right shrink-0">
            {category.score} / 100
          </span>
        </div>

        {/* Tips */}
        {tips.length > 0 && (
          <div className="flex flex-col gap-4">
            {/* Strengths */}
            {good.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  ✦ Strengths
                </p>
                <ul className="flex flex-col gap-2.5">
                  {good.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-badge-green/40 rounded-xl px-3 py-2.5">
                      <TipBadge type="good" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{t.tip}</p>
                        {t.explanation && (
                          <p className="text-xs text-dark-200 mt-0.5">{t.explanation}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {improve.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-500">
                  ↑ Improvements
                </p>
                <ul className="flex flex-col gap-2.5">
                  {improve.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5 bg-badge-red/40 rounded-xl px-3 py-2.5">
                      <TipBadge type="improve" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{t.tip}</p>
                        {t.explanation && (
                          <p className="text-xs text-dark-200 mt-0.5">{t.explanation}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {tips.length === 0 && (
          <p className="text-sm text-dark-200 italic">No tips provided for this category.</p>
        )}
      </div>
    </div>
  );
};

/* ─── page ───────────────────────────────────────────────── */

const ResumePage = () => {
  const { id }   = useParams<{ id: string }>();
  const { kv }   = usePuterStore();
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const raw = await kv.get(`resume_${id}`);
        if (!raw) throw new Error("Resume not found.");
        const parsed = JSON.parse(raw);
        setResume(parsed);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load resume.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* loading */
  if (loading) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <img src="/images/resume-scan.gif" alt="Loading…" className="w-40 h-40 object-contain" />
          <p className="text-dark-200 animate-pulse text-lg">Loading feedback…</p>
        </div>
      </main>
    );
  }

  /* error */
  if (error || !resume) {
    return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-6">
          <span className="text-5xl">😕</span>
          <p className="text-2xl font-semibold text-slate-900">Resume not found</p>
          <p className="text-dark-200 max-w-sm">{error ?? "This resume may have been deleted."}</p>
          <Link to="/">
            <button className="primary-button w-fit px-8 py-3">Back to Home</button>
          </Link>
        </div>
      </main>
    );
  }

  const { feedback } = resume;

  const categories = (
    Object.entries(feedback) as [
      string,
      { score: number; tips?: { type: "good" | "improve"; tip: string; explanation?: string }[] },
    ][]
  ).filter(
    ([key, val]) =>
      key !== "overallScore" &&
      val !== null &&
      typeof val === "object" &&
      typeof val.score === "number"
  );

  const allTips = categories.flatMap(([, cat]) => cat.tips ?? []);
  const goodCount    = allTips.filter((t) => t.type === "good").length;
  const improveCount = allTips.filter((t) => t.type === "improve").length;

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-20 pt-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-dark-200 mb-1">
              Resume Feedback
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-gradient leading-tight">
              {resume.companyName ?? "Your Resume"}
            </h1>
            <p className="text-xl text-dark-200 mt-1">{resume.jobTitle ?? "Position"}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/upload">
              <button className="primary-button w-fit px-6 py-2.5 text-sm">
                + New Resume
              </button>
            </Link>
            <Link to="/">
              <button className="border border-gray-300 rounded-full px-6 py-2.5 text-sm font-medium text-dark-200 hover:bg-gray-50 transition-colors">
                Home
              </button>
            </Link>
          </div>
        </div>

        {/* ── Overall score hero card ── */}
        <div className="gradient-border rounded-3xl p-[2px] mb-8">
          <div className="bg-white rounded-3xl px-8 py-8 flex flex-col md:flex-row items-center gap-8">

            {/* Score circle */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <ScoreCircle score={feedback.overallScore} />
              <span className={`text-sm font-semibold ${scoreColor(feedback.overallScore)}`}>
                {scoreLabel(feedback.overallScore)}
              </span>
            </div>

            {/* Score summary */}
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-dark-200">
                  Overall ATS Score
                </p>
                <p className={`text-5xl font-bold mt-1 ${scoreColor(feedback.overallScore)}`}>
                  {feedback.overallScore}
                  <span className="text-2xl text-dark-200 font-normal"> / 100</span>
                </p>
              </div>

              {/* Score bar */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(feedback.overallScore)}`}
                  style={{ width: `${feedback.overallScore}%` }}
                />
              </div>

              <p className="text-sm text-dark-200 max-w-lg">
                {feedback.overallScore >= 80
                  ? "Outstanding! Your resume is well-optimised for ATS and human reviewers."
                  : feedback.overallScore >= 60
                  ? "Good foundation — a few targeted improvements will significantly boost your chances."
                  : "There's meaningful room to improve. Follow the tips below to strengthen your resume."}
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex md:flex-col gap-4 shrink-0">
              <div className="flex flex-col items-center bg-badge-green rounded-2xl px-5 py-3">
                <span className="text-2xl font-bold text-badge-green-text">{goodCount}</span>
                <span className="text-xs font-medium text-badge-green-text">Strengths</span>
              </div>
              <div className="flex flex-col items-center bg-badge-red rounded-2xl px-5 py-3">
                <span className="text-2xl font-bold text-badge-red-text">{improveCount}</span>
                <span className="text-xs font-medium text-badge-red-text">To improve</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Category score bar overview ── */}
        <div className="gradient-border rounded-3xl p-[2px] mb-8">
          <div className="bg-white rounded-3xl px-8 py-6 flex flex-col gap-4">
            <h2 className="text-base font-semibold text-slate-900">Score Breakdown</h2>
            <div className="flex flex-col gap-3">
              {categories.map(([key, cat]) => {
                const m = CATEGORY_META[key];
                return (
                  <div key={key} className="flex items-center gap-4">
                    <span className="w-6 text-center text-base shrink-0">{m?.icon ?? "📊"}</span>
                    <span className="w-32 text-sm font-medium text-slate-700 shrink-0">
                      {m?.label ?? key}
                    </span>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(cat.score)}`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                    <span className={`w-10 text-sm font-bold text-right shrink-0 ${scoreColor(cat.score)}`}>
                      {cat.score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Category detail cards ── */}
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Detailed Feedback</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {categories.map(([key, category]) => (
            <CategoryCard key={key} categoryKey={key} category={category} />
          ))}
        </div>

        {/* ── Bottom actions ── */}
        <div className="flex flex-wrap gap-4 mt-12 justify-center">
          <Link to="/upload">
            <button className="primary-button w-fit px-8 py-3">
              Upload another Resume
            </button>
          </Link>
          <Link to="/">
            <button className="border border-gray-300 rounded-full px-8 py-3 text-sm font-medium text-dark-200 hover:bg-gray-50 transition-colors">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ResumePage;
