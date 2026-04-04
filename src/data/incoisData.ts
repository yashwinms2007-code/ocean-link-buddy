export interface INCOISDataRecord {
  coast: string;
  direction: string;
  bearing: number;
  distanceKm: string; // "81-86"
  depthMtr: string; // "100-105"
  latDMS: string; // "14 10 27"
  lngDMS: string; // "73 42 39"
  lat: number;   // Calculated DD
  lng: number;   // Calculated DD
}

// Helper to convert DD MM SS to Decimal Degrees
function dmsToDd(dms: string, isLat: boolean): number {
  const parts = dms.trim().split(" ");
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const s = parseInt(parts[2], 10);
  return d + (m / 60) + (s / 3600);
}

// Data exactly matching user spreadsheet
const rawData = [
  { coast: "Belekeri", dir: "SW", bearing: 225, dist: "81-86", depth: "100-105", lat: "14 10 27", lng: "73 42 39" },
  { coast: "Gangavali", dir: "SW", bearing: 228, dist: "74-79", depth: "55-60", lat: "14 7 34", lng: "73 45 54" },
  { coast: "Tadri", dir: "SW", bearing: 229, dist: "73-78", depth: "64-69", lat: "14 4 5", lng: "73 48 37" },
  { coast: "Kumta Pt", dir: "SW", bearing: 215, dist: "51-56", depth: "51-56", lat: "14 1 36", lng: "74 5 25" },
  { coast: "Dhareshwar", dir: "SW", bearing: 218, dist: "52-57", depth: "50-55", lat: "13 59 13", lng: "74 5 50" },
  { coast: "Karki", dir: "SW", bearing: 219, dist: "49-54", depth: "49-54", lat: "13 57 3", lng: "74 6 53" },
  { coast: "Honavar", dir: "SW", bearing: 219, dist: "48-53", depth: "47-52", lat: "13 55 11", lng: "74 8 25" },
  { coast: "Kasarkod", dir: "SW", bearing: 216, dist: "46-51", depth: "46-51", lat: "13 53 38", lng: "74 10 16" },
  { coast: "Navayatkere", dir: "SW", bearing: 219, dist: "45-50", depth: "40-45", lat: "13 51 38", lng: "74 11 35" },
  { coast: "Mavalli", dir: "SW", bearing: 224, dist: "38-43", depth: "39-44", lat: "13 50 33", lng: "74 13 32" },
  { coast: "Shirali", dir: "SW", bearing: 229, dist: "35-40", depth: "42-47", lat: "13 48 47", lng: "74 15 5" },
  { coast: "Bhatkal", dir: "SW", bearing: 232, dist: "34-39", depth: "42-47", lat: "13 46 32", lng: "74 15 59" },
  { coast: "Baindur", dir: "SW", bearing: 247, dist: "36-41", depth: "38-43", lat: "13 44 17", lng: "74 16 51" },
  { coast: "Navunda", dir: "SW", bearing: 261, dist: "36-41", depth: "37-42", lat: "13 41 53", lng: "74 17 13" },
  { coast: "Gangoli", dir: "SW", bearing: 245, dist: "43-48", depth: "45-50", lat: "13 29 15", lng: "74 16 47" },
  { coast: "Kundapoor", dir: "SW", bearing: 244, dist: "43-48", depth: "42-47", lat: "13 26 35", lng: "74 17 39" },
  { coast: "Kota", dir: "SW", bearing: 253, dist: "39-44", depth: "35-40", lat: "13 24 14", lng: "74 19 8" },
  { coast: "Hangarkatta", dir: "SW", bearing: 259, dist: "37-42", depth: "39-44", lat: "13 22 22", lng: "74 21 13" },
  { coast: "Kapu", dir: "NW", bearing: 299, dist: "29-34", depth: "31-36", lat: "13 21 22", lng: "74 29 12" },
  { coast: "Udiyavara", dir: "NW", bearing: 280, dist: "29-34", depth: "36-41", lat: "13 21 5", lng: "74 26 26" },
  { coast: "Malpe", dir: "NW", bearing: 272, dist: "29-34", depth: "35-40", lat: "13 21 4", lng: "74 23 41" }
];

export const INCOIS_DATA: INCOISDataRecord[] = rawData.map(row => ({
  coast: row.coast,
  direction: row.dir,
  bearing: row.bearing,
  distanceKm: row.dist,
  depthMtr: row.depth,
  latDMS: row.lat + " N",
  lngDMS: row.lng + " E",
  lat: parseFloat(dmsToDd(row.lat, true).toFixed(6)),
  lng: parseFloat(dmsToDd(row.lng, false).toFixed(6))
}));
