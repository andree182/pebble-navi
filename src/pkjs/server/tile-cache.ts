const cache =
  typeof localStorage !== 'undefined' && localStorage
    ? {
        get(k: string) {
          return localStorage.getItem(k);
        },
        set(k: string, v: string) {
          localStorage.setItem(k, v);
        },
      }
    : new Map<string, string>();

function key(z: number, x: number, y: number): string {
  return `tile:${z}/${x}/${y}`;
}

function encodeB64(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary);
}

function decodeB64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function getCachedTile(z: number, x: number, y: number): Uint8Array | null {
  const raw = cache.get(key(z, x, y));
  return raw ? decodeB64(raw) : null;
}

export function setCachedTile(z: number, x: number, y: number, data: Uint8Array): void {
  cache.set(key(z, x, y), encodeB64(data));
}

export function getCachedGeocode(query: string): { lat: number; lng: number } | null {
  const raw = cache.get(`geo:${query}`);
  return raw ? (JSON.parse(raw) as { lat: number; lng: number }) : null;
}

export function setCachedGeocode(query: string, coords: { lat: number; lng: number }): void {
  cache.set(`geo:${query}`, JSON.stringify(coords));
}
