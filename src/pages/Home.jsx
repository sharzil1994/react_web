import React from 'react'
import Tabs from '@/components/Tabs.jsx'

export default function Home(){
  return (
    <section className="container">
      <div className="hero">
        <div className="kicker">starter</div>
        <h1>Hello, World 👋</h1>
        <p className="subtitle">
          This is a clean React starter with routing, a reusable component set,
          dark/light theme toggle, and a structure that grows with you.
        </p>
        <div className="cta-row">
          <a className="btn primary" href="https://react.dev/learn" target="_blank" rel="noreferrer">Learn React</a>
          <a className="btn" href="https://vitejs.dev/guide/" target="_blank" rel="noreferrer">Vite Guide</a>
        </div>
      </div>

      <div className="cards">
        <div className="card">
          <h3>Routing</h3>
          <p>React Router is already configured. Add pages in <code>src/pages</code> and routes in <code>App.jsx</code>.</p>
        </div>
        <div className="card">
          <h3>Components</h3>
          <p>Use <code>src/components</code> for shared UI like Navbar, Footer, Tabs, Cards, etc.</p>
        </div>
        <div className="card">
          <h3>Styling</h3>
          <p>Plain CSS with variables for light/dark themes. No extra tooling needed.</p>
        </div>
      </div>

      <h2 style={{marginTop:28}}>Demo Tabs</h2>
      <Tabs tabs={[
        { label: 'Overview', content: <p>Put overview content here.</p> },
        { label: 'Details', content: <p>Put detailed content here.</p> },
        { label: 'Next steps', content: <ul><li>Add a new page</li><li>Hook up an API</li><li>Deploy</li></ul> },
      ]} />
    </section>
  )
}
