import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const { code } = await req.json();

    // 一時ファイルを作成
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "python-"));
    const scriptPath = path.join(tmpDir, "script.py");
    await fs.writeFile(scriptPath, code);

    // Pythonスクリプトを実行
    const { stdout, stderr } = await execAsync(`python3 "${scriptPath}"`);
    
    // 一時ファイルを削除
    await fs.rm(tmpDir, { recursive: true });

    if (stderr) {
      return NextResponse.json(
        { error: stderr },
        { status: 500 }
      );
    }

    return NextResponse.json({ output: stdout });
  } catch (error) {
    console.error("Error executing Python code:", error);
    return NextResponse.json(
      { error: "Failed to execute Python code" },
      { status: 500 }
    );
  }
}
