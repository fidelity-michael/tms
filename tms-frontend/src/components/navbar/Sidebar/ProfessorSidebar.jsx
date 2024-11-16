import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./sidebar.css";

function ProfessorSidebar(props) {
  const [selected, setSelected] = useState("");

  //for sockets
  const socketRef = useRef(null);
  const ENDPOINT = "http://localhost:8080/chat";

  //we establish connection with endpoint
  useEffect(() => {
    function notifyChatIcon() {
      if (selected !== "Chat")
        document.getElementById("chatCircle").style =
          "display: block !important";
    }

    //check if there are unread messages
    const checkUnread = async () => {
      await axios
        .get("/chat/privateConversation/" + props.userId)
        .then((res) => {
          console.log(res.data, selected);

          if (selected !== "Chat") {
            for (var i = 0; i < res.data.length; i++) {
              if (
                res.data[i].lastMessage.sender !== props.userId &&
                res.data[i].lastMessage.read.length === 0
              ) {
                notifyChatIcon();
                break;
              }
            }
          }
        })
        .catch(() => {
          console.log("Errooor");
        });
    };

    if (props.userId) {
      if (socketRef.current == null) {
        //current will persist for the full lifetime of the component
        socketRef.current = io(ENDPOINT);
      }

      checkUnread();

      socketRef.current.on("connect", () => {
        console.log("Sidebar connected to chat server!");
        socketRef.current.emit("chat:map", props.userId);
      });

      //cleanup (disconnect from chat server)
      // return () => {
      //   if (socketRef.current) {
      //     socketRef.current.disconnect();
      //     socketRef.current.close();
      //   }
      // };
    }
  }, [ENDPOINT, props.userId]);
  // TODO: Fix emits and on events
  useEffect(() => {
    function notifyChatIcon() {
      if (selected !== "Chat")
        document.getElementById("chatCircle").style =
          "display: block !important";
    }

    if (socketRef.current)
      socketRef.current.on("chat:privateMessage", () => {
        notifyChatIcon();
      });

    //cleanup events
    // return() => {
    //   socketRef.current.off("chat:privateMessage")
    // }
  }, [selected, socketRef.current]);

  function hideNotifyChatIcon() {
    document.getElementById("chatCircle").style = "display: none !important";
  }

  return (
    <ul
      className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
      id="accordionSidebar"
    >
      <div className="sidebar-brand d-flex" href="#/">
        <i className="fas fa-user-tie" style={{ marginTop: "0.2rem" }}></i>
        <div style={{ marginLeft: "0.7rem" }}>Professor</div>
      </div>

      <li
        className="nav-item"
        onClick={(e) => {
          props.onSelect("Dashboard");
          setSelected("Dashboard");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fas fa-fw fa-home"></i>
          </div>

          <span>Dashboard</span>
        </div>
      </li>

      <li
        className="nav-item"
        onClick={(e) => {
          props.onSelect("New Thesis");
          setSelected("New Thesis");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fa fa-fw fa-folder-plus"></i>
          </div>

          <span>New Thesis</span>
        </div>
      </li>

      <li
        className="nav-item"
        onClick={(e) => {
          props.onSelect("Assigned Theses");
          setSelected("Assigned Theses");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fas fa-fw fa-folder-open"></i>
          </div>

          <span>Assigned Theses</span>
        </div>
      </li>

      <li
        className="nav-item"
        onClick={(e) => {
          props.onSelect("Supervise Theses");
          setSelected("Supervise Theses");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fas fa-fw fa-glasses"></i>
          </div>

          <span>Supervise Theses</span>
        </div>
      </li>

      <li
        className="nav-item"
        onClick={(e) => {
          props.onSelect("Theses Requests");
          setSelected("Theses Requests");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fas fa-fw fa-envelope"></i>
          </div>

          <span>Theses Requests</span>
        </div>
      </li>

      <li
        className="nav-item"
        onClick={(e) => {
          props.onSelect("Theses Archive");
          setSelected("Theses Archive");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fas fa-fw fa-archive"></i>
          </div>

          <span>Theses Archive</span>
        </div>
      </li>

      <li
        className="nav-item"
        onClick={(e) => {
          props.onSelect("Chat");
          hideNotifyChatIcon();
          setSelected("Chat");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="far fa-comments"></i>
          </div>

          <span>Chat</span>
          <i className="fas fa-circle chatNotification" id="chatCircle"></i>
        </div>
      </li>
    </ul>
  );
}

export default ProfessorSidebar;
