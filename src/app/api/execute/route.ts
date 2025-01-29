import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// 許可するコマンドのリスト
const ALLOWED_COMMANDS = [
  "ls",
  "pwd",
  "mkdir",
  "git",
  "npm",
  "yarn",
  "pnpm",
  "node",
];

// コマンドが許可されているかチェック
const isCommandAllowed = (command: string) => {
  return ALLOWED_COMMANDS.some((allowed) => command.startsWith(allowed));
};

export async function POST(req: Request) {
  try {
    const { command } = await req.json();

    if (!command) {
      return NextResponse.json(
        { error: "Command is required" },
        { status: 400 }
      );
    }

    if (!isCommandAllowed(command)) {
      return NextResponse.json(
        { error: "Command not allowed" },
        { status: 403 }
      );
    }

    const { stdout, stderr } = await execAsync(command);
    return NextResponse.json({ output: stdout || stderr });
  } catch (error) {
    console.error("Error executing command:", error);
    return NextResponse.json(
      { error: "Failed to execute command" },
      { status: 500 }
    );
  }
}
