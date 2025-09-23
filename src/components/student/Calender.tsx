"use client";
import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { EventItem } from "@/lib/types";
import { eventTypeColors } from "@/lib/helper";

const AppCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [dayEvents, setDayEvents] = useState<EventItem[]>([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const campusId = localStorage.getItem("CampusID");
    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/assistant/event?campusId=${campusId}`);
        const data = await res.json();
        console.log({data})
        console.log(data.events)
        if (data.success) {
          setEvents(data.events);
          console.log({events})
        }
      } catch (error) {
        console.log("Failed to fetch events", error);
      }
    };
    fetchEvents();
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calendar calculations
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = new Date(currentYear, currentMonth - 1, 0);
  const daysInPrevMonth = prevMonth.getDate();
  const prevMonthDays = [];
  for (let i = firstDayWeekday - 1; i >= 0; i--) prevMonthDays.push(daysInPrevMonth - i);

  const currentMonthDays = [];
  for (let day = 1; day <= daysInMonth; day++) currentMonthDays.push(day);

  const totalCells = 42;
  const remainingCells = totalCells - prevMonthDays.length - currentMonthDays.length;
  const nextMonthDays = [];
  for (let day = 1; day <= remainingCells; day++) nextMonthDays.push(day);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentMonth + direction);
    setCurrentDate(newDate);
  };

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === currentMonth &&
    today.getFullYear() === currentYear;

  const isSelected = (day: number) =>
    selectedDate &&
    selectedDate.getDate() === day &&
    selectedDate.getMonth() === currentMonth &&
    selectedDate.getFullYear() === currentYear;

  // Format date as YYYY-MM-DD in UTC
  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Priority order for event types (most public/well-known first)
  const eventTypePriority: { [key: string]: number } = {
    'public': 1,
    'holiday': 2,
    'festival': 3,
    'national': 4,
    'religious': 5,
    'cultural': 6,
    'sports': 7,
    'business': 8,
    'personal': 9,
    'private': 10
  };

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const dateStr = formatDate(new Date(currentYear, currentMonth, day));
    return events.filter((e) => formatDate(e.date) === dateStr);
  };

  // Get the highest priority event for a day
  const getPriorityEventForDay = (day: number) => {
    const dayEvents = getEventsForDay(day);
    if (dayEvents.length === 0) return null;
    
    // Sort events by priority (lower number = higher priority)
    const sortedEvents = dayEvents.sort((a, b) => {
      const priorityA = eventTypePriority[a.type.toLowerCase()] || 999;
      const priorityB = eventTypePriority[b.type.toLowerCase()] || 999;
      return priorityA - priorityB;
    });
    
    return sortedEvents[0];
  };

  // Get primary event type for calendar day styling
  const getEventTypeForDay = (day: number) => {
    const priorityEvent = getPriorityEventForDay(day);
    return priorityEvent?.type || null;
  };

  const handleDateClick = (day: number | undefined, type: string) => {
    if (type === "current" && day !== undefined) {
      const clickedDate = new Date(currentYear, currentMonth, day);
      setSelectedDate(clickedDate);
      const priorityEvent = getPriorityEventForDay(day);
      setDayEvents(priorityEvent ? [priorityEvent] : []);
      setShowAllEvents(false);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Render single priority event in header
  const renderEventDisplay = () => {
    if (!selectedDate || dayEvents.length === 0) return null;

    const event = dayEvents[0]; // Only one event now
    
    return (
      <div className="px-1">
        <div className="bg-yellow-500/10 items-center flex justify-evenly border border-yellow-300/20 text-center text-yellow-100 px-1 rounded-lg">
          <h4 className="font-bold text-sm w-[7rem] truncate" title={event.title}>{event.title}</h4>
          <p className="text-[10px] italic w-[5rem] truncate text-yellow-200">
            {event.type}
          </p>
          <p className="text-xs opacity-90 w-[5rem] truncate" title={event.description}>{event.description}</p>
        </div>
      </div>
    );
  };

  // Simple day content without event count badge
  const renderDayContent = (day: number) => {
    return <span>{day}</span>;
  };

  return (
    <div className="w-100 sm:w-[33rem] md:w-[40rem] 2xl:w-[28rem] 2xl:h-[22rem] lg:w-[24rem] lg:ml-0 sm:h-[20rem] sm:ml-10 h-80 bg-gradient-to-tl from-white/20 to-black/20 rounded-4xl shadow-2xl border border-gray-100  overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/40 to-purple-600/40 text-white px-6 pt-3 pb-1">
        <div className="flex items-center justify-between ">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft size={15} />
          </button>

          <h2 className="text-md pb-2.5 font-semibold">
            {months[currentMonth]} {currentYear}
          </h2>

          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Selected date display */}
        {selectedDate ? (
          dayEvents.length > 0 ? (
            renderEventDisplay()
          ) : (
            <div className="bg-gray-50/5 border text-xs border-cyan-200 rounded-lg px-2 gap-0.5 py-[0.7px] flex justify-center items-center text-center w-70 mx-auto mb-[0.1rem]">
              <p className=" text-gray-100">Selected Date: </p>
              <p className="font-semibold text-gray-100">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          )
        ) : (
          <button
            onClick={goToToday}
            className="flex items-center w-50 mx-auto text-center justify-center gap-2 text-sm bg-white/20 px-3 py-[0.1rem] rounded-full hover:bg-white/30 transition-colors duration-200"
          >
            <Calendar size={14} />
            Today
          </button>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="px-2 overflow-clip 2xl:mt-3">
        <div className="grid grid-cols-7 md:place-items-center gap-1 ">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center 2xl:text-sm text-xs font-medium text-cyan-200 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 md:place-items-center gap-1">
          {/* Previous month days */}
          {prevMonthDays.map((day, index) => (
            <button
              key={`prev-${index}`}
              className="h-8 w-8 2xl:text-base text-gray-300 text-sm hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors duration-150"
              disabled
            >
              {day}
            </button>
          ))}

          {/* Current month days */}
          {currentMonthDays.map((day) => {
            const isEventDayType = getEventTypeForDay(day);
            let eventClass = "";
            if (isEventDayType && eventTypeColors[isEventDayType]) {
              eventClass = eventTypeColors[isEventDayType];
            }

            return (
              <button
                key={`current-${day}`}
                onClick={() => handleDateClick(day, "current")}
                className={`h-8 w-8 2xl:text-base text-sm rounded-lg transition-all duration-200 transform hover:scale-105 relative ${
                  isToday(day)
                    ? "bg-blue-500 text-white font-semibold shadow-md"
                    : isSelected(day)
                    ? "bg-purple-500 text-white font-medium shadow-md"
                    : eventClass || "text-cyan-200 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {renderDayContent(day)}
              </button>
            );
          })}

          {/* Next month days */}
          {nextMonthDays.map((day, index) => (
            <button
              key={`next-${index}`}
              className="h-8 w-8 2xl:text-base text-gray-300 text-sm hover:bg-gray-50 hover:text-gray-800 rounded-lg transition-colors duration-150"
              disabled
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppCalendar;