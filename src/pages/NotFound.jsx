import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound(){
  return (
    <section className="container">
      <h1>404 — Not Found</h1>
      <p>We couldn’t find that page. Go <Link to="/">home</Link>.</p>
    </section>
  )
}
