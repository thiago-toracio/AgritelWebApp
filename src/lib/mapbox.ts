// Simplified version for now - in production use Supabase edge function
export const getMapboxToken = async (): Promise<string | null> => {
  // For now, we'll show the fallback map
  // User should add their Mapbox token to Supabase secrets
  return null;
};

// Paraná bounds for map initialization
export const PARANA_BOUNDS = {
  center: [-51.2085, -24.8949] as [number, number], // Curitiba coordinates
  zoom: 7,
  bounds: [
    [-54.6257, -26.7156], // Southwest
    [-48.0214, -22.5079]  // Northeast
  ] as [[number, number], [number, number]]
};