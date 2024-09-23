import React, { useEffect, useRef } from "react";
import { useAddress } from "@thirdweb-dev/react";
import L from "leaflet";
import { GeoJsonObject } from "geojson";
import "leaflet/dist/leaflet.css";
import countryData from "../constants/geojson-data/world-countries.json";
import { ClickData } from "../types";
import { getColorByPercentage, calculatePercentage } from "../utils/colorUtils";

// Extract the list of valid country names from the geoJSON data
const validCountryNames = new Set(
  countryData.features.map((feature) => feature.properties.name)
);

// Function to generate test click data for development and testing
const generateTestData = () => {
  const countries = [
    // Asia countries
    { country: "Japan", clicks: 7, region: "Kanto", city: "Tokyo" },           // Valid
    { country: "India", clicks: 5, region: "Maharashtra", city: "Mumbai" },    // Valid
    { country: "China", clicks: 35, region: "Beijing", city: "Beijing" },      // Valid
    { country: "South Korea", clicks: 4, region: "Seoul", city: "Seoul" },     // Valid
    { country: "Thailand", clicks: 10, region: "Bangkok", city: "Bangkok" },   // Valid
    
    // North America countries
    { country: "United States", clicks: 115, region: "California", city: "Los Angeles" }, // Valid
    { country: "Canad", clicks: 1, region: "Ontario", city: "Toronto" },                            // Invalid (intentional typo)
  
    // South America countries
    { country: "Brazil", clicks: 2, region: "Sao Paulo", city: "Sao Paulo" },  // Valid
  
    // Europe countries
    { country: "Germany", clicks: 3, region: "Berlin", city: "Berlin" },       // Valid
    { country: "France", clicks: 8, region: "Paris", city: "Paris" },          // Valid
    { country: "Itly", clicks: 1, region: "Lazio", city: "Rome" },             // Invalid (intentional typo)
    { country: "Spain", clicks: 8, region: "Madrid", city: "Madrid" },         // Valid
    { country: "United Kingdom", clicks: 6, region: "England", city: "London" }, // Valid
  
    // Africa countries
    { country: "South Africa", clicks: 2, region: "Gauteng", city: "Johannesburg" }, // Valid
    { country: "Niger", clicks: 1, region: "Lagos", city: "Lagos" },                 // Invalid (wrong country name instead of Nigeria)
    { country: "Egypt", clicks: 4, region: "Cairo", city: "Cairo" }                  // Valid
  ];

  const testData: ClickData[] = [];
  let idCounter = 1;        // Counter to generate unique click IDs
  let referralIdCounter = 1000;  // Counter for referral IDs

  countries.forEach((countryInfo) => {
    for (let i = 0; i < countryInfo.clicks; i++) {
      const locationData = Math.random() > 0.02 ? countryInfo : null; // Simulate API failure with 2% chance

      const clickData: ClickData = {
        id: idCounter.toString(),
        timestamp: new Date(),
        ip: `192.168.0.${idCounter}`,
        country: locationData?.country || "unknown",
        region: locationData?.region || "unknown",
        city: locationData?.city || "unknown",
        userAgent: "Mozilla/5.0",
        referralId: referralIdCounter.toString(), // Add a referral ID for each click
      };

      testData.push(clickData);  // Add generated click data to the list
      idCounter++;               // Increment ID counter for the next click
    }
    referralIdCounter++;         // Increment referral ID counter for the next country
  });

  return testData;  // Return the generated test data array
};

// WorldHeatmap component: Displays a heatmap based on click data
type WorldHeatmapProps = {
  dataPoints: ClickData[];    // Array of click data points to plot on the heatmap
  unitLabel: string;          // Label to display in tooltips (e.g., "clicks", "conversions")
  projectId: string;          // Project ID for tracking the relevant project
  height?: string;            // Optional: Height of the map container (default: 500px)
  center?: [number, number];  // Optional: Center coordinates for the map (default: [20, 0])
  zoomLevel?: number;         // Optional: Initial zoom level (default: 2)
  maxZoom?: number;           // Optional: Maximum zoom level (default: 18)
  useTestData?: boolean;      // Optional: Boolean to use test data instead of real data
};

