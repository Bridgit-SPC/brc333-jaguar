import React from "react";

const Layout = ({ sidebar, content }) => {
  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div style={{ flex: "1" }}>{sidebar}</div>

      {/* Body */}
      <div style={{ flex: "3" }}>{content}</div>
    </div>
  );
};

export default Layout;

