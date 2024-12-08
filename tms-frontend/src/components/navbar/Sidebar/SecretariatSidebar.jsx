import { BottomSidebar, SecretariatSidebarLinks, SidebarLink, TopSidebar } from "./options";

export default function SecretariatSidebar(props) {

  const handleSelect = (label) => {
    props.onSelect(label);
  };

  return (
    <div className="tw-sticky tw-top-0 tw-flex tw-flex-col tw-h-screen tw-py-5 tw-w-80">
      <TopSidebar props={props} />
      <div className="tw-flex tw-flex-col tw-pl-1 tw-gap-6 tw-pt-8 tw-border-t-4 tw-border-light-pale-blue-white">
        {SecretariatSidebarLinks.map((item) => (
          <SidebarLink
            key={item.key}
            item={item}
            props={{
              onSelect: handleSelect,
              isSelected: props.selectedItem === item.label,
            }}
          />
        ))}
      </div>
      <BottomSidebar />
    </div>
  );
}



/* function SecretariatSidebar(props) {
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
} */

/* export default SecretariatSidebar; */
