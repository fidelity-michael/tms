import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./content.css";
import io from "socket.io-client";

export default function MyNotifications({
  userId,
  notifications,
  setNotifications,
  badge,
  setBadge,
}) {
  const [allOrLess, setAllOrLess] = useState("all"); //indicates if we have to show more or less next
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const componentIsMounted = useRef(true);

  //for sockets
  const socketRef = useRef(null);

  useEffect(() => {
    return () => {
      componentIsMounted.current = true;
      // componentIsMounted.current = false
    };
  }, []);

  //we establish connection with endpoint
  useEffect(() => {
    if (userId) {
      if (socketRef.current == null) {
        //current will persist for the full lifetime of the component
        socketRef.current = io(`http://${import.meta.env.HOST}:8080/notification`); // notification namespace
      }

      socketRef.current.on("connect", () => {
        console.log("Connected to notifications!", userId);
        socketRef.current.emit("notification:map", userId);

        //Register on new notification event
        socketRef.current.on("notification:newNotification", () => {
          fetchNotifications();
          setBadge(++badge);
        });
      });

      socketRef.current.on("disconnect", () => {
        console.log("Disonnected from notifications!");
      });

      // TODO: Check clean up functionality with sockets
      // cleanup (disconnect from chat server)
      // return () => {
      //   if (socketRef.current) {
      //     socketRef.current.disconnect();
      //     socketRef.current.close();
      //   }
      // };
    }
  }, [userId]);

  useEffect(() => {
    if (userId.length) {
      fetchNotifications();
      console.log("fetched");
    }
  }, [allOrLess, userId]);

  useEffect(() => {
    if (componentIsMounted.current) {
      let counter = 0;
      notifications.map((notification, index) => {
        if (notification.status === "sent") counter++;
        return index;
      });

      setBadge(counter);
      console.log("showBadge", counter);
    }
  }, [notifications]);

  async function fetchNotifications() {
    try {
      var notifications_data;
      setLoadingNotifications(true);

      if (allOrLess === "all") {
        notifications_data = await axios.get("/notifications/some/" + userId);
      } else {
        //fetch all notifications
        notifications_data = await axios.get("/notifications/all/" + userId);
      }

      console.log("Notifications: ", notifications_data);

      if (componentIsMounted.current) {
        if (notifications_data.data.length > 0) {
          setNotifications(notifications_data.data);
        }
        setLoadingNotifications(false);
      }
    } catch (err) {
      console.log("Server internal error occurred!");
    }
  }

  async function toggleShowMore() {
    if (allOrLess === "all") {
      setAllOrLess("less");
    } else {
      setAllOrLess("all");
    }
  }

  function renderNotifications() {
    return notifications.map((notification, index) => {
      const { _id, title, message, type, date } = notification;
      return (
        <div key={_id} className="notification">
          <div
            className="dropdown-item d-flex align-items-center"
            style={{ cursor: "default" }}
          >
            <div className="mr-3">
              {type === "new" ? (
                <div className="icon-circle bg-default">
                  <i className="fas fa-file-alt text-white"></i>
                </div>
              ) : type === "info" ? (
                <div className="icon-circle bg-info">
                  <i className="fas fa-info text-white"></i>
                </div>
              ) : type === "alert" ? (
                <div className="icon-circle bg-warning">
                  <i className="fas fa-exclamation-triangle text-white"></i>
                </div>
              ) : (
                <div className="icon-circle bg-danger">
                  <i className="fas fa-bug text-white"></i>
                </div>
              )}
            </div>
            <div>
              <div className="small text-gray-500">
                <span style={{ fontSize: "0.85rem" }}>
                  {new Intl.DateTimeFormat("en-GB", {
                    year: "numeric",
                    month: "numeric",
                    day: "2-digit",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    hour12: false,
                  }).format(new Date(date))}
                </span>
              </div>
              <span style={{ color: "#528bba", fontWeight: "500" }}>
                <b>{title}</b>
              </span>
              <p
                style={{
                  color: "#609ed1",
                  fontWeight: "500",
                  maxWidth: "50vw",
                  overflowWrap: "break-word",
                }}
              >
                {message}
              </p>
            </div>
          </div>
        </div>
      );
    });
  }

  function loadingData() {
    return (
      <div
        className="d-flex justify-content-center"
        style={{ marginTop: "0.5rem" }}
      >
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  function emptyData(e) {
    return (
      <h5
        className="empty-data"
        style={{
          color: "#8c8d8f",
          marginTop: "0.2rem",
          borderLeft: "1px solid #e8eaed",
          borderRight: "1px solid #e8eaed",
        }}
      >
        There are no notifications yet
      </h5>
    );
  }

  return (
    <div className="notifications-wrapper">
      <h6 className="dropdown-header">
        Notifications Center
        {/* <br /> Timer : {seconds} */}
      </h6>
      <div style={{ height: "0.05rem", borderLeft: "1px solid #e8e3e3" }}></div>
      <div className="notifications-content">
        {loadingNotifications
          ? loadingData()
          : notifications.length
            ? renderNotifications()
            : emptyData()}
        <a
          className="dropdown-item text-center small text-gray-500"
          onClick={() => toggleShowMore()}
        >
          {allOrLess === "all" ? <b>Show All</b> : <b>Show Less</b>}
        </a>
      </div>
      <div style={{ height: "0.2rem", backgroundColor: "#e8e3e3" }}></div>
    </div>
  );
}
