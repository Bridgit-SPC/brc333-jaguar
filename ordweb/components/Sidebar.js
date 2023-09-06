import React from 'react';
import styles from './Sidebar.module.css'; // Import your sidebar styles

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles['sidebar-item']}>
        <a href="/"><img src="/images/ordweb-logo-x-100.png" alt="Ordweb icon" className={styles['sidebar-icon']}></img></a>
        <span className={styles['logo-text']}>Ordweb</span>
      </div>
      <div className={styles['sidebar-item']}>
        <a href="/"><img src="/images/home.png" alt="Home icon" className={styles['sidebar-icon']}></img></a>
        <span className={styles['sidebar-text']}>Home</span>
      </div>
      <div className={styles['sidebar-item']}>
        <img src="/images/explore.png" alt="Generic Icon" className={styles['sidebar-icon']}></img>
        <span className={styles['sidebar-text']}>Explore</span>
      </div>
      <div className={styles['sidebar-item']}>
        <img src="/images/bookmark.png" alt="Generic Icon" className={styles['sidebar-icon']}></img>
        <span className={styles['sidebar-text']}>Bookmarks</span>
      </div>
      <div className={styles['sidebar-item']}>
        <img src="/images/meta-ordinals.png" alt="Generic Icon" className={styles['sidebar-icon']}></img>
        <span className={styles['sidebar-text']}>Meta-ordinals</span>
      </div>
      <div className={styles['sidebar-item']}>
        <img src="/images/meta-protocols.png" alt="Generic Icon" className={styles['sidebar-icon']}></img>
        <span className={styles['sidebar-text']}>Meta Protocols</span>
      </div>
      <div className={styles['sidebar-item']}>
        <img src="/images/images.png" alt="Generic Icon" className={styles['sidebar-icon']}></img>
        <span className={styles['sidebar-text']}>Images</span>
      </div>
      {/* Add more sidebar items here */}
    </aside>
  );
}

export default Sidebar;

