import React from 'react'

export default function Contact(){
  return (
    <section className="container">
      <h1>Contact</h1>
      <form className="card" onSubmit={(e)=>{e.preventDefault(); alert('Pretend this sent a message.')}}>
        <div style={{display:'grid', gap:12}}>
          <input required placeholder="Your name" className="btn" style={{padding:12}} />
          <input required type="email" placeholder="Email" className="btn" style={{padding:12}} />
          <textarea required placeholder="Message" className="btn" rows="4"></textarea>
          <button className="btn primary" type="submit">Send</button>
        </div>
      </form>
    </section>
  )
}
