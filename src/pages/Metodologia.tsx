import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, FileText, Mail, Vote, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const dataSources = [
  {
    title: "World Bank Data (Slovensko CO₂)",
    url: "https://data.worldbank.org/indicator/EN.ATM.CO2E.PC?locations=SK",
    description: "Oficiálne štatistiky emisií CO₂ na obyvateľa"
  },
  {
    title: "Our World in Data – Energia",
    url: "https://ourworldindata.org/energy",
    description: "Komplexné globálne energetické štatistiky a analýzy"
  },
  {
    title: "Open-Meteo ERA5 Dokumentácia",
    url: "https://open-meteo.com/en/docs/era5",
    description: "Dokumentácia API historických poveternostných údajov"
  },
  {
    title: "Európska environmentálna agentúra",
    url: "https://www.eea.europa.eu/",
    description: "Environmentálne údaje EÚ a klimatické informácie"
  },
  {
    title: "Slovenský hydrometeorologický ústav",
    url: "https://www.shmu.sk/",
    description: "Oficiálna slovenská agentúra pre počasie a klímu"
  }
];

const Metodologia = () => {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = 'Metodológia | Volím klímu 2026';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Späť na kandidátov
          </Link>
          <h1 className="text-lg font-bold">Metodológia</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-12">
          Metodológia hodnotenia
        </h1>

        {/* Section 1 — How we score */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Ako hodnotíme kandidátov?</h2>
          <p className="text-muted-foreground mb-8">
            Klimatické skóre každého kandidáta vychádza zo štyroch pilierov:
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border p-6" style={{ borderColor: '#E0E0E0' }}>
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-5 w-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-bold">Program kandidáta (25 %)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyzujeme proklimatické a antiklimatické výroky vo volebnom programe.
              </p>
            </div>

            <div className="border p-6" style={{ borderColor: '#E0E0E0' }}>
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-bold">Dotazník (30 %)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Kandidátom zasielame konkrétne otázky; hodnotíme konkrétnosť odpovedí.
              </p>
            </div>

            <div className="border p-6" style={{ borderColor: '#E0E0E0' }}>
              <div className="flex items-center gap-3 mb-3">
                <Vote className="h-5 w-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-bold">Hlasovanie v zastupiteľstve (40 %)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Analyzujeme kľúčové hlasovania za roky 2022–2026.
              </p>
            </div>

            <div className="border p-6" style={{ borderColor: '#E0E0E0' }}>
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="h-5 w-5" style={{ color: '#2E7D32' }} />
                <h3 className="font-bold">Online komunikácia (5 %)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Sledujeme, či kandidát klimatické témy aktívne komunikuje.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 text-sm italic" style={{ backgroundColor: '#FFF8E1', borderLeft: '4px solid #F9A825' }}>
            Kandidáti, ktorí neodpovedali na dotazník alebo nepredložili program, dostávajú 0 bodov s poznámkou.
          </div>
        </section>

        {/* Section 2 — Data sources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Dátové zdroje a referencie</h2>
          <div className="grid gap-3">
            {dataSources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 p-4 border transition-colors hover:border-primary"
                style={{ borderColor: '#E0E0E0' }}
              >
                <ExternalLink size={16} className="flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                <div>
                  <span className="font-medium">{source.title}</span>
                  <p className="text-sm text-muted-foreground">{source.description}</p>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Section 3 — Scientific basis */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Vedecký základ</h2>
          <p className="text-muted-foreground">
            Programy kandidátov hodnotíme pomocou metódy definovanej vo vedeckej práci{' '}
            <em>
              „Political parties and climate policy: A new approach to measuring parties' climate policy preferences"
            </em>{' '}
            (Carter, Ladrech, Little, Tsagkroni — <em>Party Politics</em>).
          </p>
        </section>
      </main>

      {/* Simple footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>
          Vytvorené s{' '}
          <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
            Lovable
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Metodologia;
