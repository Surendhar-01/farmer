import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

interface CropEntry {
  name_en: string;
  season: string;
  average_price: number;
  growth_days: number;
}

interface TransportEntry {
  driver_name: string;
  vehicle_type: string;
  capacity: number;
  route: string;
  available_date: string;
  price_per_km: number;
}

function splitTuples(valuesBlock: string) {
  return valuesBlock
    .trim()
    .replace(/;$/, "")
    .split(/\),\s*\(/)
    .map((tuple) => tuple.replace(/^\(/, "").replace(/\)$/, "").trim());
}

function parseTuple(tuple: string) {
  const values: string[] = [];
  let current = "";
  let inString = false;

  for (let index = 0; index < tuple.length; index += 1) {
    const char = tuple[index];
    const nextChar = tuple[index + 1];

    if (char === "'" && nextChar === "'") {
      current += "'";
      index += 1;
      continue;
    }

    if (char === "'") {
      inString = !inString;
      continue;
    }

    if (char === "," && !inString) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current) {
    values.push(current.trim());
  }

  return values;
}

function extractInsertRows(sql: string, tableName: "crops" | "transport") {
  const regex = new RegExp(
    `INSERT INTO public\\.${tableName} \\([^)]*\\) VALUES\\s*([\\s\\S]*?);`,
    "i"
  );
  const match = sql.match(regex);
  if (!match?.[1]) {
    return [];
  }

  return splitTuples(match[1]).map(parseTuple);
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "supabase", "schema.sql");
    const sql = await readFile(filePath, "utf8");

    const crops: CropEntry[] = extractInsertRows(sql, "crops").map((values) => ({
      name_en: values[0] ?? "",
      season: values[1] ?? "",
      average_price: Number(values[2] ?? 0),
      growth_days: Number(values[3] ?? 0),
    }));

    const transport: TransportEntry[] = extractInsertRows(sql, "transport").map((values) => ({
      driver_name: values[0] ?? "",
      vehicle_type: values[1] ?? "",
      capacity: Number(values[2] ?? 0),
      route: values[3] ?? "",
      available_date: values[4]?.toUpperCase().includes("CURRENT_DATE")
        ? values[4]
        : values[4] ?? "",
      price_per_km: Number(values[5] ?? 0),
    }));

    return NextResponse.json({ crops, transport });
  } catch {
    return NextResponse.json({ error: "Failed to load schema data" }, { status: 500 });
  }
}
