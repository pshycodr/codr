
![CODR](public/images/CODR.png)

---

# Codr CLI — AI Developer Assistant

Codr is a terminal-native AI tool built for developers. It helps you write, refactor, and understand code, analyze documents, explore websites, and interact with your codebase — all from the command line.

Everything runs through a single AI agent, with modular tools that handle code, documents, webpages, and more.

---

## Features

- Answer code questions, debug, and refactor
- Summarize and chat with PDFs, DOCX, and Markdown files
- Analyze webpages or local HTML
- Ask questions about your JS, TS, or Python codebase
- Generate full-stack projects from a single prompt
- Initialize Codr into an existing project for context-aware assistance
- Fully automated setup via the [`codrup`](https://www.npmjs.com/package/codrup) installer

---

## 🛠️ Installation Options

### Option 1: Recommended (via Installer CLI)

Set up everything in seconds with the installer:

```bash
npm install -g codrup
codrup --setup
```

This automates the full workflow:

* Checks for required tools (`git`, `bun`, `uv`, `python3`)
* Clones the Codr repo
* Installs Node and Python dependencies
* Prompts you to configure LLM + API keys
* Links the CLI globally so you can run `codr` anywhere

> To update later, use: `codrup --update`
> To reconfigure LLM/API keys: `codrup --config`

---

### Option 2: Manual GitHub Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/pshycodr/codr
cd codr

# CLI dependencies
bun install

# Python RAG server setup
uv venv .venv
uv pip install -r requirements.txt
```

Run Codr:

```bash
bun codr
```

---

## Usage

```bash
codr <prompt...>                  Chat with Codr for small quick tasks
codr create <goal>                Create a full-stack project (backend → frontend)
codr init                         Initialize Codr in an existing project
codr doc -p <path> -q <query>     Query local documents (PDF, DOCX, MD)
codr webpage -p <path> -q <query> Analyze a local webpage or HTML file
codr codebase -p <path> -q <query> Ask questions about your codebase
```

### Common Flags

* `-p <path>`: Path to a file or folder
* `-q <query>`: Your question or prompt
* `--chat`: Enables persistent chat mode
* `-h, --help`: Show help
* `-V, --version`: Show version

---

## 💡 Examples

```bash
codr "What does this TypeScript error mean?"
codr create "Build a blogging platform with MongoDB and dark mode UI"
codr init
codr doc -p resume.pdf -q "Summarize my experience"
codr webpage -p "https://example.com/" -q "Extract key stats from this page"
codr codebase -p ./my-app -q "How is user authentication handled?"
```

---

## Project Structure

```
/apps
  /cli-ts       → TypeScript CLI interface
  /codebase     → Language-agnostic code parsing (TS/JS/Python)
  /rag-py       → Python RAG server (documents, codebase, webpages)

package.json     → Bun project setup
requirements.txt → Python dependencies
public/          → Assets (e.g., logo)
```

---

## 📌 Notes

* Codr uses a single AI agent with task-specific tools under the hood
* Works fully offline after initial setup (excluding LLM calls)
* Environment config is handled via `.env` in `apps/cli-ts`
* Modular and easy to extend

---

## 📄 License

Codr is licensed under the [Apache License 2.0](LICENSE).

You are free to use, modify, and distribute it, but you must retain the license and give proper credit.

---