export const WorldHeatmap: React.FC<WorldHeatmapProps> = ({
  dataPoints,
  unitLabel,
  projectId,
  height = "500px",              // Default height is 500px
  center = [20, 0],              // Default center coordinates
  zoomLevel = 2,                 // Default zoom level
  maxZoom = 18,                  // Default maximum zoom level
  useTestData = false,           // Default is false
}) => {
  const address = useAddress();  // Get the current user's address

  // Select between test data and provided data
  const actualDataPoints = useTestData ? generateTestData() : dataPoints;

  // Arrays to categorize valid and invalid data points
  const validDataPoints: ClickData[] = [];
  const invalidDataPoints: ClickData[] = [];

  // Validate each click data point by country
  actualDataPoints.forEach((point) => {
    if (point.country !== "unknown" && validCountryNames.has(point.country)) {
      validDataPoints.push(point);  // Add valid data points
    } else {
      invalidDataPoints.push(point); // Track invalid or "unknown" data points
    }
  });

  // Map reference for leaflet map instance
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Initialize the map if not already initialized
    if (mapRef.current === null) {
      const map = L.map("map", {
        zoomControl: false,        // Disable zoom controls
        scrollWheelZoom: false,    // Disable scroll wheel zoom
        doubleClickZoom: false,    // Disable double-click zoom
        dragging: false,           // Disable map dragging
      }).setView(center, zoomLevel); // Set the map center and zoom level

      // Add a tile layer (map background)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: maxZoom,  // Set the maximum zoom level
      }).addTo(map);

      mapRef.current = map;  // Save the map instance reference
    }

    // Count clicks per country for the valid data points
    const countryCounts: Record<string, number> = {};
    validDataPoints.forEach((point) => {
      const country = point.country;
      if (country) {
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });

    const totalDataPoints = validDataPoints.length; // Total number of valid data points

    // Remove existing GeoJSON layers before adding a new one
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add GeoJSON layer to visualize data based on click distribution
    const geoJsonLayer = L.geoJSON(countryData as GeoJsonObject, {
      style: (feature) => {
        if (feature?.properties?.name) {
          const countryName = feature.properties.name;
          const count = countryCounts[countryName] || 0;
          const percentage = calculatePercentage(count, totalDataPoints);

          return {
            fillColor: getColorByPercentage(percentage), // Dynamic color based on click percentage
            weight: 2,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.7,
          };
        }
        return {};  // Return empty style for invalid features
      },
      onEachFeature: (feature, layer) => {
        const countryName = feature.properties.name;
        const count = countryCounts[countryName] || 0;
        const percentage = calculatePercentage(count, totalDataPoints);
        const popupContent = `${countryName}: ${count} ${unitLabel} (${percentage.toFixed(2)}%)`;

        layer.on("mousemove", function (e) {
          layer.bindPopup(popupContent, {
            closeButton: false,  // Hide close button in popups
          }).openPopup(e.latlng);
        });

        layer.on("mouseout", function () {
          layer.closePopup();  // Close the popup when the mouse leaves the country
        });
      },
    });

    geoJsonLayer.addTo(mapRef.current);  // Add the GeoJSON layer to the map

  }, [validDataPoints, unitLabel, center, zoomLevel, maxZoom]);

  return (
    <>
      {/* Render the map */}
      <div id="map" style={{ height: height, width: "100%" }} />
      
      {/* Display invalid data points if any */}
      {invalidDataPoints.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-red-600 bg-yellow-100 p-3 rounded flex items-center">
            {`⚠️ Invalid Click Data (${invalidDataPoints.length})`}
            
            {/* Text and email icon for notifying admin */}
            <span className="ml-3 text-sm font-normal text-gray-700">Contact Admin:</span>
            
            <a
              href={`mailto:official@ceed.cloud?subject=Invalid Click Data Found for Project ${projectId}&body=Dear Admin, invalid click data has been detected for the project with ID: ${projectId}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2"
            >
              <img
                src="/assets/common/new-tab.png"
                alt="Notify Admin"
                className="w-5 h-5"
                title="Notify admin via email"
              />
            </a>
          </h3>

          {/* Display detailed invalid data if the user is the admin */}
          {address === "0x329980D088Ba66B3d459AE3d396a722437801689" && (
            <div className="mt-5 p-4 border-2 border-red-600 bg-red-100 rounded-lg shadow-md">
              <table className="min-w-full table-auto bg-white border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b">Referral ID</th>
                    <th className="px-4 py-2 border-b">Click ID</th>
                    <th className="px-4 py-2 border-b">IP</th>
                    <th className="px-4 py-2 border-b">Country</th>
                    <th className="px-4 py-2 border-b">Region</th>
                    <th className="px-4 py-2 border-b">City</th>
                    <th className="px-4 py-2 border-b">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {invalidDataPoints.map((point, index) => {
                    const isCountryUnknown = point.country === "unknown";
                    const backgroundColor = isCountryUnknown ? "bg-yellow-200" : "bg-blue-100";

                    return (
                      <tr key={index} className={`px-4 py-2 border-b text-center ${backgroundColor}`}>
                        <td className="px-4 py-2 border-b">{point.referralId}</td>
                        <td className="px-4 py-2 border-b">{point.id}</td>
                        <td className="px-4 py-2 border-b">{point.ip}</td>
                        <td className="px-4 py-2 border-b">{point.country}</td>
                        <td className="px-4 py-2 border-b">{point.region}</td>
                        <td className="px-4 py-2 border-b">{point.city}</td>
                        <td className="px-4 py-2 border-b">{point.timestamp.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
};