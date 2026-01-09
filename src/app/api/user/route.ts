import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data", "users");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getUserPath(name: string) {
  const safe = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  ensureDir();
  const filePath = getUserPath(name);

  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  }

  // New user
  const userData = { name, progress: {} };
  fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));
  return NextResponse.json(userData);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, date, dayProgress } = body;

  if (!name || !date) {
    return NextResponse.json({ error: "Name and date required" }, { status: 400 });
  }

  ensureDir();
  const filePath = getUserPath(name);

  let userData = { name, progress: {} as Record<string, unknown> };
  if (fs.existsSync(filePath)) {
    userData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }

  userData.progress[date] = dayProgress;
  fs.writeFileSync(filePath, JSON.stringify(userData, null, 2));

  return NextResponse.json({ ok: true });
}
