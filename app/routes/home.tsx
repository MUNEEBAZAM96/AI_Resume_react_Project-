import type { Route } from "./+types/home";
import Navbar from "../components/nav_bar";
import { resumes } from "../constants";
import Resume_card from "../components/Resume_card";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Smart Feedback for your Resume!" },
  ];
}

export default function Home() {
   return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />
       <section className="main-section bg-gradient-to-b from-light-blue-100 to-light-blue-200">
        <div className="page-heading">
          <h1>Track  your Application Progress & Resume Ratings!</h1>
          <h2>Review your resume with our AI-powered feedback and get a score on how well you're presenting yourself.</h2>

        </div>
        
        </section>
       {resumes.length > 0 && (
        <section className="resumes-section mt-10 grid grid-cols-1 gap-6 px-6 pb-10 md:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <Resume_card key={resume.id} resume={resume} />
          ))}
        </section>
        )}
  </main>
}
