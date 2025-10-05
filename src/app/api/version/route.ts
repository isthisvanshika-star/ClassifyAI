import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Get Next.js version from package.json
    const packageJsonPath = path.join(process.cwd(), "package.json");
    const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    const nextVersion = packageData.dependencies?.next || "Unknown";

    // Get Tauri version from tauri.conf.json
  const tauriConfigPath = path.join(process.cwd(), "src-tauri", "tauri.conf.json");
    let tauriVersion = "Unknown";

    if (fs.existsSync(tauriConfigPath)) {
      const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));
      tauriVersion = tauriConfig.version || tauriConfig.package?.version || "Unknown";
    }


    return NextResponse.json({
      appName: "ClassifyAI",
      nextVersion,
      tauriVersion,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch version info", details: error.message },
      { status: 500 }
    );
  }
}
