import React from 'react'

export default function ThemeToggle(){
  function toggle(){
    const el = document.documentElement
    const current = el.getAttribute('data-theme') || 'light'
    const next = current === 'light' ? 'dark' : 'light'
    el.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
  }
  return <button className="theme-toggle" onClick={toggle} title="Toggle theme">Theme</button>
}
