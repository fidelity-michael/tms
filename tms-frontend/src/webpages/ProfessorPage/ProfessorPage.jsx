import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import NotAuthorizedPage from '../NotAuthorizedPage/NotAuthorizedPage';
import Topbar from '../../components/navbar/Topbar/ProfessorTopbar';
import Sidebar from '../../components/navbar/Sidebar/ProfessorSidebar';
import NewThesisForm from '../../components/forms/NewThesisForm/NewThesisForm';
import AssignedThesesTable from '../../components/content/AssignedThesesTable';
import SuperviseThesesTable from '../../components/content/SuperviseThesesTable';
import ThesesRequestsTable from '../../components/content/ThesesRequestsTable';
import ThesesTable from '../../components/content/ThesesTable';
import Footer from '../../components/footer/Footer';
import MyRoles from '../../components/content/MyRoles';
import Chat from '../../components/content/Chat';
import Calendar from '../../components/content/Calendar'
import ProfessorDashboard from '../../components/content/ProfessorDashboard';

function ProfessorPage() {

  //we use ths to indicate from where we're coming from (login or changeRole)
  const location = useLocation(); 

  const [page, setPage] = useState("Dashboard");
  
  const initialUser = {
    userId: "",
    group: "",
    email: ""
  };

  const [user, setUser] = useState(initialUser);
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [thesesRequest, setThesesRequest] = useState('');

  const [myStudents, setMyStudents] = useState([]);

  useEffect(() => {
    const authUser = async () => {
      try {
        const auth_data = await axios.get('/auth/authorization');
        // console.log(auth_data.data);
        if (auth_data.data.auth) {
          if(
            (location.state === "changeRole" && auth_data.data.role.includes("professor")) || //we come from my roles page
            (location.state ==="login" && auth_data.data.role[0] === "professor")  //we come from login
          ){

            console.log(location.state);

            setAuth(true);

            const credentials = {
              userId: auth_data.data.id,
              group: auth_data.data.group,
              email: auth_data.data.email
            }

            setUser(credentials);
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
            (location.state === "changeRole" && auth_data.data.role.includes("professor")) || //we come from my roles page
            (location.state ==="login" && auth_data.data.role[0] === "professor")  //we come from login
          ){

            console.log(location.state);

            setAuth(true);

            const credentials = {
              userId: auth_data.data.id,
              group: auth_data.data.group,
              email: auth_data.data.email
            }

            setUser(credentials);
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
      if(auth) authUser();
      
    }, 3600000);
    
    return () => clearInterval(interval);
  }, [auth]);

  //get all the students ids that this professor is supervising
  useEffect(() => {
    const supervisedTheses = async () => {
      await axios.get('/assigned_theses/supervised/'+user.userId)
      .then((res) => {
        console.log(res.data)
        var students=res.data.map((elem) => {return elem.student})
        setMyStudents(students)
      })
      .catch(() => {
        console.log("Errooor")
      })
    }

    if(user.userId!=='')
      supervisedTheses()
  }, [user.userId])


  const userNotAuthorized = () => {
    return (
      <NotAuthorizedPage />
    );
  }

  const userAuthorized = () => {
    return (
      <div id="wrapper">
        <Sidebar onSelect={page => setPage(page)} userId={user.userId}/>
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <Topbar userId={user.userId} email={user.email} onSelect={page => setPage(page)}/>
            <div className="container-fluid">
              {/* <span>{user.userId}</span> <hr /> */}
              <b><p className="text-gray-800">{page !== "Chat" ? page : null }</p></b>
              <div className='new-thesis-content'>
                {(page === "Dashboard") ? <ProfessorDashboard userId={user.userId} myStudents={myStudents} setPage={setPage}/> : null}
                {(page === "New Thesis") ? <NewThesisForm userId={user.userId} email={user.email} /> : null}
                {(page === "Assigned Theses") ? <AssignedThesesTable userId={user.userId} /> : null}
                {(page === "Supervise Theses") ? <SuperviseThesesTable userId={user.userId} email={user.email}/> : null}
                {(page === "Theses Requests") ? <ThesesRequestsTable userId={user.userId} email={user.email} thesesRequest={thesesRequest} requestAction={(request) => setThesesRequest(request)} /> : null}
                {(page === "Theses Archive") ? <ThesesTable userId={user.userId} userGroup={"Professor"} /> : null}
                {(page === "My Roles") ? <MyRoles userId={user.userId}  currentRole="professor"/> : null}
                {(page === "My Calendar") ? <Calendar userId={user.userId}/> : null}
                {(page === "Chat") ? <Chat userId={user.userId} role="professor"/> : null}
              </div>
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

export default ProfessorPage;
