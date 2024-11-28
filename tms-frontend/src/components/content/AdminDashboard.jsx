import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import SmallTable from "./SmallTable";

function AdminDashboard({ userId, setPage }) {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [theses, setTheses] = useState("");
  const [activeTheses, setActiveTheses] = useState("");
  const [archivedTheses, setArchivedTheses] = useState("");
  const [completedTheses, setCompletedTheses] = useState("");
  const [gradedTheses, setGradedTheses] = useState("");

  const [users, setUsers] = useState("");
  const [students, setStudents] = useState("");
  const [professors, setProfessors] = useState("");
  const [admins, setAdmins] = useState("");
  const [secretariats, setSecretariats] = useState("");

  const [userTableData, setUserTableData] = useState([]);
  const [thesesTableData, setThesesTableData] = useState([]);

  const componentIsMounted = useRef(true);

  const userHeaders = ["Role", "First Name", "Last Name", "Active"];
  const thesisHeaders = ["Thesis Title", "Date", "Assigned To", "Active"];

  useEffect(() => {
    const getActiveTheses = async () => {
      axios
        .get("/api/assigned_theses")
        .then(async (res) => {
          var activeTheses = 0;
          var archivedTheses = 0;
          var completedTheses = 0;
          var gradedTheses = 0;

          const final_data = await Promise.all(
            res.data.map(async (el) => {
              let thesis = await axios.get("/api/theses/" + el.thesis);
              let student = await axios.get("/api/users/" + el.student);
              let student_full_name =
                student.data.first_name + " " + student.data.last_name;

              let date = convertToGreekDate(thesis.data[0].date);

              return {
                first: thesis.data[0].title,
                second: date,
                third: student_full_name,
                fourth: thesis.data[0].status,
              };
            }),
          );

          setThesesTableData(final_data);

          Array.isArray(res.data) &&
            res.data.map((thesis) => {
              if (thesis.status === "active") {
                ++activeTheses;
              } else if (thesis.status === "archived") {
                ++archivedTheses;
              } else if (thesis.status === "graded") {
                ++gradedTheses;
              } else if (thesis.status === "completed") {
                ++completedTheses;
              }
            });

          setTheses(res.data.length);
          setActiveTheses(String(activeTheses));
          setArchivedTheses(String(archivedTheses));
          setGradedTheses(String(gradedTheses));
          setCompletedTheses(String(completedTheses));
        })
        .catch((err) => console.log(err));
    };

    const getUsers = async () => {
      axios
        .get("/api/data/users")
        .then((res) => {
          setUsers(res.data.total);
          const final_data = res.data.results.map((el) => ({
            first: el.role,
            second: el.first_name,
            third: el.last_name,
            fourth: el.status,
          }));

          setUserTableData(final_data);

          var studentsNumber = 0;
          var professorsNumber = 0;
          var adminsNumber = 0;
          var secretariatsNumber = 0;

          Array.isArray(res.data.results) &&
            res.data.results.map((user) => {
              user.role.map((role) => {
                if (role === "student") {
                  ++studentsNumber;
                } else if (role === "professor") {
                  ++professorsNumber;
                } else if (role === "secretariat") {
                  ++secretariatsNumber;
                } else if (role === "administrator") {
                  ++adminsNumber;
                }
              });
            });

          setStudents(String(studentsNumber));
          setProfessors(String(professorsNumber));
          setSecretariats(String(secretariatsNumber));
          setAdmins(String(adminsNumber));
        })
        .catch((err) => console.log(err));
    };

    if (componentIsMounted.current) {
      getActiveTheses();
      getUsers();
    }

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
      Array.isArray(myEvents) &&
        myEvents.sort((a, b) => {
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
          {Array.isArray(events) &&
            events.map((ev) => {
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

  /**
   * Convert from database date format to greek style format (DD/MM/YYYY)
    * @param {string} dateString 
    **/
  function convertToGreekDate(dateString){
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // "30/10/2024"
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

  return (
    <div className="tw-flex">
      <div className="tw-flex tw-flex-col tw-flex-1 tw-gap-8 tw-mt-6">
        {
          <div>
            <SmallTable
              caption={{ name: "Users", amount: users }}
              headerTitles={userHeaders}
              data={userTableData}
            />
          </div>
        }
        {
          <div>
            <SmallTable
              caption={{ name: "Assigned Theses", amount: theses }}
              headerTitles={thesisHeaders}
              data={thesesTableData}
            />
          </div>
        }
      </div>
      <div className="">Calendar</div>
    </div>
  );

  {
    // return (
    //   <div>
    //     <div style={{ display: "inline-block" }}>
    //       <div
    //         className="dashboardAdminDiv z-depth-2"
    //         type="button"
    //         style={{ float: "left" }}
    //       >
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Users");
    //           }}
    //         >
    //           <b>Users</b>: {users}
    //         </h3>
    //         <h5>Roles:</h5>
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Users");
    //           }}
    //         >
    //           Students: {students}
    //         </h3>
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Users");
    //           }}
    //         >
    //           Professors: {professors}
    //         </h3>
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Users");
    //           }}
    //         >
    //           Secretariats: {secretariats}
    //         </h3>
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Users");
    //           }}
    //         >
    //           Administrators: {admins}
    //         </h3>
    //       </div>
    //
    //       <div
    //         className="dashboardAdminDiv z-depth-2"
    //         type="button"
    //         style={{ float: "left" }}
    //       >
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Assigned Theses");
    //           }}
    //         >
    //           <b>Theses: </b>
    //           {theses}
    //         </h3>
    //         <h5>Status:</h5>
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Assigned Theses");
    //           }}
    //         >
    //           Active: {activeTheses}
    //         </h3>
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Assigned Theses");
    //           }}
    //         >
    //           Completed: {completedTheses}
    //         </h3>
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Assigned Theses");
    //           }}
    //         >
    //           Graded: {gradedTheses}
    //         </h3>
    //         <h3
    //           className="adminDashboardInfo"
    //           onClick={() => {
    //             setPage("Assigned Theses");
    //           }}
    //         >
    //           Archived: {archivedTheses}
    //         </h3>
    //       </div>
    //     </div>
    //
    //     <div
    //       className="dashboardEventsDiv z-depth-2"
    //       type="button"
    //       onClick={() => {
    //         setPage("My Calendar");
    //       }}
    //     >
    //       <h3>
    //         <b>Upcoming Events: </b>
    //       </h3>
    //       {loadingEvents ? (
    //         loading()
    //       ) : events.length ? (
    //           renderUpcomingEvents()
    //         ) : (
    //             <p>No upcoming events</p>
    //           )}
    //     </div>
    //   </div>
    // );
  }
}

export default AdminDashboard;
