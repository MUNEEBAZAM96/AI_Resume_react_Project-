import React from "react";

interface ResumeCardProps {
  resume: Resume;
}

const Resume_card: React.FC<ResumeCardProps> = ({ resume }) => {
  return (
    <article className="rounded-2xl bg-white/80 p-4 shadow-md backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg">
      <img
        src={resume.imagePath}
        alt={resume.companyName ?? "Resume preview"}
        className="mb-3 h-40 w-full rounded-xl object-cover"
      />
      {resume.companyName && (
        <h3 className="text-lg font-semibold text-slate-900">
          {resume.companyName}
        </h3>
      )}
      {resume.jobTitle && (
        <p className="text-sm text-slate-600">{resume.jobTitle}</p>
      )}
    </article>
  );
};

export default Resume_card;