const SERVERS: Record<string, { base: string; profile: string }> = {
  driving: { base: 'https://routing.openstreetmap.de/routed-car/route/v1', profile: 'driving' },
  cycling: { base: 'https://routing.openstreetmap.de/routed-bike/route/v1', profile: 'cycling' },
  walking: { base: 'https://routing.openstreetmap.de/routed-foot/route/v1', profile: 'walking' },
};

const UA = 'pebble-map-renderer/1.0';

export interface RouteStep {
  name: string;
  distance: number;
  duration: number;
  location: { lat: number; lng: number };
  type: string;
  modifier?: string;
}

export interface RouteResult {
  coordinates: [number, number][];
  distance: number;
  duration: number;
  steps: RouteStep[];
}

const EARTH_RADIUS_M = 6_371_000;

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

export function closestPointOnSegment(
  lat: number,
  lng: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): { lat: number; lng: number } {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return { lat: ax, lng: ay };
  let t = ((lat - ax) * dx + (lng - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return { lat: ax + t * dx, lng: ay + t * dy };
}

export function distanceToRoute(lat: number, lng: number, coords: [number, number][]): number {
  let minDist = Infinity;
  for (let i = 0; i < coords.length - 1; i++) {
    const [alng, alat] = coords[i];
    const [blng, blat] = coords[i + 1];
    const cp = closestPointOnSegment(lat, lng, alat, alng, blat, blng);
    const d = haversine(lat, lng, cp.lat, cp.lng);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

function cumulativeDistances(coords: [number, number][]): number[] {
  const dists: number[] = [0];
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1];
    const [lng2, lat2] = coords[i];
    dists.push(dists[i - 1] + haversine(lat1, lng1, lat2, lng2));
  }
  return dists;
}

export function routeProgress(
  coords: [number, number][],
  pos: { lat: number; lng: number },
): { segIdx: number; frac: number; cumDist: number } {
  let segIdx = 0;
  let best = Infinity;
  let bestT = 0;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i];
    const [lng2, lat2] = coords[i + 1];
    const cp = closestPointOnSegment(pos.lat, pos.lng, lat1, lng1, lat2, lng2);
    const d = haversine(pos.lat, pos.lng, cp.lat, cp.lng);
    const segLen = haversine(lat1, lng1, lat2, lng2);
    const t = segLen > 0 ? haversine(lat1, lng1, cp.lat, cp.lng) / segLen : 0;
    if (d < best) {
      best = d;
      segIdx = i;
      bestT = t;
    }
  }
  const cumDists = cumulativeDistances(coords);
  return {
    segIdx,
    frac: bestT,
    cumDist:
      cumDists[segIdx] +
      bestT *
        haversine(
          coords[segIdx][1],
          coords[segIdx][0],
          coords[segIdx + 1][1],
          coords[segIdx + 1][0],
        ),
  };
}

export function findNextStep(
  route: RouteResult,
  pos: { lat: number; lng: number },
): { step: RouteStep; remainingDist: number } | null {
  const steps = route.steps;
  if (!steps?.length) return null;

  const coords = route.coordinates;
  const cu = routeProgress(coords, pos);
  const cumDists = cumulativeDistances(coords);

  const stepCumDists: number[] = [];
  for (const step of steps) {
    let best = Infinity;
    let idx = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const [lng1, lat1] = coords[i];
      const [lng2, lat2] = coords[i + 1];
      const cp = closestPointOnSegment(
        step.location.lat,
        step.location.lng,
        lat1,
        lng1,
        lat2,
        lng2,
      );
      const d = haversine(step.location.lat, step.location.lng, cp.lat, cp.lng);
      if (d < best) {
        best = d;
        idx = i;
      }
    }
    stepCumDists.push(cumDists[idx]);
  }

  for (let i = 0; i < steps.length; i++) {
    if (stepCumDists[i] >= cu.cumDist) {
      return { step: steps[i], remainingDist: stepCumDists[i] - cu.cumDist };
    }
  }

  return null;
}

export async function fetchRoute(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  profile: string,
): Promise<RouteResult | null> {
  const srv = SERVERS[profile] ?? SERVERS.driving;
  const url = `${srv.base}/${srv.profile}/${from.lng},${from.lat};${to.lng},${to.lat}?geometries=geojson&overview=full&alternatives=false&steps=true`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data: any = await res.json();
    if (!data || data.code !== 'Ok' || !data.routes?.length) return null;
    const r = data.routes[0];
    const steps: RouteStep[] = [];
    if (r.legs?.[0]?.steps) {
      for (const s of r.legs[0].steps) {
        steps.push({
          name: s.name as string,
          distance: s.distance as number,
          duration: s.duration as number,
          location: {
            lat: s.maneuver.location[1] as number,
            lng: s.maneuver.location[0] as number,
          },
          type: s.maneuver.type as string,
          modifier: s.maneuver.modifier as string | undefined,
        });
      }
    }
    return {
      coordinates: r.geometry.coordinates as [number, number][],
      distance: r.distance as number,
      duration: r.duration as number,
      steps,
    };
  } catch {
    return null;
  }
}
