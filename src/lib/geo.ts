// GPS acquisition + reverse geocode (OpenStreetMap Nominatim, no API key).
// Learned from the client-only UX reference; adapted to typed helpers.

export interface GpsFix {
  lat: number;
  lon: number;
  accuracy: number;
  label: string;
}

export function getCurrentPosition(
  options: PositionOptions = { enableHighAccuracy: true, timeout: 15000 },
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported on this device"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}` +
      `&lon=${lon}&zoom=14&addressdetails=1`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("reverse geocode failed");
    const data = await res.json();
    const addr = data.address ?? {};
    const city =
      addr.city || addr.town || addr.village || addr.suburb || addr.county || "";
    const state = addr.state || addr.state_district || "";
    const label = [city, state].filter(Boolean).join(", ");
    return label || data.display_name || "";
  } catch {
    return "";
  }
}

// Acquire a full fix (coords + human-readable label) in one call.
export async function acquireGpsFix(): Promise<GpsFix> {
  const pos = await getCurrentPosition();
  const { latitude, longitude, accuracy } = pos.coords;
  const label = await reverseGeocode(latitude, longitude);
  return { lat: latitude, lon: longitude, accuracy, label };
}
