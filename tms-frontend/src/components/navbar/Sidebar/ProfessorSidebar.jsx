import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./sidebar.css";
import {
  TopSidebar,
  ProfessorSidebarLinks,
  SidebarLink,
  BottomSidebar,
} from "./options";

function ProfessorSidebar(props) {
  const [selected, setSelected] = useState("");
  const [notifyIcon, setNotifyIcon] = useState(false);

  //for sockets
  const socketRef = useRef(null);
  const ENDPOINT = "http://localhost:8080/chat";

  //we establish connection with endpoint
  useEffect(() => {
    function notifyChatIcon() {
      setNotifyIcon(true);
      /* if (selected !== "Chat")
        document.getElementById("chatCircle").style =
          "display: block !important"; */
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
  useEffect(() => {
    function notifyChatIcon() {
      setNotifyIcon(true);
      /* if (selected !== "Chat")
        document.getElementById("chatCircle").style =
          "display: block !important"; */
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

  const handleSelect = (label) => {
    props.onSelect(label);
    if (label === "Chat") setNotifyIcon(false);
  };

  return (
    <div className="tw-sticky tw-top-0 tw-flex tw-flex-col tw-h-screen tw-py-5 tw-w-80">
      <TopSidebar props={props} />
      <div className="tw-flex tw-flex-col tw-pl-1 tw-gap-6 tw-pt-8 tw-border-t-4 tw-border-light-pale-blue-white">
        {ProfessorSidebarLinks.map((item) => (
          <SidebarLink
            key={item.key}
            item={item}
            props={{
              onSelect: handleSelect,
              isSelected: props.selectedItem === item.label,
              notifyIcon: notifyIcon,
            }}
          />
        ))}
      </div>
      <BottomSidebar
        button={true}
        onSelect={() => props.onSelect("New Thesis")}
      />
    </div>
  );
}

export default ProfessorSidebar;
