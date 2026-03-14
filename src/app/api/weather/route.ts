import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing coordinates" }, { status: 400 });
  }

  try {
    // Open-Meteo free API
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,rain,relativehumidity_2m`);
    const data = await res.json();
    
    // Simplify for the harvest engine
    const temp = data.hourly?.temperature_2m?.[0] || 25;
    const rain = data.hourly?.rain?.[0] || 0;
    const humidity = data.hourly?.relativehumidity_2m?.[0] || 50;
    
    let forecast = "Sunny";
    if (rain > 2) forecast = "Rainy";
    if (rain > 10) forecast = "Stormy";
    if (rain === 0 && humidity > 80) forecast = "Cloudy";

    return NextResponse.json({ forecast, temp });
  } catch {
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
