import { useState, useEffect } from "react";

export const useCountdown = (targetDate: Date | undefined) => {
  const [timeLeft, setTimeLeft] = useState("");
  
  useEffect(() => {
    const updateCountdown = () => {
      if (!targetDate) {
        setTimeLeft("");
        return;
      }

      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft("Time's up!");
      }
    };
  
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  
  return timeLeft;
};