import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import chalk from "chalk";
import { fileTools } from "@core/agents/fileAgent/fileTools";
import { codeTools } from "@core/agents/codeAgent/CodeTools";
import { tools } from "../tools";

// Collect and assert non-empty tool list
const allTools = [
  ...fileTools.map(t => t.name),
  ...codeTools.map(t => t.name),
  // ...tools.filter(t => t.name !== "execution_goal_planner").map(t => t.name),
] as [string, ...string[]];

// //  Actions allowed
// const allowedActions = [
//   "runCommand",
//   "writeFile",
//   "createFile",
//   "installPackage",
//   "generateComponent"
// ] as const;

//  Define schema based on prompt structure
const planSchema = z.array(
  z.object({
    step: z.string(),
    tools: z.enum(allTools),
    instructions: z.string().describe("Clear instruction in string of what to do")
  })
);

// ✅ Output parser
const parser = StructuredOutputParser.fromZodSchema(planSchema);
const instructions = parser.getFormatInstructions().replace(/}/g, "}}").replace(/{/g, "{{");

// ✅ Prompt template
const prompt = PromptTemplate.fromTemplate(`
You are an expert AI software architect and project planner.

"For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\nBy default, use JSX/TSX syntax with Tailwind CSS classes, React hooks, Toast Messages, Notifications, UI components Libraries (Shadcn, Retro Ui etc.) and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n\n

For all backend systems I ask you to build, make them production-ready, scalable, and modular. Do not write toy examples or incomplete logic—implement full, working features with realistic data models and flows.
By default, use TypeScript (Node.js) with Bun, or Python (FastAPI) depending on the stack I specify. Structure the backend with clean folder architecture, middleware support, and environment-based configuration (.env files). Use appropriate database models (Prisma for SQL, Mongoose for MongoDB) with realistic schema design.
Include:
Auth (JWT/session-based) when required
Validation (Zod / Pydantic) for all inputs
Logging (pino / logging module) for observability
API documentation using Swagger/OpenAPI where applicable
Error handling middleware
CORS, rate limiting, and basic security best practices
By default, write the backend as an API-first service, suitable for real-world frontend integration. Structure routes/controllers/services/DB's in modular fashion.
Do not install unnecessary packages or frameworks unless required or explicitly requested."
Your job is to take a high-level goal from the user and break it down into clear, concrete development steps.

🧰 File Agent Tools:
${fileTools.map(ft => `- ${ft.name}: ${ft.description}`).join("\n")}

🧠 Code Agent Tools:
${codeTools.map(ct => `- ${ct.name}: ${ct.description}`).join("\n")}

Each step should:
- Be actionable (CLI or code agent can do it)
- Be logically ordered (e.g., install deps before using them)
- Be deterministic (no vague phrases like "do the setup")

Only return a JSON array of steps. Each step must include:
- \`step\`: human-readable description
- \`tools\`: one of the given tools
- \`instructions\`: Clear instruction of what to do with the tool. Do not give code, instead give detailed instructions.

No explanation. No markdown. Output ONLY valid JSON.

User Goal: {goal}

Your response must follow this format:
${instructions}
`);

export default async function goalPlanner({ goal }: { goal: string }) {
  console.log(chalk.bgYellow.black("goalPlanner Called:"), goal);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.3,
    apiKey: process.env.GEMINI_API_KEY,
    json : true
  });

  const chain = prompt.pipe(model).pipe(parser);

  try {
    const result = await chain.invoke({ goal });
    console.log(chalk.bgBlue.black("Execution plan:"), result);
    return JSON.stringify(result);
  } catch (err) {
    console.error("❌ Failed to generate plan:", err);
    return null;
  }
}


type PlanStep = {
    step: string;
    action: "runCommand" | "writeFile" | "createFile" | "installPackage" | "generateComponent";
    args: Record<string, any>;
};

function summarizePlanSteps(plan: PlanStep[]): string {
    const lines: string[] = [];

    for (const [i, step] of plan.entries()) {
        const { action, args } = step;
        const num = i + 1;

        let desc = `${num}. ${step.step}`;

        switch (action) {
            case "runCommand":
                desc += `\n   ↳ Run: \`${args.command}\``;
                break;

            case "installPackage":
                desc += `\n   ↳ Install: \`${args.packages.join(" ")}\``;
                break;

            case "writeFile":
                desc += `\n   ↳ Write file: \`${args.path}\``;
                break;

            case "createFile":
                desc += `\n   ↳ Create file: \`${args.path}\``;
                break;

            case "generateComponent":
                desc += `\n   ↳ Generate component: \`${args.name || "Unnamed"}\``;
                break;

            default:
                desc += `\n   ↳ (Unknown action)`;
        }

        lines.push(desc);
    }

    return lines.join("\n");
}
