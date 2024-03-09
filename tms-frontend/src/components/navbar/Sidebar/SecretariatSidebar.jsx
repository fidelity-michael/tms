import React from "react";

function SecretariatSidebar(props) {
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
      <div className="sidebar-brand d-flex" href="#/">
        <i className="fas fa-book" style={{marginTop: "0.2rem"}}></i>
        <div style={{fontSize: "0.9rem"}}>Secretariat</div>
      </div>

      <li className="nav-item" onClick={(e) => { props.onSelect("Dashboard"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fas fa-fw fa-home"></i>
          </div>

          <span>Dashboard</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Active Theses"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fa fa-fw fa-clipboard-list"></i>
          </div>
          
          <span>Active Theses</span>
        </div>
      </li>

      <li className="nav-item" onClick={(e) => { props.onSelect("Completed Theses"); }}>
        <div className="nav-link" style={{cursor: "pointer"}} >

          <div className="imgSidebar">
            <i className="fa fa-fw fa-clipboard-check"></i>
          </div>

          <span>Completed Theses</span>
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

export default SecretariatSidebar;
