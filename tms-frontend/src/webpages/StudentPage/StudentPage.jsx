import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NotAuthorizedPage from "../NotAuthorizedPage/NotAuthorizedPage";
import Topbar from "../../components/navbar/Topbar/StudentTopbar";
import Sidebar from "../../components/navbar/Sidebar/StudentSidebar";
import FavouritesTable from "../../components/content/FavouritesTable";
import FavouriteCarousel from "../../components/content/FavouritesCarousel";
import AvailableThesesTable from "../../components/content/AvailableThesesTable";
import RequestsApprovedTable from "../../components/content/RequestsApprovedTable";
import MyThesis from "../../components/content/MyThesis";
import MyReports from "../../components/content/MyReports";
import NewReport from "../../components/forms/ProgressForm/NewReport";
import Footer from "../../components/footer/Footer";
import MyRoles from "../../components/content/MyRoles";
import Chat from "../../components/content/Chat";
import Calendar from "../../components/content/Calendar";
import StudentDashboard from "../../components/content/StudentDashboard";
import ActionButtons from "../../components/content/TableComponents";

function StudentPage() {
  //we use ths to indicate from where we're coming from (login or changeRole)
  const location = useLocation();

  const [page, setPage] = useState("Dashboard");
  const initialUser = {
    userId: "",
    group: "",
    email: "",
  };

  const [user, setUser] = useState(initialUser);
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [thesesApplied, setThesesApplied] = useState([]);
  const [thesisAssigned, setThesisAssigned] = useState(null);
  const [thesisData, setThesisData] = useState("");
  const [thesisCompleted, setThesisCompleted] = useState(false);

  const [favourites, setFavourites] = useState([]);

  const [newReport, toggleNewReport] = useState(false);

  const [fullName, setFullName] = useState("");
  // For sidebar link selection
  const [selectedItem, setSelectedItem] = useState("Dashboard");

  useEffect(() => {
    const authUser = async () => {
      try {
        const auth_data = await axios.get("/api/auth/authorization");
        // console.log(auth_data.data);
        if (auth_data.data.auth) {
          if (
            (location.state === "changeRole" &&
              auth_data.data.role.includes("student")) || //we come from my roles page
            (location.state === "login" && auth_data.data.role[0] === "student") //we come from login
          ) {
            console.log(location.state);
            const user_data = await axios.get(
              "/api/users/" + auth_data.data.id,
            );
            setFullName(
              user_data.data.first_name + " " + user_data.data.last_name,
            );

            setAuth(true);

            const credentials = {
              userId: auth_data.data.id,
              group: auth_data.data.group,
              email: auth_data.data.email,
            };

            setUser(credentials);
          } else setAuth(false);
        } else setAuth(false);
        setLoading(false);
      } catch (err) {
        console.log("Server internal error occurred!");
        setAuth(false);
        setLoading(false);
      }
    };

    authUser();
  }, []);

  useEffect(() => {
    const authUser = async () => {
      try {
        const auth_data = await axios.get("/api/auth/authorization");
        if (auth_data.data.auth) {
          if (
            (location.state === "changeRole" &&
              auth_data.data.role.includes("student")) || //we come from my roles page
            (location.state === "login" && auth_data.data.role[0] === "student") //we come from login
          ) {
            console.log(location.state);
            const user_data = await axios.get(
              "/api/users/" + auth_data.data.id,
            );
            setFullName(
              user_data.data.first_name + " " + user_data.data.last_name,
            );

            setAuth(true);

            const credentials = {
              userId: auth_data.data.id,
              group: auth_data.data.group,
              email: auth_data.data.email,
            };

            setUser(credentials);
          } else setAuth(false);
        } else setAuth(false);
        setLoading(false);
      } catch (err) {
        console.log("Server internal error occurred!");
        setAuth(false);
        setLoading(false);
      }
    };

    const interval = setInterval(() => {
      if (auth) authUser();
    }, 3600000);

    return () => clearInterval(interval);
  }, [auth]);

  useEffect(() => {
    const fetchRequests = async () => {
      const requests_data = await axios.get("/api/data/theses_requests");
      // console.log("All requests: ", requests_data.data.results);
      if (requests_data.data.results.length > 0) {
        const user_requests = requests_data.data.results.filter(
          (request) => request.student === user.userId,
        );
        user_requests.map((request) => {
          return setThesesApplied((previousTheses) => [
            ...previousTheses,
            request,
          ]);
        });
      }

      if (user.userId.length > 0) {
        console.log("userId: ", user.userId);
        const thesis_data = await axios.get(
          "/api/data/my_thesis/" + user.userId,
        );

        console.log("Thesis: ", thesis_data.data);

        if (thesis_data && thesis_data.data.thesis) {
          // NOTE: Check this piece of code
          setThesisAssigned(thesis_data.data.thesis._id);
          setThesisData(thesis_data.data);
          if (thesis_data.data.thesis.status === "completed")
            setThesisCompleted(true);
        }
      }
    };

    const fetchFavourites = async () => {
      if (user.userId.length > 0) {
        const favourites_data = await axios.get(
          "/api/data/favourites/" + user.userId,
        );
        // console.log("Favourites: ", favourites_data.data);
        if (favourites_data.data.length > 0) {
          setFavourites(favourites_data.data);
        }
      }
    };

    fetchRequests();
    fetchFavourites();
  }, [user]);

  const userNotAuthorized = () => {
    return <NotAuthorizedPage />;
  };

  const userAuthorized = () => {
    return (
      <div id="wrapper">
        <Sidebar
          role={"Student"}
          selectedItem={selectedItem}
          name={fullName}
          onSelect={(page) => {
            setPage(page);
            setSelectedItem(page);
          }}
        />
        <div id="content-wrapper" className="tw-flex tw-flex-col">
          <div id="content" className="tw-bg-light-pale-blue-white">
            <Topbar
              userId={user.userId}
              email={user.email}
              onSelect={(page) => setPage(page)}
            />
            <div className="tw-flex tw-flex-col tw-m-10">
              <p className="tw-flex tw-text-dark-sky-blue tw-font-bold tw-text-2xl xl:tw-text-3xl">
                {page === "Dashboard" ? "Overview" : ""}
              </p>
              <div className="favourites-content">

                {page === "Dashboard" && thesisData !== "" ? (
                  <StudentDashboard
                    userId={user.userId}
                    thesisData={thesisData}
                    setPage={setPage}
                    setSelectedItem={setSelectedItem}
                  />
                ) : null}
                {page === "Favourite Areas" ? (
                  <div>
                    <FavouriteCarousel
                      userId={user.userId}
                      studentFavourites={favourites}
                    />
                    <FavouritesTable
                      userId={user.userId}
                      studentFavourites={(favourites) =>
                        setFavourites(favourites)
                      }
                    />
                  </div>
                ) : null}
                {page === "Available Theses" ? (
                  <AvailableThesesTable
                    userId={user.userId}
                    group={user.group}
                    email={user.email}
                    thesesApplied={thesesApplied}
                    thesisAssigned={thesisData}
                    setThesesApplied={setThesesApplied}
                  />
                ) : null}
                {page === "Requests Approved" ? (
                  <RequestsApprovedTable
                    userId={user.userId}
                    email={user.email}
                    thesisAssigned={thesisAssigned}
                    assignThesis={(thesis) => setThesisAssigned(thesis)}
                    updateThesisData={(data) => setThesisData(data)}
                  />
                ) : null}
                {page === "My Thesis" ? (
                  thesisAssigned && thesisAssigned.length > 0 ? (
                    <MyThesis
                      userId={user.userId}
                      thesisAssigned={thesisData}
                    />
                  ) : (
                    <div>
                      <h5>There is no assigned thesis yet</h5>
                    </div>
                  )
                ) : null}
                {page === "My Reports" ? (
                  <div>
                    <div className="tw-ml-4 tw-mb-6 tw-mt-4 tw-flex tw-items-center tw-align-middle filter-content tw-justify-between">
                      <h5 className="tw-text-mid-pale-blue tw-text-2xl tw-font-extrabold">
                        {newReport ? "New Progress Report" : "Thesis Reports"}
                      </h5>
                      <ActionButtons
                        updateFunction={() => toggleNewReport(false)}
                        deleteFunction={() => toggleNewReport(true)}
                        firstButtonName="My Reports"
                        secondButtonName="New Report"
                        secondCustomColors="tw-text-white tw-bg-dark-sky-blue hover:tw-bg-mid-pale-blue"
                      />
                    </div>
                    {!newReport && (
                      <MyReports
                        userId={user.userId}
                        email={user.email}
                        user={"student"}
                      />
                    )}
                    {newReport && (
                      <NewReport
                        userId={user.userId}
                        thesisCompleted={thesisCompleted}
                        onSubmitThesis={(data) => setThesisCompleted(data)}
                        thesisData={thesisData}
                        email={user.email}
                      />
                    )}
                  </div>
                ) : null}
                {page === "My Roles" ? (
                  <MyRoles userId={user.userId} currentRole="student" />
                ) : null}
                {page === "My Calendar" ? (
                  <Calendar userId={user.userId} />
                ) : null}
                {page === "Chat" ? (
                  <Chat userId={user.userId} role="student" />
                ) : null}
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    );
  };

  return (
    <div>{auth ? userAuthorized() : loading ? null : userNotAuthorized()}</div>
  );
}

export default StudentPage;
