import { ArrowLeft, Wind, Trees, Bus, Zap, Recycle, Heart, Wallet, Building2, MapPin, CheckCircle, MessageSquare, Share2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/Footer';
import climateHeroBg from '@/assets/climate-hero-bg.jpg';
import { ImpactTable } from '@/components/elections/ImpactTable';
import { ResponsibilitiesSection } from '@/components/elections/ResponsibilitiesSection';
import { ActionChecklist } from '@/components/elections/ActionChecklist';
import { BrochurePreview } from '@/components/elections/BrochurePreview';

const WhyVoteMatters = () => {
  const { language } = useLanguage();
  const sk = language === 'sk';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] flex flex-col justify-center items-center text-center px-4 py-16 sm:py-24 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${climateHeroBg})`, backgroundAttachment: 'fixed' }}
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            {sk ? 'Späť na voľby' : 'Back to elections'}
          </Link>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 text-balance">
            {sk
              ? 'Prečo sú voľby dôležité pre vašu klímu, zdravie a peňaženku?'
              : 'Why Do Elections Matter for Your Climate, Health, and Wallet?'}
          </h1>
          <p className="text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto opacity-90">
            {sk
              ? 'Vedeli ste, že miestni politici v Košiciach rozhodujú o veciach, ktoré priamo ovplyvňujú vaše zdravie, vašu peňaženku a vzduch, ktorý dýchate?'
              : 'Did you know that local politicians in Košice decide on things that directly affect your health, your wallet, and the air you breathe?'}
          </p>
        </div>
      </section>

      {/* Section 1: Why Your Vote Matters */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-6">
            {sk ? 'Prečo váš hlas rozhoduje' : 'Why Your Vote Matters'}
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="text-base sm:text-lg">
              {sk
                ? 'Komunálne a regionálne voľby v Košiciach rozhodujú o tom, kto riadi rozpočty, infraštruktúru a politiky v oblasti kvality ovzdušia, zelených plôch, verejnej dopravy a energetickej efektívnosti.'
                : 'Local and regional elections in Košice determine who controls budgets, infrastructure, and policies for air quality, green spaces, public transport, and energy efficiency.'}
            </p>
            <p className="text-base sm:text-lg">
              {sk
                ? 'Na rozdiel od parlamentných volieb, miestni lídri majú priamy vplyv na životné prostredie a kvalitu života v Košiciach. Primátor rozhoduje o cyklotrasách, župan o regionálnych cestách, starosta o parkoch vo vašej štvrti.'
                : 'Unlike national elections, local leaders have direct power over Košice\'s environment and quality of life. The mayor decides on bike lanes, the regional chairman on regional roads, and district mayors on parks in your neighborhood.'}
            </p>
          </div>

          {/* Key stats */}
          <div className="grid gap-4 sm:grid-cols-3 mt-8">
            {[
              {
                icon: <Heart className="h-6 w-6" />,
                stat: sk ? 'Zdravie' : 'Health',
                desc: sk
                  ? 'Košice patria medzi mestá s najhorším ovzduším na Slovensku kvôli U.S. Steel a doprave'
                  : 'Košice ranks among cities with worst air quality in Slovakia due to U.S. Steel and traffic',
              },
              {
                icon: <Wallet className="h-6 w-6" />,
                stat: sk ? 'Peňaženka' : 'Wallet',
                desc: sk
                  ? 'Energetická neefektívnosť budov stojí domácnosti stovky eur ročne navyše'
                  : 'Energy inefficiency of buildings costs households hundreds of euros extra per year',
              },
              {
                icon: <Trees className="h-6 w-6" />,
                stat: sk ? 'Kvalita života' : 'Quality of Life',
                desc: sk
                  ? 'Košice majú deficit zelených plôch - letné teploty v centre dosahujú až 40°C'
                  : 'Košice has a green space deficit - summer temperatures in the center reach up to 40°C',
              },
            ].map((item, i) => (
              <div key={i} className="border p-5 bg-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 text-primary rounded-full">{item.icon}</div>
                  <span className="font-bold text-lg">{item.stat}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Impact Table */}
      <section className="py-12 sm:py-20 px-4 bg-muted/30 border-y">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-8">
            {sk ? 'Ako košickí politici ovplyvňujú váš každodenný život' : 'How Košice Politicians Affect Your Daily Life'}
          </h2>
          <ImpactTable language={language} />
        </div>
      </section>

      {/* Section 3: Who Decides What - Parallax */}
      <section className="relative py-12 sm:py-20 px-4 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${climateHeroBg})`, backgroundAttachment: 'fixed' }}
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-8">
            {sk ? 'Regionálne vs. mestské voľby: Kto o čom rozhoduje?' : 'Regional vs. City Elections: Who Decides What?'}
          </h2>
          <ResponsibilitiesSection language={language} />
        </div>
      </section>

      {/* Section 4: What Can You Do */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-8">
            {sk ? 'Čo môžete UROBIŤ vy?' : 'What Can YOU Do?'}
          </h2>
          <ActionChecklist language={language} />
        </div>
      </section>

      {/* Brochure Preview */}
      <section className="py-12 sm:py-20 px-4 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3 text-center">
            {sk ? 'Volebná brožúra na stiahnutie' : 'Printable Election Brochure'}
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            {sk
              ? 'Prezrite si náš stručný sprievodca voľbami. Vytlačte ho a rozdajte vo svojom okolí.'
              : 'Preview our concise election guide. Print it out and share it in your community.'}
          </p>
          <BrochurePreview language={language} />
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-12 sm:py-20 px-4 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${climateHeroBg})`, backgroundAttachment: 'fixed' }}
        />
        <div className="absolute inset-0 bg-primary/85" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
            {sk ? 'Nájdite svojho klimatického kandidáta' : 'Find Your Climate-Friendly Candidate'}
          </h2>
          <p className="text-lg opacity-90 mb-8">
            {sk
              ? 'Pozrite si naše hodnotenie kandidátov podľa ich klimatických postojov a rozhodnite sa informovane.'
              : 'Check our candidate ratings based on their climate positions and make an informed decision.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-white text-primary px-8 py-4 text-lg font-semibold rounded-none transition-all hover:bg-white/90 inline-flex items-center justify-center gap-2"
            >
              {sk ? 'Pozrieť kandidátov' : 'View Candidates'}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              to="/klimaticke-data"
              className="border-2 border-white text-white px-8 py-4 text-lg font-semibold rounded-none transition-all hover:bg-white hover:text-primary text-center"
            >
              {sk ? 'Klimatické dáta' : 'Climate Data'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhyVoteMatters;
