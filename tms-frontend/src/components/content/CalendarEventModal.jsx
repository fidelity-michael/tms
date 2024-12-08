import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import axios from "axios";
import Datetime from "react-datetime";
import "react-datetime/css/react-datetime.css";

function CalendarEventModal({ show, onShow, userId, fetchEvents }) {
  const [date, setDate] = useState("");

  async function saveNewEvent() {
    const title = document.getElementById("eventInput").value;

    if (!title) {
      document.getElementById("eventField").style = "display: block";
    }

    if (date === "") {
      document.getElementById("dateField").style = "display: block";
    }

    if (title && date !== "") {
      await axios
        .post("/api/calendarEvents", {
          userId: userId,
          title: title,
          date: date,
        })
        .then((res) => {
          console.log("Successfuly saved new event!", res.data);

          getEventsfromDB();

          document.getElementById("success").style = "display: block";
          document.getElementById("failed").style = "display: none";

          setTimeout(() => {
            if (document.getElementById("success"))
              document.getElementById("success").style = "display: none";
          }, 3000);

          document.getElementById("eventField").style = "display: none";
          document.getElementById("dateField").style = "display: none";

          //reset event field
          document.getElementById("eventInput").value = "";
        })
        .catch((err) => {
          document.getElementById("failed").style = "display: block";

          console.log("Server Internal error occured!");
        });
    }
  }

  const getEventsfromDB = async () => {
    await axios
      .get("/api/calendarEvents/" + userId)
      .then((res) => {
        fetchEvents(res.data);
      })
      .catch(() => {
        console.log("Server Internal error occured!");
      });
  };

  return (
    <Modal show={show} onHide={(e) => onShow(false)} animation={false}>
      <Modal.Header closeButton>
        <Modal.Title>New Event</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="tw-flex tw-flex-col tw-mb-4">
          <div>
            <label>Event Name:</label>
            <input className="form-control" id="eventInput"></input>
          </div>
          <p className="eventFieldInfo" id="eventField">
            Please fill in your event field
          </p>

          <div className="tw-my-4">
            <label>Date:</label>
            <Datetime
              value={date}
              onChange={(data) => {
                setDate(data._d);
              }}
              id="dateInput"
            />
          </div>
          <p className="eventFieldInfo" id="dateField">
            Please fill in your date field
          </p>

          <div className="tw-flex tw-justify-end tw-mb-4">
            <button
              className="tw-text-light-pale-blue-white tw-bg-dark-sky-blue hover:tw-bg-mid-pale-blue tw-font-semibold hover:tw-text-white tw-py-1 tw-px-2 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
              onClick={() => {
                saveNewEvent();
              }}
            >
              Add Event
            </button>
          </div>

          <div className="resultDiv">
            <p className="eventSaved" id="success">
              Event saved successfully!
            </p>
            <p className="eventFieldInfo" id="failed">
              Failed to save event.
            </p>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default CalendarEventModal;
