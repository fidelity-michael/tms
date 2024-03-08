import React from "react";

function AdminSidebar(props) {
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
      <div className="sidebar-brand d-flex" href="#/">
        <i className="fas fa-user-cog" style={{width: "1vw"}}></i>
        <div className="sidebar-brand-text mx-3">Admin</div>
      </div>

      <li className="nav-item" onClick={(e) => { props.onSelect("Dashboard"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >
          
        <div className="imgSidebar">
            <i className="fas fa-fw fa-home"></i>
          </div>

          <span>Dashboard</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Users"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fas fa-fw fa-user-friends"></i>
          </div>

          <span>Users</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Statistics"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fas fa-fw fa-chart-line"></i>
          </div>

          <span>Statistics</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Universities"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fa fa-fw fa-graduation-cap"></i>
          </div>

          <span>Universities</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Departments"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fas fa-university"></i>
          </div>

          <span>Departments</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Areas / Categories"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fas fa-fw fa-list-alt"></i>
          </div>

          <span>Areas / Categories</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Assigned Theses"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fas fa-fw fa-folder"></i>
          </div>

          <span>Assigned Theses</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Theses Archive"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fas fa-fw fa-archive"></i>
          </div>
          
          <span>Theses Archive</span>
        </div>
      </li>
      
    </ul>
  );
}

export default AdminSidebar;
