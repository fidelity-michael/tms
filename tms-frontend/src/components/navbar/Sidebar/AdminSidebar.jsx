import { AdminSidebarLinks } from "./options";

export default function AdminSidebar(props) {
  return (
    <div className="tw-flex tw-flex-col tw-h-screen tw-py-5 tw-w-80">
      <TopSidebar props={props} />
      <div className="tw-flex tw-flex-col tw-pl-1 tw-gap-6">
        {AdminSidebarLinks.map((item) => (
          <SidebarLink key={item.key} item={item} props={props} />
        ))}
      </div>
      <BottonSidebar />
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
      <div className="tw-font-bold tw-text-sm tw-flex-auto tw-pl-4 tw-py-2 tw-text-dark-sky-blue hover:tw-bg-light-pale-blue-white hover:tw-no-underline tw-rounded-full xl:tw-text-xl">
        {item.label}
      </div>
    </div>
  );
}

function TopSidebar({ props }) {
  return (
    <div className="tw-flex tw-pb-10 tw-pl-10 tw-pr-5">
      {
        //  <div id="photo"></div>
      }
      <img
        className="tw-object-cover tw-h-20 tw-w-20 tw-rounded-full tw-mr-2"
        src="/profile.jpg"
      ></img>
      <div className="">
        <div className="tw-text-dark-sky-blue tw-font-bold">{props.name}</div>
        <div className="tw-text-gray-300 tw-font-bold">{props.role}</div>
      </div>
    </div>
  );
}

function BottonSidebar() {
  return (
    <div className="tw-flex tw-flex-auto tw-border-t-teal-600 tw-pt-4">
      <div id="logoAndVersion" className="tw-flex tw-flex-1 tw-items-end tw-justify-between tw-pr-2">
        <div className="tw-flex tw-items-end">
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
