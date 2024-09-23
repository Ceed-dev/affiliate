// Function to interpolate between two colors
const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const hex = (color: string) => parseInt(color.slice(1), 16);
  const r = (color: number) => (color >> 16) & 255;
  const g = (color: number) => (color >> 8) & 255;
  const b = (color: number) => color & 255;

  const color1Hex = hex(color1);
  const color2Hex = hex(color2);

  const red = Math.round(r(color1Hex) + factor * (r(color2Hex) - r(color1Hex)));
  const green = Math.round(g(color1Hex) + factor * (g(color2Hex) - g(color1Hex)));
  const blue = Math.round(b(color1Hex) + factor * (b(color2Hex) - b(color1Hex)));

  return `rgb(${red}, ${green}, ${blue})`;
};

// Function to get color based on percentage using a gradient from light orange to red
export const getColorByPercentage = (percentage: number): string => {
  if (percentage === 0) {
    return "#D3D3D3"; // Light gray for 0%
  }

  const lowColor = "#FFE4B5"; // Light orange (Moccasin)
  const highColor = "#FF0000"; // Red

  const factor = Math.min(1, Math.max(0, percentage / 100)); // Normalize percentage between 0 and 1
  return interpolateColor(lowColor, highColor, factor);
};

// Function to calculate percentage based on total data count
export const calculatePercentage = (count: number, total: number): number => {
  return total > 0 ? (count / total) * 100 : 0;
};
