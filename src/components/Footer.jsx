import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>© <span id="y">{new Date().getFullYear()}</span> HelloWorld, Inc.</div>
        <div>
          <Link to="/about">About</Link> · <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  )
}
