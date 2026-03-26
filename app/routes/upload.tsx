import React, { useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/nav_bar";
import { usePuterStore } from "~/lib/puter";
import { convertPdfToImage } from "~/lib/pdf2image";
import { generateUUID } from "~/lib/util";
import { prepareInstructions, AIResponseFormat } from "~/constants";

export const meta = () => [
  { title: "Upload Resume — Resume AI" },
  { name: "description", content: "Upload your resume for AI-powered feedback." },
];

type Status = "idle" | "uploading" | "converting" | "analysing" | "saving" | "done" | "error";

const STATUS_MESSAGES: Record<Status, string> = {
  idle:       "",
  uploading:  "Uploading your resume…",
  converting: "Converting PDF to image…",
  analysing:  "AI is scoring your resume…",
  saving:     "Saving your results…",
  done:       "Done! Redirecting…",
  error:      "Something went wrong.",
};

const Upload = () => {
  // ── hooks must all live here, inside the component ──
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [status, setStatus]         = useState<Status>("idle");
  const [statusText, setStatusText] = useState<string>("");
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);
  const [fileName, setFileName]     = useState<string | null>(null);

  const tick = (s: Status, msg?: string) => {
    setStatus(s);
    setStatusText(msg ?? STATUS_MESSAGES[s]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : null);
  };

  // ── single, top-level async handler – no nested async functions ──
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const form         = e.currentTarget;
    const formData     = new FormData(form);
    const companyName  = formData.get("company-name")    as string;
    const jobTitle     = formData.get("job-title")       as string;
    const jobDesc      = (formData.get("job-description") as string) ?? "";
    const resumeFile   = formData.get("resume")          as File;

    if (!resumeFile || resumeFile.size === 0) {
      setErrorMsg("Please select a PDF file.");
      return;
    }

    try {
      setProcessing(true);

      // 1 ─ Upload the original PDF
      tick("uploading");
      const ext     = resumeFile.name.split(".").pop() ?? "pdf";
      const pdfNode = await fs.write(`resume_${Date.now()}.${ext}`, resumeFile);
      if (!pdfNode) throw new Error("PDF upload failed.");
      const resumePath = (pdfNode as unknown as { path: string }).path;

      // 2 ─ Convert page-1 to a PNG thumbnail
      tick("converting");
      const { file: imgFile, error: convErr } = await convertPdfToImage(resumeFile);
      if (!imgFile) throw new Error(convErr ?? "PDF-to-image conversion failed.");
      const imgNode = await fs.write(`resume_thumb_${Date.now()}.png`, imgFile);
      if (!imgNode) throw new Error("Thumbnail upload failed.");
      const imagePath = (imgNode as unknown as { path: string }).path;

      // 3 ─ Ask Puter AI (Claude) to analyse the resume via the PDF path
      tick("analysing");
      const prompt     = prepareInstructions({ jobTitle, jobDescription: jobDesc, AIResponseFormat });
      const aiResponse = await ai.feedback(resumePath, prompt);
      console.log("🤖 Raw AI response:", aiResponse);
      if (!aiResponse) throw new Error("AI did not return a response.");

      // 4 ─ Extract the text content (Claude returns a plain string; OpenAI returns an array)
      const msgContent = (aiResponse as AIResponse).message.content;
      console.log("📄 message.content:", msgContent);
      let raw: string;
      if (typeof msgContent === "string") {
        raw = msgContent;
      } else if (Array.isArray(msgContent) && msgContent.length > 0) {
        const first = msgContent[0];
        raw = typeof first === "string" ? first : (first as { text: string }).text ?? "";
      } else {
        raw = String(aiResponse);
      }
      // Strip any markdown code fences the model may have wrapped the JSON in
      raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
      console.log("📝 Raw JSON string:", raw);

      const feedback: Feedback = JSON.parse(raw);
      console.log("✅ Parsed feedback:", feedback);

      // 5 ─ Persist the complete resume record to Puter KV
      tick("saving");
      const uid    = generateUUID();
      const resume: Resume = {
        id:          uid,
        companyName,
        jobTitle,
        imagePath,
        resumePath,
        feedback,
      };
      await kv.set(`resume_${uid}`, JSON.stringify(resume));

      // 6 ─ Navigate to the detail page
      tick("done");
      navigate(`/resume/${uid}`);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setErrorMsg(msg);
      tick("error", msg);
      setProcessing(false);
    }
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />

      <section className="main-section mt-6">
        <div className="page-heading">
          <h1>Smart AI Feedback for your Dream Job</h1>
          <h2>
            Drop your resume and get an instant ATS score with detailed improvement tips.
          </h2>
        </div>

        {/* ── Processing / error state ── */}
        {processing ? (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="gradient-border rounded-3xl p-[2px] w-full">
              <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-4 text-center">
                {status === "error" ? (
                  <span className="text-5xl">❌</span>
                ) : (
                  <img
                    src="/images/resume-scan.gif"
                    alt="Processing…"
                    className="w-48 h-48 object-contain"
                  />
                )}

                <p className={`text-lg font-semibold ${
                  status === "error" ? "text-red-600" : "text-slate-900 animate-pulse"
                }`}>
                  {statusText || STATUS_MESSAGES[status]}
                </p>

                {errorMsg && (
                  <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2 w-full break-words">
                    {errorMsg}
                  </p>
                )}

                {status === "error" ? (
                  <button
                    onClick={() => {
                      setProcessing(false);
                      setStatus("idle");
                      setStatusText("");
                      setErrorMsg(null);
                    }}
                    className="primary-button w-fit px-6 py-2 text-sm"
                  >
                    Try again
                  </button>
                ) : (
                  <p className="text-sm text-dark-200">
                    Our AI is scoring your resume against ATS criteria. This usually takes 10–20 seconds.
                  </p>
                )}
              </div>
            </div>
          </div>

        ) : (
          /* ── Upload form ── */
          <div className="gradient-border rounded-3xl p-[2px] w-full max-w-lg shadow-xl">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl px-10 py-10 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-semibold text-slate-900">Resume details</h3>
                <p className="text-sm text-dark-200">
                  Fill in the role you're applying for so the AI can tailor its feedback.
                </p>
              </div>

              {errorMsg && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">
                  {errorMsg}
                </p>
              )}

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
                  <img src="/images/pdf.png" alt="PDF" className="w-10 h-10 object-contain" />
                  <span className="text-sm text-dark-200 font-medium">
                    {fileName ?? "Click to select or drag & drop your PDF"}
                  </span>
                  <span className="text-xs text-gray-400">Supported format: PDF · Max 10 MB</span>
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
