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
  phone: string;
}

interface FactoryCsvRow {
  State: string;
  "Factory Type": string;
  "Factory Name": string;
  City: string;
  "Factory ID": string;
}

function parseSimpleCsv<T>(content: string, quoted = false) {
  const [headerLine, ...lines] = content.split(/\r?\n/).filter(Boolean);
  if (!headerLine) return [];
  
  const headers = (quoted
    ? headerLine.split(/","/).map((header) => header.replace(/^"|"$/g, ""))
    : headerLine.split(",")) as Array<keyof T>;

  return lines.map((line) => {
    const values = quoted
      ? line.split(/","/).map((value) => value.replace(/^"|"$/g, ""))
      : line.split(",");

    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {} as Record<keyof T, string>);
  });
}

function generatePlaceholderPhone(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const randomPart = Math.abs(hash).toString().padEnd(9, "0").slice(0, 9);
  return `+91 9${randomPart.slice(0, 4)} ${randomPart.slice(4, 9)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const factoryFilePath = path.join(
      process.cwd(),
      "supabase",
      "agricultural_factories_india_2025_2026 (1).csv"
    );
    const raw = await readFile(factoryFilePath, "utf8");
    const rows = parseSimpleCsv<FactoryCsvRow>(raw, true);

    const storages: StorageEntry[] = rows
      .filter((row) => row["Factory Type"] === "Cold Storage")
      .map((row) => {
        const id = row["Factory ID"] || slugify(`${row.State}-${row.City}-${row["Factory Name"]}`);
        return {
          id,
          name: row["Factory Name"],
          address: `${row.City}, ${row.State}`,
          district: row.City,
          capacity: "5000 MT", // Placeholder as not in CSV
          item: "General Produce", // Placeholder as not in CSV
          sector: "Cold Storage",
          phone: generatePlaceholderPhone(id),
        };
      });

    return NextResponse.json({ storages });
  } catch (error) {
    console.error("Error loading cold storage data:", error);
    return NextResponse.json({ error: "Failed to load cold storage data" }, { status: 500 });
  }
}
