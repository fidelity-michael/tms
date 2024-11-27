import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import MyNotifications from '../../content/MyNotifications';
import axios from 'axios';

export default function ProfessorTopbar(props) {

    const [notifications, setNotifications] = useState([]);
    const [badge, setBadge] = useState(0);
    const navigate = useNavigate();

    // const [windowHeight, setHeight] = useState(window.innerHeight);
    const [windowWidth, setWidth] = useState(window.innerWidth);

    window.addEventListener('resize', function() {
        // viewport and full window dimensions will change
        // setHeight(window.innerHeight);
        setWidth(window.innerWidth);
    });

    function logout(target) {
        //clear all localstorage
        localStorage.clear();
        sessionStorage.clear();
        axios.post('/api/auth/logout')
            .then(data => {
                // console.log("User should be logged out!");
                navigate("/");
            })
            .catch(err => {
                console.log("An error occurred: User is not logged out")
            });
    }

    function resetBadge(){
        if(document.getElementById("myNotifications").style.display==="block"){
            document.getElementById("myNotifications").style.display="none"
        } else {
            document.getElementById("myNotifications").style.display="block"

            if (notifications.length > 0) {
                setBadge(0);
    
                //set as read all the unread notifications
                for (var i = 0; i < notifications.length; i++) {
                    console.log(i)
                    if (notifications[i].status === "sent") {
                        axios.patch('/notifications/' + notifications[i]._id, {
                            attr: "status",
                            value: "read"
                        })
                            // .then(() => {
                            //     console.log("Notifications updated!");
                            // })
                            .catch((err) => {
                                console.log(err);
                            });
                    } else {
                        
                        break
                    }
                }
            }
        }
        
    }

    return (
        <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            {/* <h5 className='app-header'>Thesis Management System</h5> */}
            {windowWidth > 600 ? <h5 className='app-header'>Thesis Management System</h5> : <h5 className='app-header'>T M S</h5>}
            <ul className="navbar-nav ml-auto">
                <li className="nav-item dropdown no-arrow mx-1" >


                    <div className="nav-link dropdown-toggle" href="#/" id="alertsDropdown" role="button" onClick={() => resetBadge()} aria-haspopup="true" aria-expanded="false">
                        <i className="fas fa-bell fa-fw bell-icon"></i>
                        {badge > 0 && <span className="badge badge-danger badge-counter">{badge > 0 ? (badge > 9 ? "9+" : badge) : null}</span>}
                    </div>
                    <div id="myNotifications" className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in" style={{display: "none"}}>
                        <MyNotifications userId={props.userId} notifications={notifications} setNotifications={setNotifications} badge={badge} setBadge={setBadge} />
                    </div>
                </li>

                <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#/Profile" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {/* <span className="mr-2 d-lg-inline text-gray-600 medium profile-name">Professor</span> */}
                        <span className="mr-2 d-lg-inline text-gray-600 medium profile-name">{props.email.length > 0 ? props.email : "Professor"}</span>
                    </a>
                    <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                        <a className="dropdown-item" onClick={(e) => { props.onSelect("My Roles"); }}>
                            <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400" ></i>
                            My Roles
                        </a>
                        <a className="dropdown-item" onClick={(e) => { props.onSelect("My Calendar"); }}>
                            <i className="far fa-calendar-alt fa-fw mr-2 text-gray-400" ></i>
                            My Calendar
                        </a>
                        <a className="dropdown-item">
                            <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                            Settings
                        </a>
                        <a className="dropdown-item">
                            <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                            Activity Log
                        </a>
                        <div className="dropdown-divider"></div>
                        <a className="dropdown-item" data-toggle="modal" data-target="#logoutModal" onClick={(e) => logout(e.target)}>
                            <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                            Logout
                        </a>
                    </div>
                </li>

            </ul>

        </nav>
    )
}
