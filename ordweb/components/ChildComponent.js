import React from "react";

function TestComponent() {
  return (
    <div>
      <h2>Test Component</h2>
      <p>This is a test component.</p>
    </div>
  );
}

export default TestComponent;
import React from "react";

function ChildComponent({ closeModal }) {
  return (
    <div>
      <div className="modal">
        <h3>Child Component Modal</h3>
        <p>This is the modal content.</p>
        <button onClick={closeModal}>Close Modal</button>
      </div>
    </div>
  );
}

export default ChildComponent;
