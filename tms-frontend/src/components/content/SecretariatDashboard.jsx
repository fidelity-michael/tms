import { useEffect, useState, useRef } from "react";
import axios from "axios";
import SmallTable from "./SmallTable";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { Calendar, VStack } from "rsuite";
import {
  convertToGreekDate,
  renderCells,
  TodoList,
} from "./smallCallendarOptions";

function StudentDashboard({ userId, setPage, setSelectedItem }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [completedThesesCount, setCompletedThesesCount] = useState(0);
  const [thesesTableData, setThesesTableData] = useState([]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const componentIsMounted = useRef(true);
  const complThesesHeaders = [
    "Date",
    "Thesis Title",
    "Student Name",
    "Student Email",
  ];

  useEffect(() => {
    const getCompletedTheses = async () => {
      axios
        .get("/api/assigned_theses")
        .then(async (res) => {
          let completed = 0;

          let final_data = await Promise.all(
            res.data.map(async (el) => {
              if (el.status === "completed") {
                completed++;

                let thesis = await axios.get("/api/theses/" + el.thesis);
                let student = await axios.get("/api/users/" + el.student);
                let student_full_name =
                  student.data.first_name + " " + student.data.last_name;

                let date = convertToGreekDate(thesis.data[0].date);

                return {
                  first: date,
                  second: thesis.data[0].title,
                  third: student_full_name,
                  fourth: student.data.email,
                };
              }
            }),
          );
          setThesesTableData(final_data);
          setCompletedThesesCount(completed);
        })
        .catch((err) => console.log(err));
    };

    getCompletedTheses();
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
          console.log(res.data);
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
                  <b> {ev.title} </b> at{" "}
                  <b>
                    {" "}
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

  function emptyTable(e) {
    return (
      <tr>
        <td
          className="empty-data hover:tw-bg-light-pale-blue-white tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          colSpan={100}
        >
          No Data Found
        </td>
      </tr>
    );
  }

  return (
    <div className="tw-flex tw-flex-col 2xl:tw-flex-row tw-gap-7 tw-mt-6">
      <div className="tw-flex tw-flex-col tw-flex-1 tw-gap-8">
        <div
          onClick={() => {
            setPage("Completed Theses");
            setSelectedItem("Completed Theses");
          }}
          className="tw-cursor-pointer"
        >
          {thesesTableData.length ? (
            <SmallTable
              caption={{
                name: "Completed Theses",
                amount: completedThesesCount,
              }}
              headerTitles={complThesesHeaders}
              data={thesesTableData}
            />
          ) : (
            emptyTable()
          )}
        </div>
      </div>

      {
        <div className="2xl:tw-min-h-[70dvh] tw-flex tw-flex-1 tw-text-dark-sky-blue tw-bg-white tw-rounded-2xl tw-shadow-lg tw-pt-2 tw-pb-6 tw-px-4">
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
      <div className="dashboardAdminDiv z-depth-2" type="button">
        <h3
          className="adminDashboardInfo"
          onClick={() => {
            setPage("Completed Theses");
          }}
        >
          <b>Completed Theses: </b>
          {completedTheses}
        </h3>
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
