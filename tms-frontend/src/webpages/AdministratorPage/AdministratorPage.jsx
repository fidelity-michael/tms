import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import NotAuthorizedPage from '../NotAuthorizedPage/NotAuthorizedPage';
import Topbar from '../../components/navbar/Topbar/AdminTopbar';
import Sidebar from '../../components/navbar/Sidebar/AdminSidebar';
import UniversitiesTable from '../../components/content/UniversitiesTable';
import DepartmentsTable from '../../components/content/DepartmentsTable';
import AreasTable from '../../components/content/AreasTable';
import NewArea from '../../components/forms/NewAreaForm/NewArea';
import UsersTable from '../../components/content/UsersTable';
import NewUser from '../../components/forms/NewUserForm/NewUser';
import Statistics from '../../components/content/Statistics';
import AssignedThesesAvailable from '../../components/content/AssignedThesesAvailable';
import ThesesTable from '../../components/content/ThesesTable';
import Footer from '../../components/footer/Footer';
import MyRoles from '../../components/content/MyRoles';
import Calendar from '../../components/content/Calendar'
import AdminDashboard from '../../components/content/AdminDashboard';
import NewUniversityForm from '../../components/forms/NewUniversityForm/NewUniversityForm';
import NewDepartmentForm from '../../components/forms/NewDepartmentForm/NewDepartmentForm';

export default function AdministratorPage() {

  //we use ths to indicate from where we're coming from (login or changeRole)
  const location = useLocation(); 

  const [page, setPage] = useState("Dashboard");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [auth, setAuth] = useState(false);

  const [newArea, toggleNewArea] = useState(false);
  const [newUser, toggleNewUser] = useState(false);
  const [newUniversity, toggleNewUniversity] = useState(false);
  const [newDepartment, toggleNewDepartment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authUser = async () => {
      try {
        const auth_data = await axios.get('/auth/authorization');
        // console.log(auth_data.data);

        if (auth_data.data.auth) {
          if(
            (location.state === "changeRole" && auth_data.data.role.includes("administrator")) || //we come from my roles page
            (location.state ==="login" && auth_data.data.role[0] === "administrator")  //we come from login
          ){

            console.log(location.state);

            setAuth(true);
            setEmail(auth_data.data.email);
            setUserId(auth_data.data.id);
          }
          else setAuth(false);
        }
        else setAuth(false);
        setLoading(false);
      }
      catch (err) {
        console.log("Server internal error occurred!");
        setAuth(false);
        setLoading(false);
      }
    }

    authUser();
  }, []);

  useEffect(() => {
    const authUser = async () => {
      try {
        const auth_data = await axios.get('/auth/authorization');
        // console.log(auth_data.data);

        if (auth_data.data.auth) {
          if(
            (location.state === "changeRole" && auth_data.data.role.includes("administrator")) || //we come from my roles page
            (location.state ==="login" && auth_data.data.role[0] === "administrator")  //we come from login
          ){

            console.log(location.state);

            setAuth(true);
            setEmail(auth_data.data.email);
            setUserId(auth_data.data.id);
          }
          else setAuth(false);
        }
        else setAuth(false);
        setLoading(false);
      }
      catch (err) {
        console.log("Server internal error occurred!");
        setAuth(false);
        setLoading(false);
      }
    }

    const interval = setInterval(() => {
      if(auth) {
        console.log("Checking session...");
        authUser();
      }
      
    }, 3600000);

    return () => clearInterval(interval);
  }, [auth]);

  const userNotAuthorized = () => {
    return (
      <NotAuthorizedPage />
    );
  }

  const setPagefromDashboard = () => {

  }

  const userAuthorized = () => {
    return (
      <div id="wrapper">
        <Sidebar onSelect={page => setPage(page)} />
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <Topbar userId={userId} email={email} onSelect={page => setPage(page)}/>
            <div className="container-fluid">
              {/* <span>{userId}</span> <hr /> */}
              <b><p className="text-gray-800">{page}</p></b>
              {(page === "Dashboard") ? <AdminDashboard userId={userId} setPage={setPage}/> : null}
              {(page === "Users") ?
                <div>
                  <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                    <button type="button" className="btn btn-light user-btn" onClick={(e) => toggleNewUser(false)}>Show Users</button>
                    <button type="button" className="btn btn-info user-btn new" onClick={(e) => toggleNewUser(true)}>New User</button>
                  </div>

                  {!newUser && <UsersTable />}
                  {newUser && <NewUser />}
                </div>
                : null}
              {(page === "Statistics") ? <Statistics /> : null}
              {(page === "Universities") ?
                <div>
                  <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                    <button type="button" className="btn btn-light user-btn" onClick={(e) => toggleNewUniversity(false)}>Show Universities</button>
                    <button type="button" className="btn btn-info user-btn new" onClick={(e) => toggleNewUniversity(true)}>New University</button>
                  </div>
                  {!newUniversity && <UniversitiesTable />} 
                  {newUniversity && <NewUniversityForm />}
                </div>
                : null
              }
              {(page === "Departments") ?
                <div>
                  <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                    <button type="button" className="btn btn-light user-btn" onClick={(e) => toggleNewDepartment(false)}>Show Departments</button>
                    <button type="button" className="btn btn-info user-btn new" onClick={(e) => toggleNewDepartment(true)}>New Department</button>
                  </div>
                  {!newDepartment && <DepartmentsTable />}
                  {newDepartment && <NewDepartmentForm />}
                </div>
                : null
              }
              {(page === "Areas / Categories") ?
                <div>
                  <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                    <button type="button" className="btn btn-light area-btn" onClick={(e) => toggleNewArea(false)}>Show Areas</button>
                    <button type="button" className="btn btn-dark area-btn new" onClick={(e) => toggleNewArea(true)}>New Area</button>
                  </div>

                  {!newArea && <AreasTable />}
                  {newArea && <NewArea />}
                </div>
                : null}
              {(page === "Assigned Theses") ? <AssignedThesesAvailable userId={userId} userGroup={"Administrator"} /> : null}
              {(page === "Theses Archive") ? <ThesesTable userId={userId} userGroup={"Administrator"} /> : null}
              {(page === "My Roles") ? <MyRoles userId={userId}  currentRole="administrator"/> : null}
              {(page === "My Calendar") ? <Calendar userId={userId}/> : null}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div>
      {
        auth ? userAuthorized() : loading ? null : userNotAuthorized()
      }
    </div>
  );
}
