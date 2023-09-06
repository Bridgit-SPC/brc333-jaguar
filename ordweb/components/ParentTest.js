import React, { useState } from "react";
import ChildComponent from "./ChildComponent";

function ParentComponent() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <h2>Parent Component</h2>
      <button onClick={openModal}>Open Modal</button>
      {modalOpen && <ChildComponent closeModal={closeModal} />}
    </div>
  );
}

export default ParentComponent;

