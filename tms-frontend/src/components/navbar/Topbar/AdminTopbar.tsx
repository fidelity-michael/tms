import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Fragment } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";
import MyNotifications from "../../content/MyNotifications";
import axios from "axios";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import ListIcon from "@mui/icons-material/List";
import LogoutIcon from "@mui/icons-material/Logout";
import clsx from "clsx";
import AcademicYear from "./AcademicYear";
import EmailBellComponent from "./TopBarComponents";

export default function AdminTopbar(props) {
  const [notifications, setNotifications] = useState([]);
  const [badge, setBadge] = useState(0);
  const navigate = useNavigate();

  // const [windowHeight, setHeight] = useState(window.innerHeight);
  const [windowWidth, setWidth] = useState(window.innerWidth);

  window.addEventListener("resize", function () {
    // viewport and full window dimensions will change
    // setHeight(window.innerHeight);
    setWidth(window.innerWidth);
  });

  function logout(target) {
    //clear all localstorage
    localStorage.clear();
    sessionStorage.clear();
    axios
      .post("/api/auth/logout")
      .then(() => {
        navigate("/");
      })
      .catch(() => {
        console.log("An error occurred: User is not logged out");
      });
  }

  function resetBadge() {
    if (document.getElementById("myNotifications")!.style.display === "block") {
      document.getElementById("myNotifications")!.style.display = "none";
    } else {
      document.getElementById("myNotifications")!.style.display = "block";

      if (notifications.length > 0) {
        setBadge(0);

        //set as read all the unread notifications
        for (var i = 0; i < notifications.length; i++) {
          console.log(i);
          if (notifications[i].status === "sent") {
            axios
              .patch("/notifications/" + notifications[i]._id, {
                attr: "status",
                value: "read",
              })
              // .then(() => {
              //     console.log("Notifications updated!");
              // })
              .catch((err) => {
                console.log(err);
              });
          } else {
            break;
          }
        }
      }
    }
  }

  return (
    <div className="tw-p-6 tw-bg-light-pale-blue-white">
      <div className="tw-flex tw-flex-row tw-bg-white tw-rounded-full tw-px-6 tw-py-3 ">
        <AcademicYear />

        <EmailBellComponent
          email={props.email}
          onSelect={props.onSelect}
          logout={logout}
          badge={badge}
          resetBadge={resetBadge}
          setBadge={setBadge}
          userId={props.userId}
          notifications={notifications}
          setNotifications={setNotifications}
          role={"Admin"}
        />
      </div>
    </div>
  );
}
