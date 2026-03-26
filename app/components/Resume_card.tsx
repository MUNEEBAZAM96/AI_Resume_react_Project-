import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import ScoreCircle from "./Score_Circle";
import { usePuterStore } from "~/lib/puter";

interface ResumeCardProps {
  resume: Resume;
}

const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-red-500";

const ResumeCard = ({ resume }: ResumeCardProps) => {
  const { fs } = usePuterStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!resume.imagePath) return;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const blob = await fs.read(resume.imagePath);
        if (blob) {
          objectUrl = URL.createObjectURL(blob as Blob);
          setImageUrl(objectUrl);
        }
      } catch {
        /* leave placeholder on error */
      }
    })();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [resume.imagePath]);

  const score = resume.feedback?.overallScore ?? 0;

  return (
    <Link
      to={`/resume/${resume.id}`}
      className="resume-card group animate-in fade-in-0 duration-300 transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Header: company name + score */}
      <div className="resume-card-header">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-dark-200 truncate">
            {resume.jobTitle ?? "Position"}
          </p>
          <h3 className="text-xl font-bold text-gradient truncate">
            {resume.companyName ?? "Company"}
          </h3>
        </div>
        <ScoreCircle score={score} />
      </div>

      {/* Resume preview image */}
      <div className="gradient-border flex-1 overflow-hidden rounded-xl min-h-[180px] bg-gray-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={resume.companyName ?? "Resume preview"}
            className="h-full w-full rounded-xl object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          /* Skeleton / placeholder while the image loads */
          <div className="h-full w-full rounded-xl flex flex-col items-center justify-center gap-2 animate-pulse">
            <span className="text-3xl opacity-20">📄</span>
            <span className="text-xs text-dark-200 opacity-40">Loading preview…</span>
          </div>
        )}
      </div>

      {/* Footer: score bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-400" : "bg-red-400"
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={`text-sm font-bold shrink-0 ${scoreColor(score)}`}>
          {score}
          <span className="text-xs font-normal text-dark-200"> / 100</span>
        </span>
      </div>
    </Link>
  );
};

export default ResumeCard;
