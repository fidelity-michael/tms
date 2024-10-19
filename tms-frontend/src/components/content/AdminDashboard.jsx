import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios';

function AdminDashboard({userId, setPage}) {

    const [events, setEvents] = useState([])
    const [loadingEvents, setLoadingEvents] = useState(true)

    const [theses, setTheses] = useState('') 
    const [activeTheses, setActiveTheses] = useState('') 
    const [archivedTheses, setArchivedTheses] = useState('') 
    const [completedTheses, setCompletedTheses] = useState('') 
    const [gradedTheses, setGradedTheses] = useState('') 

    const [users, setUsers] = useState('') 
    const [students, setStudents] = useState('')
    const [professors, setProfessors] = useState('')
    const [admins, setAdmins] = useState('')
    const [secretariats, setSecretariats] = useState('')
    

    const componentIsMounted = useRef(true);

    useEffect(() => {
        const getActiveTheses = async () => {
            axios.get('/assigned_theses')
            .then((res) => {

                var activeTheses = 0;
                var archivedTheses = 0;
                var completedTheses = 0;
                var gradedTheses = 0;

                Array.isArray(res.data) && res.data.map((thesis) => {
                    if(thesis.status === "active"){
                        ++activeTheses
                    } else if(thesis.status === "archived"){
                        ++archivedTheses
                    } else if(thesis.status === "graded"){
                        ++gradedTheses
                    } else if(thesis.status === "completed"){
                        ++completedTheses
                    }
                })

                setTheses(res.data.length)
                setActiveTheses(String(activeTheses))
                setArchivedTheses(String(archivedTheses))
                setGradedTheses(String(gradedTheses))
                setCompletedTheses(String(completedTheses))
            })
            .catch((err) => console.log(err))
        }

        const getUsers = async () => {
            axios.get('/api/users')
            .then((res) => {
                console.log(res.data.results)
                setUsers(res.data.total)

                var studentsNumber = 0
                var professorsNumber = 0
                var adminsNumber = 0
                var secretariatsNumber = 0

                Array.isArray(res.data.results) && res.data.results.map((user) => {
                    user.role.map((role) => {
                        if(role === "student"){
                            ++studentsNumber
                        } else if(role === "professor"){
                            ++professorsNumber
                        } else if(role === "secretariat"){
                            ++secretariatsNumber
                        } else if(role === "administrator"){
                            ++adminsNumber
                        }
                    })
                })
                
                setStudents(String(studentsNumber))
                setProfessors(String(professorsNumber))
                setSecretariats(String(secretariatsNumber))
                setAdmins(String(adminsNumber))
            })
            .catch((err) => console.log(err))
        }

        if(componentIsMounted.current){
            getActiveTheses()
            getUsers()
        }
            

        return () => {
            componentIsMounted.current = false
        }
    }, []);

    
    useEffect(() => {
        const getEvents = async ()  => {
            setLoadingEvents(true)
            await axios.get('/calendarEvents/'+userId)
            .then((res) => {
                console.log(res.data)
                sortByDate(res.data)
                setEvents(res.data)
                setLoadingEvents(false)
            })
            .catch(() => {
                console.log("Server Internal error occured!")
            })
        }

        const sortByDate= async (myEvents) => {
            Array.isArray(myEvents) && myEvents.sort((a, b) => {
                var c = new Date(a.date);
                var d = new Date(b.date);
                return c-d;
            });

            console.log(myEvents)
        }
        
        if (componentIsMounted.current && userId) {
            getEvents()
        }
            
    }, [userId])

    function renderUpcomingEvents(){
        var currentDate = Date.now();
        var lastEventDate = new Date(events[events.length-1].date)

        if(lastEventDate<currentDate){
            return(
                <p>No upcoming events</p>
            )
        } else {
            return(
                <ul>
                    {   
                        Array.isArray(events) && events.map((ev) => {
                            var date = new Date(ev.date)
                            
    
                            if(date>currentDate){
                                var formattedDate = date.toLocaleDateString();
            
                                var minutes = date.getMinutes();
                                var hours = date.getHours();
                
                                if (hours < 10) 
                                    hours = '0' + hours; 
                                if (minutes < 10) 
                                    minutes = '0' + minutes;
                                    
                                return(
                                    <li  key={ev._id} className="liEvents">
                                        <b> {ev.title} </b> at <b> {hours}:{minutes} {formattedDate}</b>
                                    </li>
                                )
                            }
                            
                        })
                    }
                </ul>
               
            )   
        }        
    }

    function loading() {
        return (
          <p className='animated headShake infinite' style={{ marginBottom: '-0.1rem' }}>Loading...</p>
          
        );
    }

    return (
        <div>
            <div style={{display: "inline-block"}}>
                <div className="dashboardAdminDiv z-depth-2" type="button" style={{float:"left"}}>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Users")}}><b>Users</b>: {users}</h3>
                    <h5>Roles:</h5>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Users")}}>Students: {students}</h3>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Users")}}>Professors: {professors}</h3>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Users")}}>Secretariats: {secretariats}</h3>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Users")}}>Administrators: {admins}</h3>
                </div>

                <div className="dashboardAdminDiv z-depth-2" type="button" style={{float:"left"}}> 
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Assigned Theses")}}><b>Theses: </b>{theses}</h3>
                    <h5>Status:</h5>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Assigned Theses")}}>Active: {activeTheses}</h3>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Assigned Theses")}}>Completed: {completedTheses}</h3>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Assigned Theses")}}>Graded: {gradedTheses}</h3>
                    <h3 className="adminDashboardInfo" onClick={() => {setPage("Assigned Theses")}}>Archived: {archivedTheses}</h3>
                </div>
            </div>
            
            <div className="dashboardEventsDiv z-depth-2" type="button" onClick={() => {setPage("My Calendar")}}>
                <h3><b>Upcoming Events: </b></h3>
                {loadingEvents ? 
                    loading()
                : 
                    (events.length ? renderUpcomingEvents() : <p>No upcoming events</p>)
                }
            </div>
        </div>
    )
}

export default AdminDashboard
