import readline from 'readline';
import { HumanMessage } from '@langchain/core/messages';
import chalk from 'chalk';



// Minimal color scheme
const userPrefix = chalk.bold.blue('> You:');
const assistantPrefix = chalk.bold.green('> Assistant:');
const promptSymbol = chalk.gray('›');
const exitNotice = chalk.dim('(Type "exit" to quit)');

export async function chatInputNode(state: any) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Show last assistant response if exists
  if (state.messages?.length > 2) {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage._getType() === 'ai') {
      console.log(`\n${assistantPrefix} ${lastMessage.content}\n`);
    }
  }

  // Dynamic prompt line
  const promptLine = state.messages?.length > 2
    ? `${promptSymbol} Continue? ${exitNotice}\n${promptSymbol} `
    : `${promptSymbol} Your request ${exitNotice}\n${promptSymbol} `;

  return new Promise<{ messages: any[] }>((resolve) => {
    rl.question(promptLine, (answer) => {
      rl.close();
      
      if (answer.toLowerCase() === 'exit') {
        console.log(chalk.dim('\nSession ended\n'));
        process.exit(0);
      }

      // Echo user input cleanly
      console.log(`${userPrefix} ${answer}`);

      const newMessages = state.messages 
        ? [...state.messages, new HumanMessage(answer)]
        : [new HumanMessage(answer)];
      
      resolve({ messages: newMessages });
    });
  });
}