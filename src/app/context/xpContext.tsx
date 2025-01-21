import React, { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the XPContext
type XPContextType = {
  totalXpPoints: number; // Total XP points for the user
  setTotalXpPoints: (points: number) => void; // Function to update the XP points
};

// Create a context for XP points management
const XPContext = createContext<XPContextType | undefined>(undefined);

/**
 * XPProvider component
 * This provider wraps components that need access to XP points.
 * It manages the state for total XP points and provides a way to update it.
 * 
 * @param children - React children elements that will consume the XP context.
 */
export const XPProvider = ({ children }: { children: ReactNode }) => {
  const [totalXpPoints, setTotalXpPoints] = useState<number>(0); // Initialize XP points to 0

  return (
    <XPContext.Provider value={{ totalXpPoints, setTotalXpPoints }}>
      {children}
    </XPContext.Provider>
  );
};

/**
 * Custom hook to use the XPContext
 * Provides access to the total XP points and the function to update it.
 * 
 * This hook ensures that it is only used within an XPProvider.
 * 
 * @throws Error if used outside of XPProvider
 * @returns {XPContextType} The context value with totalXpPoints and setTotalXpPoints function
 */
export const useXPContext = (): XPContextType => {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error("useXPContext must be used within an XPProvider");
  }
  return context;
};