import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Calendar, VStack } from "rsuite";
import { renderCells, TodoList } from "./smallCallendarOptions";

import SmallTable, { SmallTableEmpty } from "./SmallTable";

function StudentDashboard({ userId, thesisData, setPage, setSelectedItem }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const componentIsMounted = useRef(true);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const myThesisHeader = ["Title", "Topic", "Area", "Supervisor"];
  const [thesesTableData, setThesesTableData] = useState([]);

  async function initTableData() {
    console.log("thesisData [init]:", thesisData)
    if (thesisData) {
      setThesesTableData([
        {
          first: thesisData.thesis.title,
          second: thesisData.thesis.topic,
          third: thesisData.thesis.area,
          fourth: thesisData.thesis.professor,
        },
      ]);
    } else {
      setThesesTableData([{}]);
    }
  }

  useEffect(() => {
    initTableData();
    
    return () => {
      componentIsMounted.current = true;
      // componentIsMounted.current = false
    };
  }, []);

  useEffect(() => {
    const getEvents = async () => {
      setLoadingEvents(true);
      await axios
        .get("/api/calendarEvents/" + userId)
        .then((res) => {
          sortByDate(res.data);
          setEvents(res.data);
          setLoadingEvents(false);
        })
        .catch(() => {
          console.log("Server Internal error occured!");
        });
    };

    const sortByDate = async (myEvents) => {
      myEvents.sort(function (a, b) {
        var c = new Date(a.date);
        var d = new Date(b.date);
        return c - d;
      });

      console.log(myEvents);
    };

    if (componentIsMounted.current && userId) {
      getEvents();
    }
    initTableData();
  }, [userId]);

  function renderUpcomingEvents() {
    var currentDate = Date.now();
    var lastEventDate = new Date(events[events.length - 1].date);

    if (lastEventDate < currentDate) {
      return <p>No upcoming events</p>;
    } else {
      return (
        <ul>
          {events.map((ev, index) => {
            var date = new Date(ev.date);

            if (date > currentDate) {
              var formattedDate = date.toLocaleDateString();

              var minutes = date.getMinutes();
              var hours = date.getHours();

              if (hours < 10) hours = "0" + hours;
              if (minutes < 10) minutes = "0" + minutes;

              return (
                <li key={ev._id} className="liEvents">
                  <b>{ev.title}</b> at{" "}
                  <b>
                    {hours}:{minutes} {formattedDate}
                  </b>
                </li>
              );
            }
          })}
        </ul>
      );
    }
  }

  function loading() {
    return (
      <p
        className="animated headShake infinite"
        style={{ marginBottom: "-0.1rem" }}
      >
        Loading...
      </p>
    );
  }

  const handleSelectedDate = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="tw-flex tw-flex-col 2xl:tw-flex-row tw-gap-7 tw-mt-6">
      <div className="tw-flex tw-flex-col tw-flex-1 tw-gap-8">
        <div
          className="tw-cursor-pointer"
          onClick={() => {
            setPage("My Thesis");
            setSelectedItem("My Thesis");
          }}
        >
          {thesisData && thesisData.thesis.title !== ""? (
            <SmallTable
              caption={{
                name: "My Thesis",
              }}
              headerTitles={myThesisHeader}
              data={thesesTableData}
            />
          ) : (
            <SmallTableEmpty
              caption={{
                name: "My Thesis",
              }}
              headerTitles={myThesisHeader}
            />
          )}
        </div>
      </div>
      {
        <div className="2xl:tw-min-h-[67dvh] tw-flex tw-flex-1 tw-text-dark-sky-blue tw-bg-white tw-rounded-2xl tw-shadow-lg tw-pt-2 tw-pb-6 tw-px-4">
          <div className="tw-relative">
            <div className="tw-absolute tw-left-40 tw-z-50 tw-justify-center tw-pt-2 tw-px-4">
              <button
                onClick={() => setPage("My Calendar")}
                className="tw-max-w-xs tw-gap-1 tw-items-center tw-justify-center tw-bg-transparent hover:tw-bg-dark-sky-blue tw-text-dark-sky-blue tw-font-semibold hover:tw-text-white tw-py-1 tw-px-2 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
              >
                <CalendarMonthIcon />
              </button>
            </div>
            <div className="tw-z-10">
              <VStack spacing={10} alignItems="stretch" justifyContent="center">
                <Calendar
                  compact
                  renderCell={(date) => renderCells(date, events)}
                  onSelect={handleSelectedDate}
                />
                <TodoList date={selectedDate} events={events} />
              </VStack>
            </div>
          </div>
        </div>
      }
    </div>
  );

  /* return (
    <div>
      <div
        className="dashboardThesisDiv z-depth-2"
        type="button"
        onClick={() => {
          setPage("My Thesis");
        }}
      >
        <h3>My Thesis: </h3>
        {thesisData ? (
          thesisData.thesis !== "" ? (
            <h2>
              <b className="thesisTitleDashboard">{thesisData.thesis.title}</b>{" "}
            </h2>
          ) : (
            <p>No thesis assigned</p>
          )
        ) : null}
      </div>

      <div
        className="dashboardEventsDiv z-depth-2"
        type="button"
        onClick={() => {
          setPage("My Calendar");
        }}
      >
        <h3>Upcoming Events: </h3>
        {loadingEvents ? (
          loading()
        ) : events.length ? (
          renderUpcomingEvents()
        ) : (
          <p>No upcoming events</p>
        )}
      </div>
    </div>
  ); */
}

export default StudentDashboard;
