import DashboardIcon from "@mui/icons-material/Dashboard";
import Group from "@mui/icons-material/Group";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import SchoolIcon from "@mui/icons-material/School";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ListAltIcon from "@mui/icons-material/ListAlt";
import FolderIcon from "@mui/icons-material/Folder";
import InventoryIcon from "@mui/icons-material/Inventory";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SourceIcon from "@mui/icons-material/Source";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

export const AdminSidebarLinks = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
  {
    key: "users",
    label: "Users",
    icon: <Group fontSize="large" className="tw-text-light-sky-blue" />,
  },
  {
    key: "analytics",
    label: "Statistics",
    icon: <AnalyticsIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
  {
    key: "universities",
    label: "Universities",
    icon: <SchoolIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
  {
    key: "departments",
    label: "Departments",
    icon: (
      <AccountBalanceIcon fontSize="large" className="tw-text-light-sky-blue" />
    ),
  },
  {
    key: "categories",
    label: "Categories",
    icon: <ListAltIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
  {
    key: "assigned_theses",
    label: "Assigned Theses",
    icon: <FolderIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
  {
    key: "archived_theses",
    label: "Theses Archive",
    icon: <InventoryIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
];

export const SecretariatSidebarLinks = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
  {
    key: "active theses",
    label: "Active Theses",
    icon: <SourceIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },

  {
    key: "dashboard",
    label: "Completed Theses",
    icon: (
      <AssignmentTurnedInIcon
        fontSize="large"
        className="tw-text-light-sky-blue"
      />
    ),
  },

  {
    key: "archived_theses",
    label: "Theses Archive",
    icon: <InventoryIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
];

export function SidebarLink({ item, props }) {
  return (
    <div
      onClick={(e) => {
        props.onSelect(item.label);
      }}
      className={`${props.isSelected ? "tw-border-solid tw-border-l-4  tw-border-light-sky-blue" : ""} tw-pl-4 hover:tw-bg-light-pale-blue-white  tw-flex tw-cursor-pointer`}
    >
      <div className="tw-mt-1 tw-inline-block 2xl:tw-text-xl">{item.icon}</div>
      <div
        className={`${props.isSelected ? "tw-bg-light-pale-blue-white hover:tw-no-underline tw-mr-2" : ""} tw-flex tw-items-end  tw-font-bold tw-text-sm tw-flex-auto tw-pl-4 tw-py-2 tw-text-dark-sky-blue tw-rounded-full 2xl:tw-text-xl`}
      >
        {item.label}
      </div>
    </div>
  );
}

export function TopSidebar({ props }) {
  return (
    <div className="tw-flex tw-pb-6 tw-pl-10 tw-pr-5">
      <div className="tw-flex tw-items-center">
        <AccountCircleIcon
          style={{ height: "5rem", width: "5rem" }}
          className="tw-flex tw-flex-1 tw-text-dark-sky-blue"
        />
      </div>
      <div className="tw-flex tw-flex-col tw-items-start tw-justify-center tw-ml-2 tw-leading-5">
        <div className="tw-text-dark-sky-blue tw-font-bold">{props.name}</div>
        <div className="tw-text-gray-300 tw-font-bold">{props.role}</div>
      </div>
    </div>
  );
}

export function BottomSidebar() {
  return (
    <div className="tw-flex tw-flex-1 tw-flex-col tw-pt-4">
      <div className="tw-flex-1 tw-border-light-pale-blue-white tw-border-b-4 tw-border-solid tw-mb-4"></div>
      <div
        id="logoAndVersion"
        className="tw-inline-flex tw-items-end tw-justify-between tw-pr-2"
      >
        <div className="tw-inline-flex tw-items-end">
          <img
            className="tw-object-scale-down tw-h-12 tw-w-22"
            src="/logoNoBg.svg"
            alt="logo"
          />
          <span className="tw-text-dark-sky-blue tw-font-black tw-text-xs tw-leading-tight">
            <span className="tw-block">THESIS</span>
            <span className="tw-block">MANAGEMENT</span>
            <span className="tw-block">SYSTEM</span>
          </span>
        </div>
        <div className="tw-justify-end tw-text-gray-300 tw-text-xs tw-font-black tw-pr-2">
          Version 1.0.3
        </div>
      </div>
    </div>
  );
}
