
export const resumes: Resume[] = [
    {
      id: "1",
      companyName: "Google",
      jobTitle: "Frontend Developer",
      imagePath: "/public/images/resume_01.png",
      resumePath: "/resumes/resume-1.pdf",
      feedback: {
        overallScore: 85,
        ATS: {
          score: 90,
          tips: [],
        },
        toneAndStyle: {
          score: 90,
          tips: [],
        },
        content: {
          score: 90,
          tips: [],
        },
        structure: {
          score: 90,
          tips: [],
        },
        skills: {
          score: 90,
          tips: [],
        },
      },
    },
    {
      id: "2",
      companyName: "Microsoft",
      jobTitle: "Cloud Engineer",
      imagePath: "/public/images/resume_02.png",
      resumePath: "/resumes/resume-2.pdf",
      feedback: {
        overallScore: 55,
        ATS: {
          score: 90,
          tips: [],
        },
        toneAndStyle: {
          score: 90,
          tips: [],
        },
        content: {
          score: 90,
          tips: [],
        },
        structure: {
          score: 90,
          tips: [],
        },
        skills: {
          score: 90,
          tips: [],
        },
      },
    },
    {
      id: "3",
      companyName: "Apple",
      jobTitle: "iOS Developer",
      imagePath: "public/images/resume_03.png",
      resumePath: "/resumes/resume-3.pdf",
      feedback: {
        overallScore: 75,
        ATS: {
          score: 90,
          tips: [],
        },
        toneAndStyle: {
          score: 90,
          tips: [],
        },
        content: {
          score: 90,
          tips: [],
        },
        structure: {
          score: 90,
          tips: [],
        },
        skills: {
          score: 90,
          tips: [],
        },
      },
    },
    {
        id: "4",
        companyName: "Google",
        jobTitle: "Frontend Developer",
        imagePath: "/public/images/resume_01.png",
        resumePath: "/resumes/resume-1.pdf",
        feedback: {
          overallScore: 85,
          ATS: {
            score: 90,
            tips: [],
          },
          toneAndStyle: {
            score: 90,
            tips: [],
          },
          content: {
            score: 90,
            tips: [],
          },
          structure: {
            score: 90,
            tips: [],
          },
          skills: {
            score: 90,
            tips: [],
          },
        },
      },
      {
        id: "5",
        companyName: "Microsoft",
        jobTitle: "Cloud Engineer",
        imagePath: "/public/images/resume_02.png",
        resumePath: "/resumes/resume-2.pdf",
        feedback: {
          overallScore: 55,
          ATS: {
            score: 90,
            tips: [],
          },
          toneAndStyle: {
            score: 90,
            tips: [],
          },
          content: {
            score: 90,
            tips: [],
          },
          structure: {
            score: 90,
            tips: [],
          },
          skills: {
            score: 90,
            tips: [],
          },
        },
      },
      {
        id: "6",
        companyName: "Apple",
        jobTitle: "iOS Developer",
        imagePath: "public/images/resume_03.png",
        resumePath: "/resumes/resume-3.pdf",
        feedback: {
          overallScore: 75,
          ATS: {
            score: 90,
            tips: [],
          },
          toneAndStyle: {
            score: 90,
            tips: [],
          },
          content: {
            score: 90,
            tips: [],
          },
          structure: {
            score: 90,
            tips: [],
          },
          skills: {
            score: 90,
            tips: [],
          },
        },
      },
  ];
  
  export const AIResponseFormat = `
        interface Feedback {
        overallScore: number; //max 100
        ATS: {
          score: number; //rate based on ATS suitability
          tips: {
            type: "good" | "improve";
            tip: string; //give 3-4 tips
          }[];
        };
        toneAndStyle: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        content: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        structure: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
        skills: {
          score: number; //max 100
          tips: {
            type: "good" | "improve";
            tip: string; //make it a short "title" for the actual explanation
            explanation: string; //explain in detail here
          }[]; //give 3-4 tips
        };
      }`;
  
  export const prepareInstructions = ({
    jobTitle,
    jobDescription,
    AIResponseFormat,
  }: {
    jobTitle: string;
    jobDescription: string;
    AIResponseFormat: string;
  }) =>
    `You are a professional resume reviewer and ATS (Applicant Tracking System) expert.

    Carefully read the attached resume and provide a detailed, honest evaluation.

    Guidelines:
    - Be thorough and critical. Do NOT give inflated scores — if the resume has real weaknesses, reflect that in the scores.
    - Scores should range from 0–100. A score of 80+ means truly excellent work. Most resumes score between 40–75.
    - Give 3–4 tips per category. Each tip must be specific to the actual content of the resume, not generic advice.
    - For "improve" tips, always include a concrete "explanation" of what exactly is wrong and how to fix it.
    - For "good" tips, highlight a specific strength found in the resume.

    Context:
    - Target job title: ${jobTitle || "Not specified"}
    - Job description: ${jobDescription || "Not provided"}
    ${jobDescription ? "- Use the job description to assess keyword alignment and role fit." : ""}

    Required output format (return ONLY this JSON, no markdown, no backticks, no extra text):
    ${AIResponseFormat}`;