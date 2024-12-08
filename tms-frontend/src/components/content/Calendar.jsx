import React, { useState, useEffect } from "react";
import axios from "axios";
import CalendarEventModal from "../../components/content/CalendarEventModal";
import FullCalendar from "@fullcalendar/react"; // must go before plugins
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import Tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import AddIcon from "@mui/icons-material/Add";

import interactionPlugin from "@fullcalendar/interaction";

function Calendar({ userId }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const getEvents = async () => {
      await axios
        .get("/api/calendarEvents/" + userId)
        .then((res) => {
          setEvents(res.data);
        })
        .catch(() => {
          console.log("Server Internal error occured!");
        });
    };

    if (userId) {
      getEvents();
    }
  }, [userId]);

  function fetchEvents(events) {
    setEvents(events);
  }

  const handleMouseEnter = (arg) => {
    Tippy(arg.el, {
      content: arg.event._def.title + " at " + arg.timeText,
    });
  };

  return (
    <div className="tw-flex tw-flex-col tw-gap-4">
      <div className="tw-flex tw-justify-between tw-mb-4">
        <div className="tw-text-dark-sky-blue tw-text-md">
          <a href="">Dashboard</a> &gt; Calendar
        </div>
      </div>

      {/* NOTE: Overriding cells functionality @App.css with provided classes */}
      <div className="tw-text-dark-sky-blue">
        <FullCalendar
          events={events}
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          eventDidMount={handleMouseEnter}
          eventColor="#88BDF2"
          dateClick={() => {
            setShowCalendar(true);
          }}
        />
      </div>

      <CalendarEventModal
        userId={userId}
        show={showCalendar}
        fetchEvents={fetchEvents}
        onShow={(data) => setShowCalendar(data)}
      />
    </div>
  );
}

export default Calendar;
