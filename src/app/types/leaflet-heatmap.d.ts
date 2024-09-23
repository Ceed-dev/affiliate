// Custom module declaration for integrating Heatmap.js with Leaflet
declare module "heatmap.js/plugins/leaflet-heatmap" {
  import { Layer } from "leaflet"; // Import Leaflet's Layer class

  /**
   * The HeatmapOptions interface defines the configuration options for displaying a heatmap.
   * Each option affects the appearance and behavior of the heatmap.
   */
  interface HeatmapOptions {
    /**
     * Defines the radius of each data point in the heatmap (in pixels).
     * Default is around 20 pixels.
     */
    radius?: number;

    /**
     * Defines the maximum opacity of the heatmap (range: 0 to 1).
     * 1 means fully opaque, 0 means fully transparent.
     */
    maxOpacity?: number;

    /**
     * Option to scale the radius dynamically based on the number of data points.
     */
    scaleRadius?: boolean;

    /**
     * Defines whether to scale the color distribution based on local extrema (maximum value).
     */
    useLocalExtrema?: boolean;

    /**
     * Field name for latitude. Use this to customize the default data field name.
     * Specifies which field in the data object corresponds to the latitude.
     */
    latField?: string;

    /**
     * Field name for longitude. Use this to customize the default data field name.
     * Specifies which field in the data object corresponds to the longitude.
     */
    lngField?: string;

    /**
     * Field name for the value. Specifies the value of each data point.
     * For example, click count or density, which determines the intensity of the heatmap.
     */
    valueField?: string;
  }

  /**
   * HeatmapDataPoint interface represents each data point in the heatmap.
   * It includes latitude, longitude, and a value that defines the data's significance (e.g., click count).
   */
  interface HeatmapDataPoint {
    lat: number;  // Latitude
    lng: number;  // Longitude
    value: number;  // Value of the data point (e.g., click count, density)
  }

  /**
   * HeatmapData interface defines the dataset to be passed to the heatmap.
   * max represents the maximum value among the data points, and data is the array of data points.
   */
  interface HeatmapData {
    max: number;  // Maximum value in the dataset
    data: HeatmapDataPoint[];  // Array of data points to be displayed in the heatmap
  }

  /**
   * The HeatmapOverlay class extends Leaflet's Layer to provide heatmap functionality on the map.
   */
  class HeatmapOverlay extends Layer {
    /**
     * Constructor for HeatmapOverlay, accepting heatmap configuration options.
     * @param options Heatmap configuration options
     */
    constructor(options: HeatmapOptions);

    /**
     * Method to set new data for the heatmap.
     * @param data Data to be set for the heatmap
     */
    setData(data: HeatmapData): void;
  }

  // Export the HeatmapOverlay class as the default export
  export default HeatmapOverlay;
}