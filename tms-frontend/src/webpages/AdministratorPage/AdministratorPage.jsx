import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NotAuthorizedPage from "../NotAuthorizedPage/NotAuthorizedPage";
import Topbar from "../../components/navbar/Topbar/AdminTopbar";
import Sidebar from "../../components/navbar/Sidebar/AdminSidebar";
import UniversitiesTable from "../../components/content/UniversitiesTable";
import DepartmentsTable from "../../components/content/DepartmentsTable";
import AreasTable from "../../components/content/AreasTable";
import NewArea from "../../components/forms/NewAreaForm/NewArea";
import UsersTable from "../../components/content/UsersTable";
import NewUser from "../../components/forms/NewUserForm/NewUser";
import Statistics from "../../components/content/Statistics";
import AssignedThesesAvailable from "../../components/content/AssignedThesesAvailable";
import ThesesTable from "../../components/content/ThesesTable";
import Footer from "../../components/footer/Footer";
import MyRoles from "../../components/content/MyRoles";
import Calendar from "../../components/content/Calendar";
import AdminDashboard from "../../components/content/AdminDashboard";
import NewUniversityForm from "../../components/forms/NewUniversityForm/NewUniversityForm";
import NewDepartmentForm from "../../components/forms/NewDepartmentForm/NewDepartmentForm";

export default function AdministratorPage() {
  //we use ths to indicate from where we're coming from (login or changeRole)
  const location = useLocation();

  const [page, setPage] = useState("Dashboard");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [auth, setAuth] = useState(false);
  const [fullName, setFullName] = useState("");

  const [newArea, toggleNewArea] = useState(false);
  const [newUser, setNewUser] = useState(false);
  const [newUniversity, toggleNewUniversity] = useState(false);
  const [newDepartment, toggleNewDepartment] = useState(false);
  const [loading, setLoading] = useState(true);

  // For sidebar link selection
  const [selectedItem, setSelectedItem] = useState("Dashboard");

  useEffect(() => {
    const authUser = async () => {
      try {
        const auth_data = await axios.get("/api/auth/authorization");
        console.log(auth_data.data);

        if (auth_data.data.auth) {
          if (
            (location.state === "changeRole" &&
              auth_data.data.role.includes("administrator")) || //we come from my roles page
            (location.state === "login" &&
              auth_data.data.role[0] === "administrator") //we come from login
          ) {
            console.log(location.state);
            const user_data = await axios.get(
              "/api/users/" + auth_data.data.id,
            );
            setFullName(
              user_data.data.first_name + " " + user_data.data.last_name,
            );

            setAuth(true);
            setEmail(auth_data.data.email);
            setUserId(auth_data.data.id);
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
        console.log(auth_data.data);

        if (auth_data.data.auth) {
          if (
            (location.state === "changeRole" &&
              auth_data.data.role.includes("administrator")) || //we come from my roles page
            (location.state === "login" &&
              auth_data.data.role[0] === "administrator") //we come from login
          ) {
            console.log(location.state);

            setAuth(true);
            setEmail(auth_data.data.email);
            setUserId(auth_data.data.id);
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
      if (auth) {
        console.log("Checking session...");
        authUser();
      }
    }, 3600000);

    return () => clearInterval(interval);
  }, [auth]);

  const userNotAuthorized = () => {
    return <NotAuthorizedPage />;
  };

  const setPagefromDashboard = () => {};

  const handleUsersSelection = (toggle) => {
    setNewUser(toggle);
  }

  const userAuthorized = () => {
    return (
      <div id="wrapper" className="tw-flex tw-h-full">
        <Sidebar
          role={"Admin"}
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
              userId={userId}
              email={email}
              onSelect={(page) => setPage(page)}
            />
            <div className="tw-flex tw-flex-col tw-m-10">
              <p className="tw-flex tw-text-dark-sky-blue tw-font-bold tw-text-2xl xl:tw-text-3xl">
                {page === "Dashboard" ? "Overview" : ""}
              </p>
              {page === "Dashboard" ? (
                <AdminDashboard
                  userId={userId}
                  setPage={setPage}
                  setSelectedItem={setSelectedItem}
                />
              ) : null}
              {page === "Users" ? (
                <div>
                  <div className="tw-flex tw-gap-1 tw-justify-between tw-items-center tw-mb-4">
                    {newUser === false ? <h5 className="tw-text-dark-sky-blue">Users Table</h5> : <h5>New User</h5>}
                    <hr />
                    <div className="tw-flex tw-gap-1">
                      <button onClick={() => setNewUser(false)} className="tw-bg-transparent hover:tw-bg-dark-sky-blue tw-text-dark-sky-blue tw-font-semibold hover:tw-text-white tw-py-2 tw-px-4 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded">
                        Show Users
                      </button>
                      <button onClick={() => setNewUser(true)} className="tw-font-semibold tw-text-white tw-bg-dark-sky-blue tw-py-2 tw-px-4 tw-border-dark-sky-blue hover:tw-opacity-95  hover:tw-border-dark-sky-blue tw-rounded">
                        New User
                      </button>
                    </div>
                  </div>
                  {!newUser && <UsersTable />}
                  {newUser && <NewUser />}
                </div>
              ) : null}
              {page === "Statistics" ? <Statistics /> : null}
              {page === "Universities" ? (
                <div>
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="Button group with nested dropdown"
                  >
                    <button
                      type="button"
                      className="btn btn-light user-btn"
                      onClick={() => toggleNewUniversity(false)}
                    >
                      Show Universities
                    </button>
                    <button
                      type="button"
                      className="btn btn-info user-btn new"
                      onClick={() => toggleNewUniversity(true)}
                    >
                      New University
                    </button>
                  </div>
                  {!newUniversity && <UniversitiesTable />}
                  {newUniversity && <NewUniversityForm />}
                </div>
              ) : null}
              {page === "Departments" ? (
                <div>
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="Button group with nested dropdown"
                  >
                    <button
                      type="button"
                      className="btn btn-light user-btn"
                      onClick={() => toggleNewDepartment(false)}
                    >
                      Show Departments
                    </button>
                    <button
                      type="button"
                      className="btn btn-info user-btn new"
                      onClick={() => toggleNewDepartment(true)}
                    >
                      New Department
                    </button>
                  </div>
                  {!newDepartment && <DepartmentsTable />}
                  {newDepartment && <NewDepartmentForm />}
                </div>
              ) : null}
              {page === "Areas / Categories" ? (
                <div>
                  <div
                    className="btn-group"
                    role="group"
                    aria-label="Button group with nested dropdown"
                  >
                    <button
                      type="button"
                      className="btn btn-light area-btn"
                      onClick={() => toggleNewArea(false)}
                    >
                      Show Areas
                    </button>
                    <button
                      type="button"
                      className="btn btn-dark area-btn new"
                      onClick={() => toggleNewArea(true)}
                    >
                      New Area
                    </button>
                  </div>

                  {!newArea && <AreasTable />}
                  {newArea && <NewArea />}
                </div>
              ) : null}
              {page === "Assigned Theses" ? (
                <AssignedThesesAvailable userId={userId} />
              ) : null}
              {page === "Theses Archive" ? (
                <ThesesTable userId={userId} userGroup={"Administrator"} />
              ) : null}
              {page === "My Roles" ? (
                <MyRoles userId={userId} currentRole="administrator" />
              ) : null}
              {page === "My Calendar" ? <Calendar userId={userId} /> : null}
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
