"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { formatWeekDisplay } from "@/lib/utils";
import { isCurrentWeek } from "@/lib/date";

interface WeekSelectorProps {
  availableWeeks: string[];
  selectedWeekId: string;
  onSelectWeek: (weekId: string) => void;
}

export default function WeekSelector({
  availableWeeks,
  selectedWeekId,
  onSelectWeek,
}: WeekSelectorProps) {
  // Track the currently visible weeks in the selector
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  // Calculate number of visible weeks based on viewport size
  const [visibleCount, setVisibleCount] = useState(5);

  // Update visible count on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 768) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(3);
      } else {
        setVisibleCount(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePrevious = () => {
    if (visibleStartIndex > 0) {
      setVisibleStartIndex(visibleStartIndex - 1);
    }
  };

  const handleNext = () => {
    if (visibleStartIndex + visibleCount < availableWeeks.length) {
      setVisibleStartIndex(visibleStartIndex + 1);
    }
  };

  const visibleWeeks = availableWeeks.slice(
    visibleStartIndex,
    visibleStartIndex + visibleCount
  );

  return (
    <div className="rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <Calendar size={18} className="mr-2" />
          Select Week
        </h2>

        <div className="flex gap-2">
          <button
            onClick={() => onSelectWeek(availableWeeks[0])}
            className={`text-xs py-1 px-2 rounded-md ${
              selectedWeekId === availableWeeks[0]
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            Current Week
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={visibleStartIndex === 0}
          className="p-1 rounded-full hover:bg-gray-800 disabled:opacity-30"
          aria-label="Previous weeks"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 flex-grow">
          {visibleWeeks.map((weekId) => (
            <button
              key={weekId}
              onClick={() => onSelectWeek(weekId)}
              className={`py-2 px-3 text-sm font-medium rounded-md transition-colors
                ${
                  selectedWeekId === weekId
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }
                ${isCurrentWeek(weekId) ? "border-2 border-primary" : ""}
              `}
            >
              {formatWeekDisplay(weekId)}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={visibleStartIndex + visibleCount >= availableWeeks.length}
          className="p-1 rounded-full hover:bg-gray-800 disabled:opacity-30"
          aria-label="Next weeks"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
