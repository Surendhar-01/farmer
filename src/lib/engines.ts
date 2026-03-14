export type HarvestAdvice = "Green" | "Yellow" | "Red";

export interface HarvestInputs {
  currentMarketPrice: number;
  averageCropPrice: number;
  weatherForecast: "Sunny" | "Rainy" | "Cloudy" | "Stormy";
  daysGrown: number;
  growthDaysRequired: number;
}

/**
 * Harvest Advice Engine
 * Compares market price, average crop price, weather, and growth days to output Green/Yellow/Red.
 */
export const getHarvestAdvice = (inputs: HarvestInputs): HarvestAdvice => {
  const {
    currentMarketPrice,
    averageCropPrice,
    weatherForecast,
    daysGrown,
    growthDaysRequired,
  } = inputs;

  const isMature = daysGrown >= growthDaysRequired;
  const priceIsGood = currentMarketPrice > averageCropPrice;
  const badWeatherComing = weatherForecast === "Stormy" || weatherForecast === "Rainy";

  if (!isMature) {
    // If not mature but bad weather destroys crop? Simplification: wait.
    return "Red"; // Do not harvest yet
  }

  // If mature and bad weather is coming, harvest immediately to save crop
  if (isMature && badWeatherComing) {
    return "Green";
  }

  // If mature, weather is fine, but price is good
  if (isMature && priceIsGood) {
    return "Green";
  }

  // If mature, weather is fine, but price is bad, wait a bit if possible
  if (isMature && !priceIsGood) {
    // If it's way past maturity (e.g., 1.2x growth days), must harvest to prevent rotting
    if (daysGrown > growthDaysRequired * 1.2) {
      return "Green"; // Must harvest
    }
    return "Yellow"; // Wait
  }

  return "Yellow";
};


export interface TransportInputs {
  distanceKm: number;
  fuelPricePerLitre: number;
  vehicleMileageKmPerLitre: number;
  totalCropWeightKg: number;
  singleFarmerWeightKg: number;
}

/**
 * Transport Cost Engine
 * Calculates shared transport cost proportionally by weight.
 */
export const calculateTransportCost = (inputs: TransportInputs): number => {
  const {
    distanceKm,
    fuelPricePerLitre,
    vehicleMileageKmPerLitre,
    totalCropWeightKg,
    singleFarmerWeightKg,
  } = inputs;

  if (vehicleMileageKmPerLitre <= 0 || totalCropWeightKg <= 0) return 0;

  const fuelUsed = distanceKm / vehicleMileageKmPerLitre;
  const totalFuelCost = fuelUsed * fuelPricePerLitre;

  const weightProportion = singleFarmerWeightKg / totalCropWeightKg;

  return totalFuelCost * weightProportion;
};
