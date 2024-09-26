import { useState, useEffect } from "react";

/**
 * Custom hook to calculate the time remaining until a target date.
 * It updates every second and returns a formatted string with the remaining time.
 * 
 * @param targetDate - The future date to count down to. Can be undefined.
 * @returns {string} - A string showing the remaining time (e.g., "2d 3h 4m 5s") or "Time's up!".
 */
export const useCountdown = (targetDate: Date | undefined): string => {
  const [timeLeft, setTimeLeft] = useState(""); // Stores the formatted time remaining

  useEffect(() => {
    // Function to update the countdown based on the current time and target date
    const updateCountdown = () => {
      if (!targetDate) {
        setTimeLeft(""); // If no target date is provided, reset timeLeft to an empty string
        return;
      }

      const now = new Date(); // Get the current time
      const difference = targetDate.getTime() - now.getTime(); // Calculate the difference in milliseconds

      if (difference > 0) {
        // Calculate remaining days, hours, minutes, and seconds
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        // Set the formatted time remaining
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        // If the target date has passed, display "Time's up!"
        setTimeLeft("Time's up!");
      }
    };

    // Set interval to update the countdown every second
    const timer = setInterval(updateCountdown, 1000);

    // Clean up the interval when the component is unmounted or targetDate changes
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft; // Return the formatted time remaining
};
