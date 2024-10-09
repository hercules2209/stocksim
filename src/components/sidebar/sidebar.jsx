import React, { useState, useContext } from 'react';
import { NavLink } from "react-router-dom";
import { RxHamburgerMenu, RxDashboard, RxPerson, RxGear } from "react-icons/rx";
import { IoBookSharp } from "react-icons/io5";
import { FaChartLine } from "react-icons/fa6";
import { IoHome } from "react-icons/io5";
import { FaMoon, FaSun } from "react-icons/fa";
import { BsFillBriefcaseFill } from "react-icons/bs";
import { ThemeContext } from '../../contexts/ThemeContext';
import { useSigninCheck, useUser } from 'reactfire';
import './sidebar.css';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { status, data: signInCheckResult } = useSigninCheck();
  const { data: user } = useUser();

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleNavClick = () => {
    if (expanded) {
      setExpanded(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className={`sidebar ${expanded ? 'expanded' : ''} ${darkMode ? 'dark-theme' : ''}`}
    onMouseEnter={() => setExpanded(true)}
    onMouseLeave={() => setExpanded(false)}
>
 <div className="sidebar-header">
   <div className="toggle-btn" onClick={toggleSidebar}>
     <RxHamburgerMenu />
   </div>
   <nav className="nav-menu">
     <NavLink to="/" className="nav-item" onClick={handleNavClick}>
       <IoHome className="icon" />
       <span className="label">Home</span>
     </NavLink>
     <NavLink to="/stock" className="nav-item" onClick={handleNavClick}>
       <FaChartLine className="icon" />
       <span className="label">Stocks</span>
     </NavLink>
     <NavLink to="/portfolios" className="nav-item" onClick={handleNavClick}>
       <BsFillBriefcaseFill className="icon" />
       <span className="label">Portfolios</span>
     </NavLink>
     <NavLink to="/learn" className="nav-item" onClick={handleNavClick}>
       <IoBookSharp className="icon" />
       <span className="label">Learn</span>
     </NavLink>
   </nav>
 </div>
<div>
  {signInCheckResult.signedIn ? (
    <NavLink to="/dashboard" className={`nav-item user-section ${expanded ? 'expanded' : ''}`} onClick={handleNavClick}>
      <span className="icon">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="profile-pic" />
        ) : (
          <RxPerson className="icon" />
        )}
      </span>
      <span className={`label ${expanded ? 'visible' : 'hidden'}`}>
        {user?.displayName || 'Dashboard'}
      </span>
    </NavLink>
  ) : (
    <NavLink to="/login" className={`nav-item login-section ${expanded ? 'expanded' : ''}`} onClick={handleNavClick}>
      <RxPerson className="icon" />
      <span className={`label ${expanded ? 'visible' : 'hidden'}`}>Login</span>
    </NavLink>
  )}


 <div className="theme-toggle" onClick={toggleTheme}>
   {darkMode ? <FaSun className="icon" /> : <FaMoon className="icon" />}
   <span className="label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
 </div>
 </div>
</div>
  );
}