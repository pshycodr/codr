import blessed from 'blessed';
// import { sendChatMessageToRag } from '../../transport/zeromqClient';
import type { ChatSessionManager } from "@transport/chatSessionManager";

export async function startChatUI(session_id: string, query: string, firstMessage: string, chatManager: ChatSessionManager) {
  const screen = blessed.screen({
    smartCSR: true,
    title: 'Codr Terminal Chat',
    fullUnicode: true,
    mouse: true,
    keys: true,
  });

  const chatBox = blessed.box({
    top: 0,
    left: 0,
    width: '100%',
    height: '85%',
    label: ' Chat ',
    border: { type: 'line' },
    style: {
      border: { fg: 'cyan' },
      label: { fg: 'white', bold: true },
    },
    scrollable: true,
    alwaysScroll: true,
    mouse: true,
    keys: true,
    vi: true,
    scrollbar: {
      ch: ' ',
      style: { bg: 'blue' },
    },
    tags: true,
  });

  const input = blessed.textbox({
    bottom: 0,
    height: '15%',
    width: '100%',
    label: ' You ',
    border: { type: 'line' },
    style: {
      fg: 'white',
      bg: 'black',
      border: { fg: 'green' },
      label: { fg: 'white', bold: true },
    },
    inputOnFocus: true,
    padding: { left: 1 },
  });

  screen.append(chatBox);
  screen.append(input);
  input.focus();

  const messages: string[] = [];
  const append = (msg: string) => {
    messages.push(msg);
    chatBox.setContent(messages.join('\n\n'));
    chatBox.setScrollPerc(100);
    screen.render();
  };

  append(`{bold}{green-fg}You:{/green-fg}{/bold} ${query}`);
  append(`{bold}{cyan-fg}Assistant:{/cyan-fg}{/bold} ${firstMessage}`);

  input.on('submit', async (message) => {
    if (message.trim()) {
      append(`{bold}{green-fg}You:{/green-fg}{/bold} ${message}`);
      input.clearValue();
      input.focus();
      screen.render();

      let loadingDots = '';
      const loadingMsg = `{bold}{cyan-fg}Assistant:{/cyan-fg}{/bold} Thinking`;
      let loadingIndex = messages.length;
      messages.push(loadingMsg);
      chatBox.setContent(messages.join('\n\n'));
      chatBox.setScrollPerc(100);
      screen.render();

      const interval = setInterval(() => {
        loadingDots += '.';
        if (loadingDots.length > 3) loadingDots = '';
        messages[loadingIndex] = `{bold}{cyan-fg}Assistant:{/cyan-fg}{/bold} Thinking${loadingDots}`;
        chatBox.setContent(messages.join('\n\n'));
        chatBox.setScrollPerc(100);
        screen.render();
      }, 300);

      const result = await chatManager.sendMessage(message );
      clearInterval(interval);

      messages[loadingIndex] = `{bold}{cyan-fg}Assistant:{/cyan-fg}{/bold} ${result}`;
      chatBox.setContent(messages.join('\n\n'));
      chatBox.setScrollPerc(100);
      screen.render();
    }
  });

  screen.key(['up'], () => {
    chatBox.scroll(-1);
    screen.render();
  });

  screen.key(['down'], () => {
    chatBox.scroll(1);
    screen.render();
  });

  screen.key(['pageup'], () => {
    chatBox.scroll(-10);
    screen.render();
  });

  screen.key(['pagedown'], () => {
    chatBox.scroll(10);
    screen.render();
  });

  screen.key(['C-c', 'escape', 'q'], () => {
    screen.destroy();
    process.exit(0);
  });

  screen.render();
}
