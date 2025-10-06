import React from 'react'
import { NavLink, Link } from 'react-router-dom'
import ThemeToggle from './ThemeToggle.jsx'

const linkClass = ({ isActive }) => 'nav-link' + (isActive ? ' active' : '')

export default function Navbar(){
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="logo" aria-hidden="true"></span>
          <span>HelloWorld</span>
        </Link>
        <div className="nav-links">
          <NavLink to="/" className={linkClass} end>Home</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
          <NavLink to="/services" className={linkClass}>Services</NavLink>
          <NavLink to="/contact" className={linkClass}>Contact</NavLink>
          <NavLink to="/users" className={linkClass}>Users</NavLink>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
