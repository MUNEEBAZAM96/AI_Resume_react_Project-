import React, { useState } from "react";
import Navbar from "~/components/nav_bar";

export const meta = () => [
  { title: "Upload Resume — Resume AI" },
  { name: "description", content: "Upload your resume for AI-powered feedback." },
];

type Status = "idle" | "processing" | "done" | "error";

const Upload = () => {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProcessing(true);
    setStatus("processing");
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section mt-6">
        <div className="page-heading">
          <h1>Smart AI Feedback for your Dream Job</h1>
          <h2>
            Drop your resume and get an instant ATS score with detailed
            improvement tips.
          </h2>
        </div>

        {/* ── Processing state ── */}
        {processing ? (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="gradient-border rounded-3xl p-[2px] w-full">
              <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 text-center">
                <img
                  src="/images/resume-scan.gif"
                  alt="Scanning resume…"
                  className="w-48 h-48 object-contain"
                />
                <p className="text-lg font-semibold text-slate-900 animate-pulse">
                  Analysing your resume…
                </p>
                <p className="text-sm text-dark-200">
                  Our AI is scoring your resume against ATS criteria. This
                  usually takes a few seconds.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ── Upload form ── */
          <div className="gradient-border rounded-3xl p-[2px] w-full max-w-lg shadow-xl">
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl px-10 py-10 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-slate-900">
                  Resume details
                </h3>
                <p className="text-sm text-dark-200">
                  Fill in the role you're applying for so the AI can tailor its
                  feedback.
                </p>
              </div>

              {/* Company name */}
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  id="company-name"
                  name="company-name"
                  placeholder="e.g. Google"
                  required
                />
              </div>

              {/* Job title */}
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  id="job-title"
                  name="job-title"
                  placeholder="e.g. Frontend Engineer"
                  required
                />
              </div>

              {/* Job description */}
              <div className="form-div">
                <label htmlFor="job-description">
                  Job Description{" "}
                  <span className="text-xs text-gray-400">(optional)</span>
                </label>
                <textarea
                  id="job-description"
                  name="job-description"
                  placeholder="Paste the job description for more tailored feedback…"
                  rows={4}
                />
              </div>

              {/* File upload */}
              <div className="form-div">
                <label htmlFor="resume">Resume (PDF)</label>
                <label
                  htmlFor="resume"
                  className="uplader-drag-area flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed border-indigo-200 hover:border-indigo-400 transition-colors"
                >
                  <img
                    src="/images/pdf.png"
                    alt="PDF"
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-sm text-dark-200 font-medium">
                    {fileName ?? "Click to select or drag & drop your PDF"}
                  </span>
                  <span className="text-xs text-gray-400">
                    Supported format: PDF · Max 10 MB
                  </span>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    accept=".pdf"
                    className="sr-only"
                    onChange={handleFileChange}
                    required
                  />
                </label>
              </div>

              <button type="submit" className="primary-button w-full py-3 text-base">
                Analyse my Resume
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
};

export default Upload;