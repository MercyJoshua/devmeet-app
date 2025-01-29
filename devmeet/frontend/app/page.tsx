import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import HowItWorksSection from './components/HowItWorksSection';
import CTASection from './components/CTASection';


export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 lg:p-20 font-[family-name:var(--font-geist-sans)]  min-h-screen flex flex-col justify-between">
      
      <main className="flex flex-grow flex-col gap-8 row-start-2 items-center sm:items-start">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
     
    </div>
  );
}
