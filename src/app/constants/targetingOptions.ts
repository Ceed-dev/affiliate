/**
 * IMPORTANT: Keep country names consistent with the GeoJSON `name` property.
 * 
 * When adding new countries to this array, ensure that the names match exactly
 * with the `name` property in the GeoJSON data (`combinedCountryData`) used for
 * the world map heatmap. This is critical to ensure the country data can be
 * correctly mapped and displayed on the heatmap.
 * 
 * If a mismatch occurs:
 * - The country will not be highlighted on the map.
 * - It may result in errors or invalid data points being flagged.
 */
export const countries = [
  "Japan",
  "China",
  "Taiwan",
  "South Korea",
  "Vietnam",
  "Philippines",
  "Thailand",
  "Indonesia",
  "India",
  "Turkey",
];