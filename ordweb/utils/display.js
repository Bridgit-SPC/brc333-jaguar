import React from 'react';

export function formatAddress(address) {
    if (address.length < 8) return address; // Don't format if the address is too short
    const firstFour = address.slice(0, 4);
    const lastFour = address.slice(-4);
    return `@${firstFour}....${lastFour}`;
  }

  export function copyToClipboard(link) {
    if (typeof document === "undefined") {
      // Handle server-side rendering or non-browser environments
      return;
    }
  
    const textArea = document.createElement("textarea");
    textArea.value = link;
  
    // Make the textarea invisible
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "1px";
    textArea.style.height = "1px";
    textArea.style.opacity = 0;
  
    document.body.appendChild(textArea);
  
    textArea.select();
    document.execCommand("copy");
  
    // Clean up the textarea
    document.body.removeChild(textArea);
  
    // Show a tooltip indicating successful copy
    const tooltip = document.createElement("div");
    tooltip.textContent = "Link copied to clipboard!";
    tooltip.style.position = "fixed";
    tooltip.style.top = "10px";
    tooltip.style.left = "10px";
    tooltip.style.background = "#333";
    tooltip.style.color = "#fff";
    tooltip.style.padding = "8px";
    tooltip.style.borderRadius = "4px";
    tooltip.style.zIndex = "9999";
  
    document.body.appendChild(tooltip);
  
    // Remove the tooltip after a brief delay
    setTimeout(() => {
      document.body.removeChild(tooltip);
    }, 2000);
  }