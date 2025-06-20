const creationVerbs = [
  "make", "create", "build", "develop", "generate",
  "construct", "craft", "design", "produce", "init",
  "start", "launch", "set up", "spin up"
];

function toPascalCase(str: string): string {
  return str
    .replace(/(\w)(\w*)/g, (_, first, rest) => first.toUpperCase() + rest.toLowerCase())
    .replace(/\s+/g, '');
}

type Intent =
  | { type: "create_app"; name: string; raw: string }
  | { type: "unknown"; raw: string };

export function parseIntent(prompt: string): Intent {
  const lowerPrompt = prompt.toLowerCase();
  const matchedVerb = creationVerbs.find(verb => lowerPrompt.includes(verb));

  if (matchedVerb) {
    const match = lowerPrompt.match(
      new RegExp(`\\b(?:${creationVerbs.join("|")})\\b\\s+(a|an|my|the)?\\s*([a-z\\s]+?)(\\s+app|\\s+application)?[\\s\\.,;!?]?`, 'i')
    );

    if (match) {
      const rawAppName = match[2]?.trim();
      if (!rawAppName) return { type: "unknown", raw: prompt };

      const appName = toPascalCase(`${rawAppName} app`);
      return {
        type: "create_app",
        name: appName,
        raw: prompt
      };
    }
  }

  return { type: "unknown", raw: prompt };
}
