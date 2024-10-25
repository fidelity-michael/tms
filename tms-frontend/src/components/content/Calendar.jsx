import React, { useState, useEffect } from 'react'
import axios from 'axios';
import CalendarEventModal from '../../components/content/CalendarEventModal'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import Tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

function Calendar({userId}) {

    const [showCalendar, setShowCalendar] = useState(false);
    const [events, setEvents] = useState([]);
    
    useEffect(() => {
        const getEvents = async ()  => {
            await axios.get('/api/calendarEvents/'+userId)
            .then((res) => {
                console.log(res.data)
                setEvents(res.data)
            })
            .catch(() => {
                console.log("Server Internal error occured!")
            })
        }

        if(userId){
            getEvents()
        }

    }, [userId])

    function fetchEvents(events){
        setEvents(events)
    }

    const handleMouseEnter = (arg) =>{
        Tippy(arg.el, {
            content: arg.event._def.title + " at " + arg.timeText
        });
        console.log(arg)
    }

    return (
        <div>
            <button className="btn btn-info calendarBtn" onClick={() => {setShowCalendar(true)}}>New Event</button>
            
            <div className="calendarContainer" >
                <FullCalendar
                    events={events}
                    plugins={[ dayGridPlugin ]}
                    initialView="dayGridMonth"
                    eventDidMount={handleMouseEnter}
                />
            </div> 
            
            <CalendarEventModal 
                userId={userId} 
                show={showCalendar} 
                fetchEvents={fetchEvents}
                onShow={(data) => setShowCalendar(data)} 
            />
        </div>
    )
}

export default Calendar
