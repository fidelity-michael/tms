import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  BottomSidebar,
  SidebarLink,
  StudentSidebarLinks,
  TopSidebar,
} from "./options";

export default function SecretariatSidebar(props) {
  const [selectedChat, setSelectedChat] = useState("");

  //for sockets
  const socketRef = useRef(null);
  const ENDPOINT = "http://localhost:8080/chat";

  //we establish connection with endpoint
  useEffect(() => {
    function notifyChatIcon() {
      if (selectedChat !== "Chat")
        document.getElementById("chatCircle").style =
          "display: block !important";
    }

    //check if there are unread messages
    const checkUnread = async () => {
      await axios
        .get("/chat/privateConversation/" + props.userId)
        .then((res) => {
          console.log(res.data);

          if (props.page !== "Chat") {
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

  useEffect(() => {
    function notifyChatIcon() {
      if (selectedChat !== "Chat")
        document.getElementById("chatCircle").style =
          "display: block !important";
    }

    if (socketRef.current)
      socketRef.current.on("chat:privateMessage", () => {
        notifyChatIcon();
      });

    //cleanup events
    // return () => {
    //   // socketRef.current.off("chat:privateMessage")
    // };
  }, [selectedChat, socketRef.current]);

  function hideNotifyChatIcon() {
    document.getElementById("chatCircle").style = "display: none !important";
  }

  const handleSelect = (label) => {
    props.onSelect(label);
  };

  return (
    <div className="tw-sticky tw-top-0 tw-flex tw-flex-col tw-h-screen tw-py-5 tw-w-80">
      <TopSidebar props={props} />
      <div className="tw-flex tw-flex-col tw-pl-1 tw-gap-6 tw-pt-8 tw-border-t-4 tw-border-light-pale-blue-white">
        {StudentSidebarLinks.map((item) => (
          <SidebarLink
            key={item.key}
            item={item}
            props={{
              onSelect: handleSelect,
              isSelected: props.selectedItem === item.label,
            }}
          />
        ))}
      </div>
      <BottomSidebar />
    </div>
  );
}

/* function StudentSidebar(props) {
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
          console.log(res.data);

          if (props.page !== "Chat") {
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

  useEffect(() => {
    function notifyChatIcon() {
      if (selected !== "Chat")
        document.getElementById("chatCircle").style =
          "display: block !important";
    }

    // TODO: Fix emits and on events
    if (socketRef.current)
      socketRef.current.on("chat:privateMessage", () => {
        notifyChatIcon();
      });

    //cleanup events
    // return () => {
    //   // socketRef.current.off("chat:privateMessage")
    // };
  }, [selected, socketRef.current]);

  function hideNotifyChatIcon() {
    document.getElementById("chatCircle").style = "display: none !important";
  }

  return (
    <ul
      className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"
      id="accordionSidebar"
    >
      <div className="sidebar-brand d-flex " href="#/">
        <i
          className="fas fa-graduation-cap"
          style={{ marginTop: "0.25rem" }}
        ></i>
        <div id="home" style={{ marginLeft: "0.3rem" }}>
          Student
        </div>
      </div>

      <li
        className="nav-item side"
        id="Dashboard"
        onClick={(e) => {
          props.onSelect("Dashboard");
          setSelected("Dashboard");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fas fa-fw fa-home"></i>
          </div>

          <span className="spanSidebar">Dashboard</span>
        </div>
      </li>

      <li
        className="nav-item side"
        id="Favourite Areas"
        onClick={(e) => {
          props.onSelect("Favourite Areas");
          setSelected("Favourite Areas");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="far fa-fw fa-heart"></i>
          </div>

          <span className="spanSidebar">Favourite Areas</span>
        </div>
      </li>

      <li
        className="nav-item side"
        id="Favourite Areas"
        onClick={(e) => {
          props.onSelect("Available Theses");
          setSelected("Available Theses");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fas fa-fw fa-clipboard-list"></i>
          </div>

          <span className="spanSidebar">Available Theses</span>
        </div>
      </li>

      <li
        className="nav-item side"
        id="Requests Approved"
        onClick={(e) => {
          props.onSelect("Requests Approved");
          setSelected("Requests Approved");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fa fa-fw fa-clipboard-check"></i>
          </div>

          <span className="spanSidebar">Requests Approved</span>
        </div>
      </li>

      <li
        className="nav-item side"
        id="My Thesis"
        onClick={(e) => {
          props.onSelect("My Thesis");
          setSelected("My Thesis");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="fa fa-fw fa-folder-open"></i>
          </div>

          <span className="spanSidebar">My Thesis</span>
        </div>
      </li>

      <li
        className="nav-item side"
        id="My Reports"
        onClick={(e) => {
          props.onSelect("My Reports");
          setSelected("My Reports");
        }}
      >
        <div className="nav-link" style={{ cursor: "pointer" }}>
          <div className="imgSidebar">
            <i className="far fa-clipboard"></i>
          </div>

          <span className="spanSidebar">My Reports</span>
        </div>
      </li>

      <li
        className="nav-item side"
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

          <span className="spanSidebar">Chat</span>
          <i className="fas fa-circle chatNotification" id="chatCircle"></i>
        </div>
      </li>
    </ul>
  );
}

export default StudentSidebar; */
