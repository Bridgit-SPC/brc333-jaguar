import React from 'react';
import styles from './Sidebar.module.css'; 
import { getSession, signIn, signOut, useSession } from "next-auth/react";

function Sidebar({session, twitterDisplayName, twitterHandle}) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles['sidebar-item']}>
        <a href="/"><img src="/images/ordweb-logo-x-100.png" alt="Ordweb icon" className={styles['ordweb-icon']}></img></a>
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
        <img src="/images/bookmarks.png" alt="Generic Icon" className={styles['sidebar-icon']}></img>
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
        <img src="/images/photo.png" alt="Generic Icon" className={styles['sidebar-icon']}></img>
        <span className={styles['sidebar-text']}>Images</span>
      </div>
      {session ? (
          
          <div className={styles.user}>
            <img className={styles.avatar} src={session.user.image} />
              
            <div CLASSNAME={styles.userDetails}>
              <div className={styles.displayName}>{twitterDisplayName}</div> 
              <div className={styles.handle}>{twitterHandle} <button className={styles.signout} onClick={() => signOut()}>Sign out</button></div>
            </div>
          </div>

        ) : (
          <button className={styles.signin} onClick={() => signIn()}>Sign in</button>
        )}
    </aside>
  );
}

export default Sidebar;

