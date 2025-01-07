import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import {
  BottomSidebar,
  SidebarLink,
  StudentSidebarLinks,
  TopSidebar,
} from "./options";

export default function StudentSidebar(props) {
  const [selectedChat, setSelectedChat] = useState("");
  const [notifyIcon, setNotifyIcon] = useState(false);

  const socketRef = useRef(null);
  const ENDPOINT = `http://${import.meta.env.VITE_HOST}:8080/chat`;

  // Initialize socket connection
  useEffect(() => {
    if (socketRef.current == null && props.userId) {
      socketRef.current = io(ENDPOINT);

      socketRef.current.on("connect", () => {
        console.log("Sidebar connected to chat server!");
        socketRef.current.emit("chat:map", props.userId);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Sidebar disconnected from chat server.");
      });
    } else {
      console.log("NEVER GOES INSIDE IF YEAH?");
      if (!socketRef.current) {
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [ENDPOINT, props.userId]);

  // Attach event listeners
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

  // Check unread messages
  useEffect(() => {
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
  }, [props.userId, props.selectedItem]);

  const handleSelect = (label) => {
    props.onSelect(label);
    if (label === "Chat") setNotifyIcon(false);
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
              notifyIcon: notifyIcon,
            }}
          />
        ))}
      </div>
      <BottomSidebar />
    </div>
  );
}
