import React, { useMemo } from 'react';
import { SEO } from '../components/SEO';
import { getPsychologistMainSchema } from '../config/schemaData';
import TopBar from '../components/TopBar';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import About from '../components/About';
import Skills from '../components/Skills';
import FAQ from '../components/FAQ';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

export const LandingPage: React.FC = () => {
  const mainSchema = useMemo(() => getPsychologistMainSchema(), []);

  return (
    <div className="min-h-screen bg-warm-beige">
      <SEO
        title="mgr Joanna Kubiak – Psycholog dzieci i młodzieży | Swarzędz & Online"
        description="mgr Joanna Kubiak – psycholog dziecięcy i młodzieży. Profesjonalna pomoc psychologiczna dla dzieci (od 6 lat), młodzieży i rodziców. Gabinet w Swarzędzu oraz konsultacje online."
        keywords="psycholog dziecięcy Swarzędz, psycholog młodzieży Poznań, pomoc psychologiczna Swarzędz, terapia dzieci, konsultacje psychologiczne online, Joanna Kubiak psycholog"
        canonical="https://www.joannakubiakpsycholog.pl/"
        ogType="website"
        jsonLd={mainSchema}
      />
      <TopBar />
      <Header />
      <HeroSection />
      <About />
      <Skills />
      <FAQ limit={5} />
      <Contact />
      <Footer />
    </div>
  );
};
