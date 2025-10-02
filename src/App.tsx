import React from 'react';
import TopBar from './components/TopBar';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import About from './components/About';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-warm-beige">
      <TopBar />
      <Header />
      <HeroSection />
      <About />
      <Skills />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;