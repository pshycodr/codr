import { parseCodebase } from ".";

async function main() {
  const parsedCodebase = await parseCodebase("a:/Projects/Ai-code-writer/apps/cli-ts/");
  console.log(JSON.stringify(parsedCodebase, null, 2));
  // console.log(parsedCodebase.length);
}

main();