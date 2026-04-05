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
  { coast: "Majali", dir: "SW", bearing: 247, dist: "7-12", depth: "13-18", lat: "14 51 39", lng: "74 1 27" },
  { coast: "Sadasguvgarg", dir: "SW", bearing: 263, dist: "11-16", depth: "18-23", lat: "14 49 59", lng: "74 0 19" },
  { coast: "Karwar", dir: "SW", bearing: 258, dist: "6-11", depth: "21-26", lat: "14 48 20", lng: "73 59 8" },
  { coast: "Belekeri", dir: "NW", bearing: 283, dist: "29-34", depth: "24-29", lat: "14 46 16", lng: "73 59 2" },
  { coast: "Gangavali", dir: "NW", bearing: 299, dist: "34-39", depth: "24-29", lat: "14 44 50", lng: "74 0 31" },
  { coast: "Tadri", dir: "NW", bearing: 309, dist: "11-16", depth: "7-12", lat: "14 35 25", lng: "74 14 37" },
  { coast: "Kumta Pt", dir: "NW", bearing: 319, dist: "18-23", depth: "8-13", lat: "14 33 48", lng: "74 15 15" },
  { coast: "Dhareshvar", dir: "NW", bearing: 315, dist: "23-28", depth: "12-17", lat: "14 32 10", lng: "74 14 39" },
  { coast: "Karki", dir: "NW", bearing: 319, dist: "26-31", depth: "18-23", lat: "14 30 26", lng: "74 14 25" },
  { coast: "Honavar", dir: "NW", bearing: 318, dist: "28-33", depth: "19-24", lat: "14 28 45", lng: "74 14 56" },
  { coast: "Kasarkod", dir: "SW", bearing: 182, dist: "31-36", depth: "19-24", lat: "13 56 31", lng: "74 25 37" },
  { coast: "Navayatkere", dir: "SE", bearing: 179, dist: "29-34", depth: "17-22", lat: "13 54 27", lng: "74 28 16" },
  { coast: "Mavalli", dir: "SE", bearing: 172, dist: "23-28", depth: "4-9", lat: "13 52 38", lng: "74 31 7" },
  { coast: "Shirali", dir: "SE", bearing: 177, dist: "21-26", depth: "13-18", lat: "13 49 24", lng: "74 31 28" },
  { coast: "Bhatkal", dir: "SE", bearing: 178, dist: "20-25", depth: "16-21", lat: "13 46 19", lng: "74 32 14" },
  { coast: "Baindur", dir: "SW", bearing: 237, dist: "24-29", depth: "33-38", lat: "13 44 20", lng: "74 23 59" },
  { coast: "Navunda", dir: "SW", bearing: 259, dist: "20-25", depth: "30-35", lat: "13 42 57", lng: "74 26 19" },
  { coast: "Gangoli", dir: "NW", bearing: 280, dist: "18-23", depth: "23-28", lat: "13 41 27", lng: "74 28 32" },
  { coast: "Coondapoor (gangoli)", dir: "NW", bearing: 281, dist: "17-22", depth: "24-29", lat: "13 39 6", lng: "74 29 55" },
  { coast: "Kota", dir: "NW", bearing: 305, dist: "19-24", depth: "20-25", lat: "13 37 0", lng: "74 31 37" },
  { coast: "Hosabettu-Udaivar", dir: "NW", bearing: 301, dist: "66-71", depth: "45-50", lat: "13 21 28", lng: "74 14 41" },
  { coast: "Mulki", dir: "NW", bearing: 312, dist: "34-39", depth: "26-31", lat: "13 18 18", lng: "74 31 53" },
  { coast: "Suratakal Pt", dir: "NW", bearing: 302, dist: "62-67", depth: "47-52", lat: "13 18 17", lng: "74 16 50" },
  { coast: "Kapu", dir: "NW", bearing: 276, dist: "24-29", depth: "35-40", lat: "13 14 43", lng: "74 29 52" },
  { coast: "New Mangalore", dir: "NW", bearing: 301, dist: "65-70", depth: "46-51", lat: "13 14 28", lng: "74 17 11" },
  { coast: "Udiyavara", dir: "SW", bearing: 245, dist: "27-32", depth: "38-43", lat: "13 11 36", lng: "74 28 26" },
  { coast: "Mangalore", dir: "NW", bearing: 301, dist: "71-76", depth: "45-50", lat: "13 11 18", lng: "74 15 4" },
  { coast: "Malpe", dir: "SW", bearing: 220, dist: "23-28", depth: "35-40", lat: "13 9 57", lng: "74 31 51" },
  { coast: "Hangarkatta", dir: "SW", bearing: 208, dist: "40-45", depth: "37-42", lat: "13 5 55", lng: "74 31 17" }
];

export const INCOIS_DATA: INCOISDataRecord[] = rawData.map(row => ({
  coast: row.coast,
  direction: row.dir,
  bearing: row.bearing,
  distanceKm: row.dist,
  depthMtr: row.depth,
  latDMS: row.lat,
  lngDMS: row.lng,
  lat: parseFloat(dmsToDd(row.lat, true).toFixed(6)),
  lng: parseFloat(dmsToDd(row.lng, false).toFixed(6))
}));
