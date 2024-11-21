import DashboardIcon from "@mui/icons-material/Dashboard";
import Group from "@mui/icons-material/Group";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FolderIcon from '@mui/icons-material/Folder';
import InventoryIcon from '@mui/icons-material/Inventory';

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
    icon: <AccountBalanceIcon fontSize="large" className="tw-text-light-sky-blue" />,
  },
  {
    key: "categories",
    label: "Areas / Categories",
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
