import React, { useState, useEffect, useRef } from "react";
import { useHistory, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as sessionActions from '../../store/session';
import './index.css';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  const history = useHistory();

  const openMenu = () => {
    if (showMenu) return;
    setShowMenu(true);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    history.push('/');
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <button id="profile-button" onClick={openMenu}>
        <i id="profile-button" className="fas fa-user-circle" />
      </button>
      <div id="drop-down" className={ulClassName} ref={ulRef}>
        <p className="drop-down-text">Hello, {user.firstName}</p>
        <p className="drop-down-text">{user.email}</p>
        <Link className='drop-down-link' to='/groups'>
          <p className="drop-down-text">View groups</p>
        </Link>
        <Link className='drop-down-link' to='/events'>
          <p className="drop-down-text">View events</p>
        </Link>
        <section id="log-out-section">
          <button id="log-out" onClick={logout}>Log Out</button>
        </section>
      </div>
    </>
  );
}

export default ProfileButton;
