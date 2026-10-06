"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getEvents } from "@/lib/api";
import { parseEventDate } from "@/lib/date";
import { Event } from "@/types";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "@/components/ui/Icons";

export default function OfficialCalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ day: number; events: Event[] } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchCalendarEvents() {
      try {
        const fetched = await getEvents();
        if (!ignore && Array.isArray(fetched)) {
          setEvents(fetched);
        }
      } catch (err) {
        console.error("Failed to load calendar events", err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchCalendarEvents();
    return () => {
      ignore = true;
    };
  }, []);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed
  const monthName = viewDate.toLocaleString("default", { month: "long" }).toUpperCase();

  const handlePrevMonth = () => {
    setSelectedDayEvents(null);
    setViewDate((cur) => new Date(cur.getFullYear(), cur.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDayEvents(null);
    setViewDate((cur) => new Date(cur.getFullYear(), cur.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setSelectedDayEvents(null);
    setViewDate(new Date());
  };

  // First day of month (0-6) and number of days in month
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Map events to days of this month using safe local date parsing
  const eventsByDay = useMemo(() => {
    const map = new Map<number, Event[]>();
    for (const event of events) {
      const validDate = parseEventDate(event.date, event.time);
      if (
        !Number.isNaN(validDate.getTime()) &&
        validDate.getFullYear() === year &&
        validDate.getMonth() === month
      ) {
        const d = validDate.getDate();
        const existing = map.get(d) || [];
        map.set(d, [...existing, event]);
      }
    }
    return map;
  }, [events, year, month]);

  // Calendar cells: padding before first day + actual days
  const calendarCells = useMemo(() => {
    const cells: Array<{ day: number | null; events: Event[] }> = [];
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: null, events: [] });
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      cells.push({ day: d, events: eventsByDay.get(d) || [] });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, events: [] });
    }
    return cells;
  }, [firstDayIndex, totalDaysInMonth, eventsByDay]);

  const now = new Date();
  const isCurrentMonthView = now.getFullYear() === year && now.getMonth() === month;
  const today = isCurrentMonthView ? now.getDate() : null;

  return (
    <main className="comic-page">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="comic-title">CAMPUS CALENDAR</h1>
            <p className="comic-sub">Official dates, deadlines, and live campus events.</p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link href="/events" className="comic-btn text-xs">
              Browse All Events →
            </Link>
          </div>
        </div>

        <div className="comic-card mt-6 p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="comic-btn-outline p-1 text-xs font-bold inline-flex items-center justify-center"
              >
                <ChevronLeftIcon className="h-3.5 w-3.5" />
              </button>
              <div className="stay-loop-title" style={{ fontSize: 20 }}>
                {monthName} {year}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="comic-btn-outline p-1 text-xs font-bold inline-flex items-center justify-center"
              >
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </button>
              {!isCurrentMonthView && (
                <button
                  type="button"
                  onClick={handleToday}
                  className="comic-btn text-[10px] py-0.5 px-2 ml-1"
                >
                  Today
                </button>
              )}
            </div>

            <span className="tag-pill tag-cab self-start sm:self-auto">
              {isLoading ? "LOADING..." : `${events.length} EVENTS SYNCED`}
            </span>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysOfWeek.map((d) => (
              <div
                key={d}
                className="text-center text-[10px] sm:text-[11px] font-black tracking-widest py-1"
                style={{ color: "var(--neon-yellow)" }}
              >
                {d}
              </div>
            ))}

            {/* Day Cells */}
            {calendarCells.map((cell, idx) => {
              if (cell.day === null) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-12 sm:min-h-16 p-1 sm:p-2 text-xs border border-transparent opacity-20"
                  />
                );
              }

              const isToday = cell.day === today;
              const hasEvents = cell.events.length > 0;
              const isSelected = selectedDayEvents?.day === cell.day;

              return (
                <button
                  type="button"
                  key={`day-${cell.day}`}
                  onClick={() => {
                    if (hasEvents) {
                      setSelectedDayEvents({ day: cell.day!, events: cell.events });
                    } else {
                      setSelectedDayEvents(null);
                    }
                  }}
                  className={`min-h-12 sm:min-h-16 p-1 sm:p-2 text-left transition flex flex-col justify-between ${
                    hasEvents ? "cursor-pointer hover:border-[var(--neon-cyan)]" : "cursor-default"
                  }`}
                  style={{
                    border: isSelected
                      ? "2px solid var(--neon-cyan)"
                      : isToday
                      ? "2px solid var(--accent)"
                      : "2px solid #000",
                    background: hasEvents
                      ? "rgba(42,240,255,0.14)"
                      : isToday
                      ? "rgba(255,45,74,0.18)"
                      : "rgba(0,0,0,0.35)",
                    boxShadow: isSelected
                      ? "0 0 10px rgba(42,240,255,0.4)"
                      : isToday
                      ? "0 0 8px rgba(255,45,74,0.35)"
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-black ${
                        isToday ? "text-[var(--accent)]" : "text-white"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {hasEvents && (
                      <span
                        className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full shrink-0"
                        style={{
                          background: "var(--neon-cyan)",
                          boxShadow: "0 0 4px var(--neon-cyan)",
                        }}
                      />
                    )}
                  </div>

                  {hasEvents && (
                    <div className="mt-1 hidden sm:block">
                      <p
                        className="truncate text-[10px] font-bold"
                        style={{ color: "var(--neon-cyan)" }}
                        title={cell.events[0].name}
                      >
                        {cell.events[0].name}
                      </p>
                      {cell.events.length > 1 && (
                        <p className="text-[9px] font-extrabold text-white">
                          +{cell.events.length - 1} more
                        </p>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Event Drawer */}
          {selectedDayEvents && (
            <div
              className="mt-5 border-2 border-black p-4"
              style={{ background: "rgba(42,240,255,0.08)", boxShadow: "2px 2px 0 #000" }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-white">
                  Events on {monthName} {selectedDayEvents.day}
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedDayEvents(null)}
                  className="text-xs text-[var(--fg-muted)] hover:text-white inline-flex items-center gap-1 cursor-pointer"
                >
                  <XIcon className="h-3.5 w-3.5" />
                  <span>Close</span>
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {selectedDayEvents.events.map((ev) => (
                  <div
                    key={ev.id}
                    className="comic-card flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 gap-2"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">{ev.name}</p>
                      <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
                        Time: {ev.time} · Venue: {ev.venue} {ev.createdBy ? `· By ${ev.createdBy}` : ""}
                      </p>
                    </div>

                    <Link href="/events" className="comic-btn text-xs py-1 px-3 self-start sm:self-auto">
                      View Event →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t pt-3 text-xs" style={{ borderColor: "#000", color: "var(--fg-muted)" }}>
            <p>
              Cyan highlights indicate scheduled events. Red highlights indicate today.
            </p>
            <Link href="/events" className="text-[var(--neon-cyan)] hover:underline mt-1 sm:mt-0">
              Need to add an event? Go to Events →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
