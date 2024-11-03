import React, { useEffect, useState, useRef } from 'react'
import axios from 'axios';

function StudentDashboard({userId, thesisData, setPage}) {

    const [events, setEvents] = useState([])
    const [loadingEvents, setLoadingEvents] = useState(true)
    const componentIsMounted = useRef(true);

    useEffect(() => {
        return () => {
            componentIsMounted.current = true
            // componentIsMounted.current = false
        }
    }, []);
    
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

    function loading() {
        return (
          <p className='animated headShake infinite' style={{ marginBottom: '-0.1rem' }}>Loading...</p>
          
        );
    }


    return (
        <div>
            
            <div className="dashboardThesisDiv z-depth-2" type="button" onClick={() => {setPage("My Thesis")}}>
                <h3>My Thesis: </h3>
                {   thesisData ? 
                        (thesisData.thesis!=='' ? 
                            <h2><b className="thesisTitleDashboard">{thesisData.thesis.title}</b> </h2> 
                        : <p>No thesis assigned</p>) 
                    : 
                        null
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

export default StudentDashboard
