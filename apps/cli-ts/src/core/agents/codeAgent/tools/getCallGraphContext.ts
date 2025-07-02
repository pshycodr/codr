import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

interface CallGraphNode {
  functionName: string;
  filePath: string;
  calls: string[];
  calledBy: string[];
}

interface CallGraphContext {
  node: CallGraphNode;
  callers: CallGraphNode[];
  callees: CallGraphNode[];
}

export function getCallGraphContext({fnName}:{fnName: string}): CallGraphContext | null {

  console.log(chalk.bgYellow.black("codeAgent/getCallGraphContext Called"), fnName)


  const callgraphPath = path.resolve('.metadata/callgraph.json');

  if (!fs.existsSync(callgraphPath)) {
    console.log(chalk.red("❌ callgraph.json not found in .metadata."));
    return null;
  }

  const raw = fs.readFileSync(callgraphPath, 'utf-8');
  const parsed: CallGraphNode[] = JSON.parse(raw);

  const targetNode = parsed.find(n => n.functionName === fnName);

  if (!targetNode) {
    console.log(chalk.yellow(`⚠️ Function '${fnName}' not found in call graph.`));
    return null;
  }

  const callees = parsed.filter(n => targetNode.calls.includes(`${n.filePath}::${n.functionName}`));
  const callers = parsed.filter(n => targetNode.calledBy.includes(`${n.filePath}::${n.functionName}`));

  return {
    node: targetNode,
    callers,
    callees,
  };
}

// Example usage:
// const result = getCallGraphContext("parseCodebase");
// console.dir(result, { depth: null });