import { z } from "zod";
import { StructuredOutputParser } from "langchain/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import chalk from "chalk";

const planSchema = z.array(
  z.object({
    step: z.string(),
    action: z.enum([
      "runCommand",
      "writeFile",
      "createFile",
      "installPackage",
      "generateComponent",
    ]),
    args: z.record(z.any()),
  })
);

const parser = StructuredOutputParser.fromZodSchema(planSchema);

const instructions = parser.getFormatInstructions().replace(/}/g, "}}").replace(/{/g, "{{");

const prompt = PromptTemplate.fromTemplate(`
You are an expert AI software architect and project planner.

Your job is to take a high-level goal from the user and break it down into clear, concrete development steps.

Each step should be:
- Actionable (can be executed by a CLI or code agent)
- Ordered logically (e.g. install dependencies before generating files)
- Complete and deterministic (no vague suggestions like "set up stuff")

You must only return a valid JSON array of objects where each object has:
- 'step': a human-readable summary
- 'action': one of ["runCommand", "writeFile", "createFile", "installPackage", "generateComponent"]
- 'args': key-value pairs required to complete the step

Only output the JSON. No explanation, no markdown.
ALWAYS make sure you are providing UPDATED INFORMATIONS

Goal: {goal}

Return a step-by-step JSON plan using this format:

${instructions}
`);

export default async function goalPlanner({goal}:{goal: string}) {
    console.log(chalk.bgYellow.black("goalPlanner Called: "), goal);

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    temperature: 0.3,
    apiKey: process.env.GEMINI_API_KEY  
  });

  const chain = prompt.pipe(model).pipe(parser);

  try {
    const result = await chain.invoke({ goal });
    // const plan = summarizePlanSteps(result)
    console.log(chalk.bgBlue.black("Execution plan: "), result);

    return JSON.stringify(result)
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
