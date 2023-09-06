import React from "react";
import Layout from "../components/Layout"; 

const YourComponent = () => {
  const sidebarContent = (
    // Your sidebar content goes here
    <div>
      <h2>Sidebar</h2>
      <ul>
        <li>Link 1</li>
        <li>Link 2</li>
        {/* Add more links or components */}
      </ul>
    </div>
  );

  const mainContent = (
    // Your main content goes here
    <div>
      <h1>Main Content</h1>
      <p>This is the body of your page.</p>
    </div>
  );

  return <Layout sidebar={sidebarContent} content={mainContent} />;
};

export default YourComponent;
