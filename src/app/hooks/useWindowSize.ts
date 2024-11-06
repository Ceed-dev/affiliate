import { useState, useEffect } from "react";

/**
 * Custom hook to get the current window width, updating on window resize.
 * 
 * @returns {number} The current width of the window.
 */
export function useWindowSize(): number {
  const [width, setWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    // Attach the event listener on mount
    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}