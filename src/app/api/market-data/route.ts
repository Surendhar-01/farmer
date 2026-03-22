import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

interface MarketCsvRow {
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

interface FactoryCsvRow {
  State: string;
  "Factory Type": string;
  "Factory Name": string;
  City: string;
  "Factory ID": string;
}

interface Entry {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  products: string[];
  type: "market" | "factory";
  active: boolean;
  latestArrivalDate: string;
  averageModalPrice: number;
  phone: string;
}

interface CropMarketEntry {
  id: string;
  marketId: string;
  marketName: string;
  address: string;
  city: string;
  state: string;
  commodity: string;
  latestArrivalDate: string;
  modalPrice: number;
  arrivalQuantity: number;
}

function generatePlaceholderPhone(id: string) {
  // Create a simple hash from the id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  
  // Format as an Indian mobile number: +91 9XXXX XXXXX
  // Use hash to pick numbers, but keep it deterministic
  const randomPart = Math.abs(hash).toString().padEnd(9, "0").slice(0, 9);
  return `+91 9${randomPart.slice(0, 4)} ${randomPart.slice(4, 9)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function simulateArrivalQuantity(key: string, modalPrice: number) {
  // The dataset does not include arrival quantity, so we create a deterministic
  // mandi-style fallback signal that remains stable across requests.
  const hash = hashString(`${key}-${modalPrice}`);
  return 40 + (hash % 360);
}

function parseSimpleCsv<T>(content: string, quoted = false) {
  const [headerLine, ...lines] = content.split(/\r?\n/).filter(Boolean);
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

function parseArrivalDate(value: string) {
  const [day, month, year] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export async function GET() {
  try {
    const marketFilePath = path.join(process.cwd(), "supabase", "Price_Agriculture_commodities_Week.csv");
    const marketContent = await readFile(marketFilePath, "utf8");
    const marketRows = parseSimpleCsv<MarketCsvRow>(marketContent);

    const grouped = new Map<string, Entry & { latestDateValue: number; modalPriceCount: number }>();
    const groupedByCommodity = new Map<
      string,
      CropMarketEntry & { latestDateValue: number; modalPriceCount: number }
    >();

    for (const row of marketRows) {
      const state = row.State.trim();
      const district = row.District.trim();
      const market = row.Market.trim();
      const commodity = row.Commodity.trim();
      const arrivalDate = row.Arrival_Date.trim();
      const modalPrice = Number(row["Modal Price"]);
      const key = `${state}::${district}::${market}`;
      const commodityKey = `${key}::${commodity}`;
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
          phone: generatePlaceholderPhone(slugify(`${state}-${district}-${market}`)),
        });
      } else if (dateValue > existing.latestDateValue) {
        existing.latestDateValue = dateValue;
        existing.latestArrivalDate = arrivalDate;
        existing.products = commodity ? [commodity] : [];
        existing.averageModalPrice = Number.isFinite(modalPrice) ? modalPrice : 0;
        existing.modalPriceCount = Number.isFinite(modalPrice) ? 1 : 0;
      } else if (dateValue === existing.latestDateValue) {
        if (commodity && !existing.products.includes(commodity)) {
          existing.products.push(commodity);
        }
        if (Number.isFinite(modalPrice)) {
          existing.averageModalPrice += modalPrice;
          existing.modalPriceCount += 1;
        }
      }

      const existingCommodity = groupedByCommodity.get(commodityKey);
      if (!existingCommodity) {
        groupedByCommodity.set(commodityKey, {
          id: slugify(`${state}-${district}-${market}-${commodity}`),
          marketId: slugify(`${state}-${district}-${market}`),
          marketName: market,
          address: `${district}, ${state}`,
          city: district,
          state,
          commodity,
          latestArrivalDate: arrivalDate,
          modalPrice: Number.isFinite(modalPrice) ? modalPrice : 0,
          arrivalQuantity: simulateArrivalQuantity(commodityKey, modalPrice),
          latestDateValue: dateValue,
          modalPriceCount: Number.isFinite(modalPrice) ? 1 : 0,
        });
      } else if (dateValue > existingCommodity.latestDateValue) {
        existingCommodity.latestDateValue = dateValue;
        existingCommodity.latestArrivalDate = arrivalDate;
        existingCommodity.modalPrice = Number.isFinite(modalPrice) ? modalPrice : 0;
        existingCommodity.modalPriceCount = Number.isFinite(modalPrice) ? 1 : 0;
        existingCommodity.arrivalQuantity = simulateArrivalQuantity(commodityKey, modalPrice);
      } else if (dateValue === existingCommodity.latestDateValue && Number.isFinite(modalPrice)) {
        existingCommodity.modalPrice += modalPrice;
        existingCommodity.modalPriceCount += 1;
      }
    }

    const markets: Entry[] = Array.from(grouped.values())
      .map((market) => {
        const { latestDateValue, modalPriceCount, ...entry } = market;
        void latestDateValue;

        return {
          ...entry,
          products: entry.products.sort((left, right) => left.localeCompare(right)).slice(0, 8),
          averageModalPrice:
            modalPriceCount > 0 ? Math.round(entry.averageModalPrice / modalPriceCount) : 0,
        };
      })
      .sort((left, right) =>
        `${left.state}-${left.city}-${left.name}`.localeCompare(`${right.state}-${right.city}-${right.name}`)
      );

    const factoryFilePath = path.join(
      process.cwd(),
      "supabase",
      "agricultural_factories_india_2025_2026 (1).csv"
    );
    const factoryContent = await readFile(factoryFilePath, "utf8");
    const factoryRows = parseSimpleCsv<FactoryCsvRow>(factoryContent, true);

    const factories: Entry[] = factoryRows.map((row) => ({
      id: row["Factory ID"].trim() || slugify(`${row.State}-${row.City}-${row["Factory Name"]}`),
      name: row["Factory Name"].trim(),
      address: `${row.City.trim()}, ${row.State.trim()}`,
      city: row.City.trim(),
      state: row.State.trim(),
      products: [row["Factory Type"].trim()],
      type: "factory",
      active: true,
      latestArrivalDate: "",
      averageModalPrice: 0,
      phone: generatePlaceholderPhone(
        row["Factory ID"].trim() || slugify(`${row.State}-${row.City}-${row["Factory Name"]}`)
      ),
    }));

    const entries = [...markets, ...factories].sort((left, right) =>
      `${left.state}-${left.city}-${left.name}`.localeCompare(`${right.state}-${right.city}-${right.name}`)
    );

    const locations = Array.from(
      new Set(
        entries.flatMap((entry) => [
          entry.name,
          entry.city,
          entry.state,
          `${entry.city}, ${entry.state}`,
        ])
      )
    ).sort((left, right) => left.localeCompare(right));

    const cropOptions = Array.from(new Set(entries.flatMap((entry) => entry.products))).sort((left, right) =>
      left.localeCompare(right)
    );

    const commodityEntries: CropMarketEntry[] = Array.from(groupedByCommodity.values())
      .map((market) => {
        const { latestDateValue, modalPriceCount, ...entry } = market;
        void latestDateValue;

        return {
          ...entry,
          modalPrice: modalPriceCount > 0 ? Math.round(entry.modalPrice / modalPriceCount) : 0,
        };
      })
      .sort((left, right) =>
        `${left.commodity}-${left.state}-${left.city}-${left.marketName}`.localeCompare(
          `${right.commodity}-${right.state}-${right.city}-${right.marketName}`
        )
      );

    return NextResponse.json({ entries, locations, cropOptions, commodityEntries });
  } catch {
    return NextResponse.json({ error: "Failed to load market and factory dataset" }, { status: 500 });
  }
}
