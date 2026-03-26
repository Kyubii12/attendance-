import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import StatsCounter from "@/components/StatsCounter";
import Testimonials from "@/components/sections/Testimonials";
import FAQ from "@/components/FAQ";
import CTABanner from "@/components/sections/CTABanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsCounter />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </>
  );
}
