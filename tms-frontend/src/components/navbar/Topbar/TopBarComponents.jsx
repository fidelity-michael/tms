import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";
import MyNotifications from "../../content/MyNotifications";
import NotificationsIcon from "@mui/icons-material/Notifications";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import ListIcon from "@mui/icons-material/List";
import LogoutIcon from "@mui/icons-material/Logout";
import clsx from "clsx";

export default function EmailBellComponent(props) {
  return (
    <div id="bellEmail" className="tw-flex tw-items-center">
      {/*Notifications Bell*/}
      <div className="tw-relative tw-inline-block tw-text-left tw-items-center tw-cursor-pointer">
        <a
          className=""
          id="alertsDropdown"
          role="button"
          onClick={() => props.resetBadge()}
          aria-haspopup="true"
          aria-expanded="false"
        >
          <NotificationsIcon
            dropdown-toggle="alertsDropdown"
            className="tw-text-dark-sky-blue"
          />
          {props.badge > 0 && (
            <span className="badge badge-danger badge-counter tw-absolute tw-left-2/3 tw-bottom-3">
              {props.badge > 0 ? (props.badge > 9 ? "9+" : props.badge) : null}
            </span>
          )}
        </a>
        <div
          id="myNotifications"
          className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in"
          style={{ display: "none" }}
        >
          <MyNotifications
            userId={props.userId}
            notifications={props.notifications}
            setNotifications={props.setNotifications}
            badge={props.badge}
            setBadge={props.setBadge}
          />
        </div>
      </div>

      {/*Email portion*/}

      <Menu>
        <MenuButton
          className={
            "tw-text-dark-sky-blue tw-inline-flex tw-items-center tw-gap-2 tw-py-1.5 tw-px-3 tw-rounded-md tw-text-sm/6 tw-font-semibold  tw-shadow-white/10 focus:tw-outline-none data-[hover]:tw-bg-light-pale-blue-white data-[open]:tw-bg-light-pale-blue-white data-[focus]:tw-outline-1 data-[focus]:tw-outline-white"
          }
        >
          {({ active }) => (
            <a>
              {props.email.length > 0 ? props.email : "Administrator"}
              <KeyboardArrowRightIcon
                className={clsx(
                  active && "tw--rotate-90",
                  "tw-transition-transform tw-rotate-90 tw-ease-in-out tw-duration-500 tw-delay-300 tw-text-dark-sky-blue",
                )}
              />
            </a>
          )}
        </MenuButton>
        <MenuItems
          transition
          anchor="bottom end"
          className={
            "tw-text-dark-sky-blue tw-w-52 tw-origin-top-right tw-rounded-xl tw-border tw-border-white/5 tw-bg-white/5 tw-p-1 tw-text-sm/6  tw-transition tw-duration-100 tw-ease-out [--anchor-gap:var(--spacing-1)] focus:tw-outline-none data-[open]:tw-bg-white data-[closed]:tw-scale-95 data-[closed]:tw-opacity-0"
          }
        >
          <MenuItem>
            <button
              onClick={() => {
                props.onSelect("My Roles");
              }}
              className="group tw-flex tw-w-full tw-items-center tw-gap-2 tw-rounded-lg tw-py-1.5 tw-px-3 hover:tw-bg-light-pale-blue-white data-[focus]:tw-bg-light-pale-blue-white"
            >
              <AccountCircleIcon />
              My Roles
            </button>
          </MenuItem>
          <MenuItem>
            <button
              onClick={() => {
                props.onSelect("My Calendar");
              }}
              className="group tw-flex tw-w-full tw-items-center tw-gap-2 tw-rounded-lg tw-py-1.5 tw-px-3 data-[focus]:tw-bg-light-pale-blue-white"
            >
              <CalendarMonthIcon />
              Calendar
            </button>
          </MenuItem>
          <MenuItem>
            <button className="group tw-flex tw-w-full tw-items-center tw-gap-2 tw-rounded-lg tw-py-1.5 tw-px-3 data-[focus]:tw-bg-light-pale-blue-white">
              <ListIcon />
              Activity Log
            </button>
          </MenuItem>
          <MenuItem>
            <button className="group tw-flex tw-w-full tw-items-center tw-gap-2 tw-rounded-lg tw-py-1.5 tw-px-3 data-[focus]:tw-bg-light-pale-blue-white">
              <SettingsIcon />
              Settings
            </button>
          </MenuItem>

          <MenuSeparator className="tw-my-1 tw-mx-2 tw-h-px tw-bg-dark-sky-blue" />

          <MenuItem>
            <button
              onClick={(e) => props.logout(e.target)}
              className="group tw-flex tw-w-full tw-items-center tw-gap-2 tw-rounded-lg tw-py-1.5 tw-px-3 data-[focus]:tw-bg-light-pale-blue-white"
            >
              <LogoutIcon />
              Sign out
            </button>
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
}
