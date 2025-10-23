import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>© <span id="y">{new Date().getFullYear()}</span> JYBio</div>
        <div>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
