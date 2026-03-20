import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

interface StorageEntry {
  id: string;
  name: string;
  address: string;
  district: string;
  capacity: string;
  item: string;
  sector: string;
}

function stripTags(value: string) {
  return value.replace(/<[^>]*>/g, " ");
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function cleanCell(value: string) {
  return decodeHtml(stripTags(value));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "supabase",
      "Agricultural Marketing __ LIST OF COLD STORAGE UNITS IN TAMILNADU (1).mht"
    );
    const raw = await readFile(filePath, "utf8");
    const htmlStart = raw.indexOf("<!DOCTYPE html");
    const html = htmlStart >= 0 ? raw.slice(htmlStart) : raw;

    const rows = Array.from(html.matchAll(/<tr>([\s\S]*?)<\/tr>/gi), (match) => match[1]);
    const storages: StorageEntry[] = rows
      .map((row) =>
        Array.from(row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi), (match) => cleanCell(match[1]))
      )
      .filter((cells) => cells.length === 6 && /^\d+$/.test(cells[0] ?? ""))
      .map((cells) => ({
        id: slugify(`${cells[0]}-${cells[1]}`),
        name: cells[1].split(",")[0]?.trim() || cells[1],
        address: cells[1],
        district: cells[2],
        capacity: `${cells[3]} MT`,
        item: cells[4],
        sector: cells[5],
      }));

    return NextResponse.json({ storages });
  } catch {
    return NextResponse.json({ error: "Failed to load cold storage data" }, { status: 500 });
  }
}
