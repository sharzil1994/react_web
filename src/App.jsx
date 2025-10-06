import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar.jsx'
import Footer from '@/components/Footer.jsx'
import Home from '@/pages/Home.jsx'
import About from '@/pages/About.jsx'
import Services from '@/pages/Services.jsx'
import Contact from '@/pages/Contact.jsx'
import Users from '@/pages/Users.jsx'
import NotFound from '@/pages/NotFound.jsx'
import Login from '@/pages/Login.jsx'; 
import Auth from '@/pages/Auth.jsx';

export default function App(){
  return (
    <div className="app" data-theme={localStorage.getItem('theme') || 'light'}>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />   {/* optional alias */}
          <Route path="/signup" element={<Auth />} />  {/* optional alias */}
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
