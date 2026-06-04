import { getCachedTile, setCachedTile, getCachedGeocode, setCachedGeocode } from './tile-cache.js';

export const TILE_SIZE = 256;
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const UA = 'pebble-map-renderer/1.0';

export function worldPixel(lat: number, lng: number, zoom: number) {
  const n = 2 ** zoom;
  const x = (lng + 180) / 360;
  const y =
    (1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
    2;
  return { wx: x * n * TILE_SIZE, wy: y * n * TILE_SIZE };
}

export async function getTile(z: number, x: number, y: number): Promise<Uint8Array | null> {
  const cached = getCachedTile(z, x, y);
  if (cached) return cached;

  const url = TILE_URL.replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y));
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    setCachedTile(z, x, y, buf);
    return buf;
  } catch {
    return null;
  }
}

export function tryParseLatLng(s: string): { lat: number; lng: number } | null {
  const parts = s.split(',').map((p) => p.trim());
  if (parts.length === 2) {
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
  }
  return null;
}

export async function geocode(query: string): Promise<{ lat: number; lng: number } | null> {
  const cached = getCachedGeocode(query);
  if (cached) return cached;

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });

    if (!res.ok) return null;
    const data: any[] = (await res.json()) as any[];
    if (!data.length) return null;
    const coords = {
      lat: parseFloat(data[0].lat as string),
      lng: parseFloat(data[0].lon as string),
    };
    setCachedGeocode(query, coords);
    return coords;
  } catch {
    return null;
  }
}
