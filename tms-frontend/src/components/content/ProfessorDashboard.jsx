import { useEffect, useState, useRef } from "react";
import axios from "axios";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Calendar, VStack } from "rsuite";
import { convertToGreekDate, renderCells, TodoList } from "./smallCallendarOptions";

import SmallTable, { SmallTableEmpty } from "./SmallTable";

function ProfessorDashboard({ userId, myStudents, setPage, setSelectedItem }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [activeTheses, setActiveTheses] = useState([]);
  const [loadingTheses, setLoadingTheses] = useState(true);

  const componentIsMounted = useRef(true);

  const [selectedDate, setSelectedDate] = useState(new Date());

  const activeThesesHeaders = ["Thesis Title", "Date", "Assigned To", "Email"];
  const [thesesTableData, setThesesTableData] = useState([]);

  useEffect(() => {
    const getThesesAndStudents = async () => {
      try {
        setLoadingTheses(true);
        // Fetch all data for each student in parallel
        console.log("myStudents ", myStudents)
        const activeThesesData = await Promise.all(
          myStudents.map(async (studentId) => {
            try {
              const assignedThesisRes = await axios.get(
                `/api/assigned_theses/assigned_thesis/${studentId}`,
              );
              // Proceed only if the thesis is active
              if (assignedThesisRes.data.status === "active") {
                const [thesisRes, studentRes] = await Promise.all([
                  axios.get(`/api/theses/${assignedThesisRes.data.thesis}`),
                  axios.get(`/api/data/users/${studentId}`),
                ]);

                const mergedData = { ...thesisRes.data[0], ...studentRes.data };
                return mergedData;
              }
            } catch (error) {
              console.log("Error fetching data for student", studentId, error);
              return null; // Returning null to filter out failed requests later
            }
          }),
        );
        let all_data = activeThesesData.filter((data) => data !== null);
        const small_table_data = all_data.map((el) => ({
          first: el.title,
          second: el.date,
          third: el.first_name + " " + el.last_name,
          fourth: el.email,
        }));
        
        console.log("ActiveTheses!!: ", activeTheses);
        setThesesTableData(small_table_data);
        console.log("all_data:");
        setLoadingTheses(false);
      } catch {
        console.log("gsgs");
      }
    };

    return () => {
      componentIsMounted.current = true;
    };
  }, []);

  useEffect(() => {
    const getThesesAndStudents = async () => {
      try {
        setLoadingTheses(true);
        // Fetch all data for each student in parallel
        const activeThesesData = await Promise.all(
          myStudents.map(async (studentId) => {
            try {
              const assignedThesisRes = await axios.get(
                `/api/assigned_theses/assigned_thesis/${studentId}`,
              );
              // Proceed only if the thesis is active
              if (assignedThesisRes.data.status === "active") {
                const [thesisRes, studentRes] = await Promise.all([
                  axios.get(`/api/theses/${assignedThesisRes.data.thesis}`),
                  axios.get(`/api/data/users/${studentId}`),
                ]);

                const mergedData = { ...thesisRes.data[0], ...studentRes.data };
                return mergedData;
              }
            } catch (error) {
              console.log("Error fetching data for student", studentId, error);
              return null; // Returning null to filter out failed requests later
            }
          }),
        );

        let all_data = activeThesesData.filter((data) => data !== null);
        const small_table_data = all_data.map((el) => ({
          first: el.title,
          second: convertToGreekDate(el.date),
          third: el.first_name + " " + el.last_name,
          fourth: el.email,
        }));
        
        setThesesTableData(small_table_data);
        setActiveTheses(activeThesesData.filter((data) => data !== null));
        setLoadingTheses(false);
      } catch {
        console.log("gsgs");
      }
    };

    if (componentIsMounted.current) {
      if (myStudents.length) getThesesAndStudents();
      else setLoadingTheses(false);
    }
  }, [myStudents]);

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
    };

    if (componentIsMounted.current && userId) {
      getEvents();
    }
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

  function renderActiveTheses() {
    if (activeTheses.length) {
      /* return (
        <ul>
          {activeTheses.map((thesis) => {
            return (
              <li key={thesis._id} className="liEvents">
                {thesis.title}
                <br></br>
                <b>
                  {thesis.first_name} {thesis.last_name}, {thesis.email}
                </b>
              </li>
            );
          })}
        </ul>
      ); */
    } else {
      return <p>No active theses</p>;
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
            setPage("Assigned Theses");
            setSelectedItem("Assigned Theses");
          }}
        >
          {activeTheses.length && myStudents ? (
            <SmallTable
              caption={{
                name: "Active Theses",
              }}
              headerTitles={activeThesesHeaders}
              data={thesesTableData}
              rows={9}
            />
          ) : (
            <SmallTableEmpty
              caption={{
                name: "Active Theses",
              }}
              headerTitles={activeThesesHeaders}
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
    /* <div>
      <a
        className="dashboardEventsDiv z-depth-2"
        type="button"
        onClick={() => {
          setPage("Assigned Theses");
        }}
      >
        <h3>Active Theses: </h3>
        {loadingTheses ? loading() : renderActiveTheses()}
      </a>

      <a
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
      </a>
    </div> */
  );
}

export default ProfessorDashboard;
