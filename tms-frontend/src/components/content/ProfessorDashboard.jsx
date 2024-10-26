import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios';

function ProfessorDashboard({userId, myStudents, setPage}) {
    const [events, setEvents] = useState([])
    const [loadingEvents, setLoadingEvents] = useState(true)

    const [activeTheses, setActiveTheses] = useState([]) 
    const [loadingTheses, setLoadingTheses] = useState(true)

    const componentIsMounted = useRef(true);

    useEffect(() => {
        return () => {
            componentIsMounted.current = false
        }
    }, []);
    
    useEffect(() => {

        const getThesesAndStudents= async () => {

            try{
                setLoadingTheses(true)

                myStudents.map(async (studentId) => {

                    axios.get('/api/assigned_theses/assigned_thesis/'+studentId)
                    .then((res) => {

                        //if thesis is active
                        if(res.data.status === "active"){
                            axios.get('/api/theses/'+res.data.thesis)
                            .then((thesisRes) => {

                                axios.get('/api/data/users/'+studentId)
                                .then((studentRes) => {
                                    
                                    //data of thesis and student
                                    var obj = Object.assign({}, thesisRes.data[0], studentRes.data);
                                    setActiveTheses(previous => [...previous, obj]);

                                    setLoadingTheses(false)
                                })
                                .catch((err) => console.log('Server Internal Error occured!'))
                            })
                            .catch((err) => console.log('Server Internal Error occured!'))
                        } else {
                            setLoadingTheses(false)
                        }
                    })
                    .catch((err) => console.log('Server Internal Error occured!'))
                })

                    
            } catch {
                console.log('gsgs')
            } 

        }

        if(componentIsMounted.current){
            if(myStudents.length)
                getThesesAndStudents()
            else
                setLoadingTheses(false)
        }

    }, [myStudents])


    useEffect(() => {
        const getEvents = async ()  => {
            setLoadingEvents(true)
            await axios.get('/api/calendarEvents/'+userId)
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
            myEvents.sort(function(a, b) {
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
                        events.map((ev, index) => {
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
                                        <b>{ev.title}</b> at <b>{hours}:{minutes} {formattedDate}</b>
                                    </li>
                                )
                            }
                            
                        })
                    }
                </ul>
               
            )   
        }        
    }

    function renderActiveTheses(){
        if(activeTheses.length){
            return(
                <ul>
                    {   
                        activeTheses.map((thesis, index) => {
                            return(
                                <li  key={thesis._id} className="liEvents">
                                    {thesis.title}
                                    <br></br> 
                                    <b>{thesis.first_name} {thesis.last_name}, {thesis.email}</b>
                                    
                                </li>
                            )
                            
                        })
                    }
                </ul>
               
            )  

        } else {
            return(
                <p>No active theses</p>
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
            <div className="dashboardEventsDiv z-depth-2" type="button" onClick={() => {setPage("Assigned Theses")}}>
                <h3>Active Theses: </h3>
                {loadingTheses ? 
                    loading()
                : 
                    renderActiveTheses()
                }
            </div>

            <div className="dashboardEventsDiv z-depth-2" type="button" onClick={() => {setPage("My Calendar")}}>
                <h3>Upcoming Events: </h3>
                {loadingEvents ? 
                    loading()
                : 
                    (events.length ? renderUpcomingEvents() : <p>No upcoming events</p>)
                }
            </div>
        </div>
    )
}

export default ProfessorDashboard
