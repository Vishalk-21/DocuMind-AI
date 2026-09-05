import { useEffect } from "react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import WhatIsDocuMind from "../components/landing/WhatIsDocuMind";
import HowItWorks from "../components/landing/HowItWorks";
import Features from "../components/landing/Features";
import IntelligenceFlow from "../components/landing/IntelligenceFlow";
import ProductDemo from "../components/landing/ProductDemo";
import UseCases from "../components/landing/UseCases";
import SecuritySection from "../components/landing/SecuritySection";
import FinalCTA from "../components/landing/FinalCTA";
import Footer from "../components/landing/Footer";

export default function LandingPage() {
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        if (window.scrollY > 10) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: "white" }}>
      <Navbar />
      <Hero />
      <WhatIsDocuMind />
      <HowItWorks />
      <Features />
      <IntelligenceFlow />
      <ProductDemo />
      <UseCases />
      <SecuritySection />
      <FinalCTA />
      <Footer />
    </div>
  );
}
