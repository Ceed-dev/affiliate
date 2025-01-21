import React, { createContext, useContext, useState, ReactNode } from "react";
import { ProjectData } from "../types";

type MarketplaceContextType = {
  projects: ProjectData[]; // List of projects
  setProjects: (projects: ProjectData[]) => void; // Function to update projects
  featuredProjectId: string | null; // ID of the featured project
  setFeaturedProjectId: (id: string | null) => void; // Function to update featured project ID
  bannerMessage: string | null; // Marketplace banner message
  setBannerMessage: (message: string | null) => void; // Function to update banner message
  selectedCategory: string; // Selected category (e.g., "Kaia" or "GameFi")
  setSelectedCategory: (category: string) => void; // Function to update the selected category
  kaiaProjectIds: string[]; // List of Kaia project IDs
  setKaiaProjectIds: (ids: string[]) => void; // Function to update Kaia project IDs
};

// Create context
const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [featuredProjectId, setFeaturedProjectId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Kaia");
  const [kaiaProjectIds, setKaiaProjectIds] = useState<string[]>([]);

  return (
    <MarketplaceContext.Provider
      value={{
        projects,
        setProjects,
        featuredProjectId,
        setFeaturedProjectId,
        bannerMessage,
        setBannerMessage,
        selectedCategory,
        setSelectedCategory,
        kaiaProjectIds,
        setKaiaProjectIds,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplaceContext = (): MarketplaceContextType => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplaceContext must be used within a MarketplaceProvider");
  }
  return context;
};