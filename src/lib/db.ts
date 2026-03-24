/**
 * db.ts
 * 개발 단계: JSON 파일을 간단한 DB로 사용 (public/uploads/.meta.json)
 * 추후 Postgres(Neon/Supabase)로 교체 가능한 인터페이스
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

export interface ModelRecord {
  id: string;
  name: string;
  url: string;
  size: number;
  ext: string;
  createdAt: string;
  views: number;
}

const META_PATH = path.join(process.cwd(), "public", "uploads", ".meta.json");

async function readDb(): Promise<Record<string, ModelRecord>> {
  try {
    const raw = await readFile(META_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeDb(data: Record<string, ModelRecord>): Promise<void> {
  await mkdir(path.dirname(META_PATH), { recursive: true });
  await writeFile(META_PATH, JSON.stringify(data, null, 2));
}

export async function saveModel(record: ModelRecord): Promise<void> {
  const db = await readDb();
  db[record.id] = record;
  await writeDb(db);
}

export async function getModel(id: string): Promise<ModelRecord | null> {
  const db = await readDb();
  return db[id] ?? null;
}

export async function incrementViews(id: string): Promise<void> {
  const db = await readDb();
  if (db[id]) {
    db[id].views += 1;
    await writeDb(db);
  }
}
