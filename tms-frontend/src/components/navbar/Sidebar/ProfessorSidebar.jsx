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

  // NOTE: First
  useEffect(() => {
    function notifyChatIcon() {
      setNotifyIcon(true);
    }

    if (socketRef.current) {
      socketRef.current.off("chat:privateMessage");
      socketRef.current.on("chat:privateMessage", () => {
        notifyChatIcon();
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("chat:privateMessage");
      }
    };
  }, [props.selectedItem]);

  // NOTE: Second
  useEffect(() => {
    if (props.userId && socketRef.current == null) {
      socketRef.current = io(ENDPOINT);

      socketRef.current.on("connect", () => {
        console.log("Sidebar connected to chat server!");
        socketRef.current.emit("chat:map", props.userId);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Sidebar disconnected from chat server.");
      });
    }

    const checkUnread = async () => {
      try {
        const res = await axios.get(
          `/chat/privateConversation/${props.userId}`,
        );
        if (props.selectedItem !== "Chat") {
          const hasUnread = res.data.some(
            (conversation) =>
              conversation.lastMessage.sender !== props.userId &&
              conversation.lastMessage.read.length === 0,
          );
          if (hasUnread) setNotifyIcon(true);
        }
      } catch (error) {
        console.error("Error fetching unread messages", error);
      }
    };

    if (props.userId) {
      checkUnread();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [ENDPOINT, props.userId]);

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
