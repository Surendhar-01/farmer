import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

interface CsvRow {
  State: string;
  District: string;
  Market: string;
  Commodity: string;
  Variety: string;
  Grade: string;
  Arrival_Date: string;
  "Min Price": string;
  "Max Price": string;
  "Modal Price": string;
}

interface MarketEntry {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  products: string[];
  type: "market";
  active: boolean;
  latestArrivalDate: string;
  averageModalPrice: number;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsv(content: string) {
  const [headerLine, ...lines] = content.split(/\r?\n/).filter(Boolean);
  const headers = headerLine.split(",") as Array<keyof CsvRow>;

  return lines.map((line) => {
    const values = line.split(",");
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? "";
      return row;
    }, {} as Record<keyof CsvRow, string>);
  });
}

function parseArrivalDate(value: string) {
  const [day, month, year] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "supabase", "Price_Agriculture_commodities_Week.csv");
    const content = await readFile(filePath, "utf8");
    const rows = parseCsv(content);

    const grouped = new Map<string, MarketEntry & { latestDateValue: number; modalPriceCount: number }>();

    for (const row of rows) {
      const state = row.State.trim();
      const district = row.District.trim();
      const market = row.Market.trim();
      const commodity = row.Commodity.trim();
      const arrivalDate = row.Arrival_Date.trim();
      const modalPrice = Number(row["Modal Price"]);
      const key = `${state}::${district}::${market}`;
      const dateValue = parseArrivalDate(arrivalDate).getTime();

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          id: slugify(`${state}-${district}-${market}`),
          name: market,
          address: `${district}, ${state}`,
          city: district,
          state,
          products: commodity ? [commodity] : [],
          type: "market",
          active: true,
          latestArrivalDate: arrivalDate,
          averageModalPrice: Number.isFinite(modalPrice) ? modalPrice : 0,
          latestDateValue: dateValue,
          modalPriceCount: Number.isFinite(modalPrice) ? 1 : 0,
        });
        continue;
      }

      if (dateValue > existing.latestDateValue) {
        existing.latestDateValue = dateValue;
        existing.latestArrivalDate = arrivalDate;
        existing.products = commodity ? [commodity] : [];
        existing.averageModalPrice = Number.isFinite(modalPrice) ? modalPrice : 0;
        existing.modalPriceCount = Number.isFinite(modalPrice) ? 1 : 0;
        continue;
      }

      if (dateValue === existing.latestDateValue) {
        if (commodity && !existing.products.includes(commodity)) {
          existing.products.push(commodity);
        }
        if (Number.isFinite(modalPrice)) {
          existing.averageModalPrice += modalPrice;
          existing.modalPriceCount += 1;
        }
      }
    }

    const markets = Array.from(grouped.values())
      .map(({ latestDateValue: _latestDateValue, modalPriceCount, ...entry }) => ({
        ...entry,
        products: entry.products.sort((left, right) => left.localeCompare(right)).slice(0, 8),
        averageModalPrice:
          modalPriceCount > 0 ? Math.round(entry.averageModalPrice / modalPriceCount) : 0,
      }))
      .sort((left, right) =>
        `${left.state}-${left.city}-${left.name}`.localeCompare(`${right.state}-${right.city}-${right.name}`)
      );

    const locations = Array.from(
      new Set(
        markets.flatMap((market) => [
          market.name,
          market.city,
          market.state,
          `${market.city}, ${market.state}`,
        ])
      )
    ).sort((left, right) => left.localeCompare(right));

    const cropOptions = Array.from(new Set(markets.flatMap((market) => market.products))).sort((left, right) =>
      left.localeCompare(right)
    );

    return NextResponse.json({ markets, locations, cropOptions });
  } catch {
    return NextResponse.json({ error: "Failed to load market dataset" }, { status: 500 });
  }
}
