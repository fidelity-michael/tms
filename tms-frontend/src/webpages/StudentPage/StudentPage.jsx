import React, { useState, useEffect } from 'react';
import { useLocation } from "react-router-dom";
import axios from 'axios';
import NotAuthorizedPage from '../NotAuthorizedPage/NotAuthorizedPage';
import Topbar from '../../components/navbar/Topbar/StudentTopbar';
import Sidebar from '../../components/navbar/Sidebar/StudentSidebar';
import FavouritesTable from '../../components/content/FavouritesTable';
import FavouriteCarousel from '../../components/content/FavouritesCarousel';
import AvailableThesesTable from '../../components/content/AvailableThesesTable';
import RequestsApprovedTable from '../../components/content/RequestsApprovedTable';
import MyThesis from '../../components/content/MyThesis';
import MyReports from '../../components/content/MyReports';
import NewReport from '../../components/forms/ProgressForm/NewReport';
import Footer from '../../components/footer/Footer';
import MyRoles from '../../components/content/MyRoles';
import Chat from '../../components/content/Chat';
import Calendar from '../../components/content/Calendar'
import StudentDashboard from '../../components/content/StudentDashboard'



function StudentPage() {

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

  const [thesesApplied, setThesesApplied] = useState([]);
  const [thesisAssigned, setThesisAssigned] = useState(null);
  const [thesisData, setThesisData] = useState("");
  const [thesisCompleted, setThesisCompleted] = useState(false);

  const [favourites, setFavourites] = useState([]);

  const [newReport, toggleNewReport] = useState(false);


  useEffect(() => {
    
    const authUser = async () => {
      try {
        const auth_data = await axios.get('/auth/authorization');
        // console.log(auth_data.data);
        if (auth_data.data.auth) {
          if(
            (location.state === "changeRole" && auth_data.data.role.includes("student")) || //we come from my roles page
            (location.state ==="login" && auth_data.data.role[0] === "student")             //we come from login
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
        console.log(auth_data.data);
        if (auth_data.data.auth) {

          if(
            (location.state === "changeRole" && auth_data.data.role.includes("student")) || //we come from my roles page
            (location.state ==="login" && auth_data.data.role[0] === "student")  //we come from login
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


  useEffect(() => {

    const fetchRequests = async () => {
      const requests_data = await axios.get('/api/theses_requests');
      // console.log("All requests: ", requests_data.data.results);
      if (requests_data.data.results.length > 0) {
        const user_requests = requests_data.data.results.filter(request => request.student === user.userId);
        user_requests.map(request => {
          return setThesesApplied(previousTheses => [...previousTheses, request]);
        })
      }

      if (user.userId.length > 0) {
        const thesis_data = await axios.get('/api/my_thesis/' + user.userId);

        //console.log("Thesis: ", thesis_data.data);
        setThesisAssigned(thesis_data.data.thesis._id);
        setThesisData(thesis_data.data);
        

        if (thesis_data.data.thesis.status === "completed")
          setThesisCompleted(true);
      }
    }

    const fetchFavourites = async () => {
      if (user.userId.length > 0) {
        const favourites_data = await axios.get('/api/favourites/' + user.userId);
        // console.log("Favourites: ", favourites_data.data);
        if (favourites_data.data.length > 0) {
          setFavourites(favourites_data.data);
        }
      }
    }

    fetchRequests();
    fetchFavourites();
  }, [user]);
  

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
            <Topbar userId={user.userId} email={user.email} onSelect={page => setPage(page)} />
            <div className="container-fluid">
              {/* <span>{user.userId}</span> <hr /> */}
              <b><p className="text-gray-800">{page !== "Chat" ? page : null }</p></b>
              <div className='favourites-content'>
                {(page === "Dashboard") ? <StudentDashboard userId={user.userId} thesisData={thesisData} setPage={setPage}/> : null}
                {(page === "Favourite Areas") ?

                  <div>
                    <FavouriteCarousel userId={user.userId} studentFavourites={favourites} />
                    <FavouritesTable userId={user.userId} studentFavourites={(favourites) => setFavourites(favourites)} />
                  </div>

                : null}
                {(page === "Available Theses") ? 
                  <AvailableThesesTable 
                    userId={user.userId} 
                    group={user.group}
                    email={user.email}
                    thesesApplied={thesesApplied}
                    thesisAssigned={thesisData}
                    setThesesApplied={setThesesApplied} 
                  /> 
                : null}
                {(page === "Requests Approved") ? 
                  <RequestsApprovedTable 
                    userId={user.userId} 
                    email={user.email}
                    thesisAssigned={thesisAssigned}
                    assignThesis={(thesis) => setThesisAssigned(thesis)} updateThesisData={(data) => setThesisData(data)} 
                  /> 
                : null}
                {(page === "My Thesis") ?
                  thesisAssigned && thesisAssigned.length > 0 ?
                      <MyThesis userId={user.userId} thesisAssigned={thesisData}/>
                    :
                    <div>
                      <h5>There is no assigned thesis yet</h5>
                    </div>
                  : null}
                {(page === "My Reports") ?
                    <div>
                      <div className="btn-group" role="group" aria-label="Button group with nested dropdown">
                        <button type="button" className="btn btn-light user-btn" onClick={(e) => toggleNewReport(false)}>My Reports</button>
                        <button type="button" className="btn btn-info user-btn new" onClick={(e) => toggleNewReport(true)} disabled={thesisCompleted}>New Report</button>
                      </div>
                      {!newReport && <MyReports userId={user.userId} user={"student"} />}
                      {newReport && <NewReport  userId={user.userId} thesisCompleted={thesisCompleted} onSubmitThesis={(data) => setThesisCompleted(data)} 
                                                thesisData={thesisData} email={user.email}/>
                      }
                    </div>
                  : null}
                {(page === "My Roles") ? <MyRoles userId={user.userId}  currentRole="student"/> : null}
                {(page === "My Calendar") ? <Calendar userId={user.userId}/> : null}
                {(page === "Chat") ? <Chat  userId={user.userId} role="student"/> : null}
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

export default StudentPage;
