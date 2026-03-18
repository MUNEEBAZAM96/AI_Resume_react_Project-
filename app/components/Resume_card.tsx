import React from "react";
import { Link } from "react-router";
import ScoreCircle from "./Score_Circle";

interface ResumeCardProps {
  resume: Resume;
}

const ResumeCard = ({ resume }: ResumeCardProps) => {
  return (
    <Link
      to={`/resume/${resume.id}`}
      className="resume-card animate-in fade-in-0 duration-300 transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Header: company name + score */}
      <div className="resume-card-header">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium uppercase tracking-widest text-dark-200">
            {resume.jobTitle ?? "Position"}
          </p>
          <h3 className="text-xl font-semibold text-gradient">
            {resume.companyName ?? "Company"}
          </h3>
        </div>
        <ScoreCircle score={resume.feedback.overallScore} />
      </div>

      {/* Resume preview image */}
      <div className="gradient-border flex-1 overflow-hidden">
        <img
          src={resume.imagePath}
          alt={resume.companyName ?? "Resume preview"}
          className="h-full w-full rounded-xl object-cover object-top"
        />
      </div>

      {/* Footer: overall score badge */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-dark-200">Overall Score</span>
        <span className="score-badge primary-gradient text-sm font-semibold text-white px-4 py-1">
          {resume.feedback.overallScore} / 100
        </span>
      </div>
    </Link>
  );
};

export default ResumeCard;