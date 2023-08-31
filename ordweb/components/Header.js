import React from 'react';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src="/images/ordweb_logo_100.png" alt="Ordweb Logo" />
        <span>Ordweb</span>
      </div>
      <div className="search-field">
        <input type="text" placeholder="Enter meta-ordinal or search..." />
      </div>
      <div className="user-profile">
        {/* Render user profile image when logged in */}
        {loggedIn && <img src="/path/to/profile-image.png" alt="Profile" />}
      </div>
    </header>
  );
};

export default Header;

