import { useState } from "react";
import {
  AdminSidebarLinks,
  BottomSidebar,
  SidebarLink,
  TopSidebar,
} from "./options";

export default function AdminSidebar(props) {
  const handleSelect = (label) => {
    props.onSelect(label);
  };

  return (
    <div className="tw-sticky tw-top-0 tw-flex tw-flex-col tw-h-screen tw-py-5 tw-w-80">
      <TopSidebar props={props} />
      <div className="tw-flex tw-flex-col tw-pl-1 tw-gap-6 tw-pt-8 tw-border-t-4 tw-border-light-pale-blue-white">
        {AdminSidebarLinks.map((item) => (
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
