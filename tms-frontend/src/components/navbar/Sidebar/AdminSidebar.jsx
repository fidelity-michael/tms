import DashboardIcon from "@mui/icons-material/Dashboard";
import { Icon } from "@mui/material";
import { AdminSidebarLinks } from "./options";

export default function AdminSidebar(props) {
  return (
    <div className="tw-min-h-dvh tw-flex tw-flex-col tw-pl-1 tw-py-5 tw-w-72 tw-gap-6">
      {AdminSidebarLinks.map((item) => (
        <SidebarLink key={item.key} item={item} props={props} />
      ))}
    </div>
  );
}

function SidebarLink({ item, props }) {
  return (
    <div
      onClick={(e) => {
        props.onSelect(item.label);
      }}
      className="tw-border-solid tw-border-l-4 tw-pl-4 tw-border-light-sky-blue tw-flex tw-cursor-pointer "
    >
      <div className="tw-mt-1 tw-inline-block">{item.icon}</div>
      <div className="tw-font-bold tw-text-xl tw-flex-auto tw-pl-4 tw-py-2 tw-text-dark-sky-blue hover:tw-bg-light-pale-blue-white hover:tw-no-underline tw-rounded-full ">
        {item.label}
      </div>
    </div>
  );
}

// function AdminSidebar(props) {
//   return (
//     <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
//       <div className="sidebar-brand d-flex" href="#/">
//         <i className="fas fa-user-cog" style={{width: "1vw"}}></i>
//         <div className="sidebar-brand-text mx-3">Admin</div>
//       </div>
//
//       <li className="nav-item" onClick={(e) => { props.onSelect("Dashboard"); }}>
//         <div className="nav-link" style={{cursor: "pointer"}} >
//
//         <div className="imgSidebar">
//             <i className="fas fa-fw fa-home"></i>
//           </div>
//
//           <span>Dashboard</span>
//         </div>
//       </li>
//
//       <li className="nav-item" onClick={(e) => { props.onSelect("Users"); }}>
//         <div className="nav-link" style={{cursor: "pointer"}} >
//
//           <div className="imgSidebar">
//             <i className="fas fa-fw fa-user-friends"></i>
//           </div>
//
//           <span>Users</span>
//         </div>
//       </li>
//
//       <li className="nav-item" onClick={(e) => { props.onSelect("Statistics"); }}>
//         <div className="nav-link" style={{cursor: "pointer"}} >
//
//           <div className="imgSidebar">
//             <i className="fas fa-fw fa-chart-line"></i>
//           </div>
//
//           <span>Statistics</span>
//         </div>
//       </li>
//
//       <li className="nav-item" onClick={(e) => { props.onSelect("Universities"); }}>
//         <div className="nav-link" style={{cursor: "pointer"}} >
//
//           <div className="imgSidebar">
//             <i className="fa fa-fw fa-graduation-cap"></i>
//           </div>
//
//           <span>Universities</span>
//         </div>
//       </li>
//
//       <li className="nav-item" onClick={(e) => { props.onSelect("Departments"); }}>
//         <div className="nav-link" style={{cursor: "pointer"}} >
//
//           <div className="imgSidebar">
//             <i className="fas fa-university"></i>
//           </div>
//
//           <span>Departments</span>
//         </div>
//       </li>
//
//       <li className="nav-item" onClick={(e) => { props.onSelect("Areas / Categories"); }}>
//         <div className="nav-link" style={{cursor: "pointer"}} >
//
//           <div className="imgSidebar">
//             <i className="fas fa-fw fa-list-alt"></i>
//           </div>
//
//           <span>Areas / Categories</span>
//         </div>
//       </li>
//
//       <li className="nav-item" onClick={(e) => { props.onSelect("Assigned Theses"); }}>
//         <div className="nav-link" style={{cursor: "pointer"}} >
//
//           <div className="imgSidebar">
//             <i className="fas fa-fw fa-folder"></i>
//           </div>
//
//           <span>Assigned Theses</span>
//         </div>
//       </li>
//
//       <li className="nav-item" onClick={(e) => { props.onSelect("Theses Archive"); }}>
//         <div className="nav-link" style={{cursor: "pointer"}} >
//
//           <div className="imgSidebar">
//             <i className="fas fa-fw fa-archive"></i>
//           </div>
//
//           <span>Theses Archive</span>
//         </div>
//       </li>
//
//     </ul>
//   );
// }
//
// export default AdminSidebar;
