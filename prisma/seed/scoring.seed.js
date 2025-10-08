const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // CV Rubric
  const cvRubric = await prisma.scoringRubric.create({
    data: {
      type: "cv",
      title: "CV Evaluation",
      parameters: {
        create: [
          {
            name: "Technical Skills Match",
            description: "Alignment with backend, databases, APIs, cloud, AI/LLM",
            weight: 0.4,
            scaleDesc: "1 = Irrelevant skills, 2 = Few overlaps, 3 =  Partial match, 4 = Strong match, 5 = Excellent match + AI/LLM exposure",
          },
          {
            name: "Experience Level",
            description: "Years of experience and project complexity",
            weight: 0.25,
            scaleDesc: "1 = <1 yr / trivial projects, 2 = 1-2 yrs, 3 = 2-3 yrs with mid-scale projects, 4 = 3-4 yrs solid track record, 5 = 5+ yrs / highimpact projects",
          },
          {
            name: "Relevant Achievements",
            description: "Impact of past work, scaling, performance",
            weight: 0.2,
            scaleDesc: "1 = No clear achievements, 2 = Minimal improvements, 3 = Some measurable outcomes, 4 = Significant contributions, 5 = Major measurable impact",
          },
          {
            name: "Cultural / Collaboration Fit",
            description: "Communication, learning mindset, teamwork",
            weight: 0.15,
            scaleDesc: "1 = Not demonstrated, 2 = Minimal, 3 = Average, 4 = Good, 5 = Excellent and well-demonstrated",
          },
        ],
      },
    },
  });

  // Project Rubric
  const projectRubric = await prisma.scoringRubric.create({
    data: {
      type: "project",
      title: "Project Deliverable Evaluation",
      parameters: {
        create: [
          {
            name: "Correctness (Prompt & Chaining)",
            description: "Implements prompt design, LLM chaining, RAG",
            weight: 0.3,
            scaleDesc: "1 = Not implemented, 2 = Minimal attempt, 3 = Works partially, 4 = Works correctly, 5 = Fully correct + thoughtful",
          },
          {
            name: "Code Quality & Structure",
            description: "Clean, modular, reusable, tested",
            weight: 0.25,
            scaleDesc: "1 = Poor, 2 = Some structure, 3 = Decent modularity, 4 = Good structure + some tests, 5 = Excellent quality + strong tests",
          },
          {
            name: "Resilience & Error Handling",
            description: "Handles failures, retries, randomness",
            weight: 0.2,
            scaleDesc: "1 = Missing, 2 = Minimal, 3 = Partial handling, 4 = Solid handling, 5 = Robust, production-ready",
          },
          {
            name: "Documentation & Explanation",
            description: "README clarity, setup, trade-offs",
            weight: 0.15,
            scaleDesc: "1 = Missing, 2 = Minimal, 3 = Adequate, 4 = Clear, 5 = Excellent + insightful",
          },
          {
            name: "Creativity / Bonus",
            description: "Extra features beyond requirements",
            weight: 0.1,
            scaleDesc: "1 = None, 2 = Very basic, 3 = Useful extras, 4 = Strong enhancements, 5 = Outstanding creativity",
          },
        ],
      },
    },
  });

  console.log("✅ Seed completed:", { cvRubric, projectRubric });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
