import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/components/Navbar.jsx'
import Footer from '@/components/Footer.jsx'
import Home from '@/pages/Home.jsx'
import About from '@/pages/About.jsx'
import Services from '@/pages/Services.jsx'
import Contact from '@/pages/Contact.jsx'
import NotFound from '@/pages/NotFound.jsx'
import Auth from '@/pages/Auth.jsx'

// MyPage files
import MyPage from '@/pages/MyPage.jsx' // landing content inside MyPage
import MyPageLayout from '@/layouts/MyPageLayout.jsx'
import ConsoleServicesPage from '@/pages/ConsoleServicesPage.jsx'
import ConsoleResultsPage  from '@/pages/ConsoleResultsPage.jsx'
import FeatureXPage from '@/pages/FeatureXPage.jsx';
import FeatureYPage from '@/pages/FeatureYPage.jsx';
import PuresnetPage   from '@/pages/PuresnetPage.jsx';


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

          {/* Auth aliases */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth />} />

          {/* ✅ MyPage uses a layout so the sidebar/persistent parts show only here */}
          <Route path="/mypage" element={<MyPageLayout />}>
            {/* /mypage -> your existing MyPage.jsx */}
            <Route index element={<MyPage />} />
            {/* /mypage/services and /mypage/results show next to the sidebar */}
            <Route path="services/feature-x" element={<FeatureXPage />} />
            <Route path="services/feature-y" element={<FeatureYPage />} />
            <Route path="services/puresnet"  element={<PuresnetPage />} />
            <Route path="results"  element={<ConsoleResultsPage  />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
