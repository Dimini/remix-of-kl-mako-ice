import { Check, X, AlertTriangle, Building2, MapPin, Users, CalendarDays, Landmark } from 'lucide-react';
import climateHeroBg from '@/assets/climate-hero-bg.jpg';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  climatePros: string[];
  climateCons: string[];
  description: string;
  climateScore: number;
}

interface KrajData {
  id: string;
  name: string;
  nameEn: string;
  abbreviation: string;
  capitalName: string;
  capitalNameEn: string;
  zupanCandidates: Candidate[];
  primatorCandidates: Candidate[];
}

const krajeData: KrajData[] = [
  {
    id: 'kosicky',
    name: 'Košický kraj',
    nameEn: 'Košice Region',
    abbreviation: 'KSK',
    capitalName: 'Košice',
    capitalNameEn: 'Košice',
    zupanCandidates: [
      {
        id: 'ke-z-1',
        name: 'Rastislav Trnka',
        party: 'KDH, Aliancia, SPOLU',
        position: 'Súčasný predseda KSK',
        description: 'Aktuálny predseda Košického samosprávneho kraja od roku 2017.',
        climatePros: ['Spustil program „Zelená župa"', 'Podporil zatepľovanie krajských budov', 'Investície do regionálnej železničnej dopravy'],
        climateCons: ['Pomalý postup pri obnove lesov', 'Nedostatočná podpora pre ekologické poľnohospodárstvo', 'Krajské cesty stále uprednostňujú autá pred cyklistami'],
        climateScore: 62,
      },
      {
        id: 'ke-z-2',
        name: 'Viliam Zahorčák',
        party: 'SMER-SD, SNS',
        position: 'Bývalý primátor Michaloviec',
        description: 'Skúsený komunálny politik, bývalý dlhoročný primátor Michaloviec.',
        climatePros: ['Skúsenosti s riadením samosprávy', 'Podporuje rozvoj turizmu v prírode'],
        climateCons: ['Slabý klimatický program', 'Podporoval rozvoj automobilovej infraštruktúry', 'Nejasný postoj k obnoviteľným zdrojom'],
        climateScore: 28,
      },
    ],
    primatorCandidates: [
      {
        id: 'ke-p-1',
        name: 'Jaroslav Polaček',
        party: 'KDH, SPOLU, Za ľudí',
        position: 'Súčasný primátor',
        description: 'Súčasný primátor Košíc, ktorý sa zameriava na rozvoj mesta a modernizáciu infraštruktúry.',
        climatePros: ['Podporil rozšírenie cyklotrás v meste', 'Inicioval projekt zelených striech na mestských budovách', 'Podporuje elektrifikáciu mestskej dopravy'],
        climateCons: ['Pomalý postup pri znižovaní emisií z teplárenstva', 'Nedostatočná podpora solárnych panelov', 'Obmedzená ochrana mestskej zelene pri nových projektoch'],
        climateScore: 58,
      },
      {
        id: 'ke-p-2',
        name: 'Martin Smetanka',
        party: 'SMER-SD, HLAS-SD',
        position: 'Poslanec NR SR',
        description: 'Poslanec parlamentu s dlhoročnými skúsenosťami v regionálnej politike.',
        climatePros: ['Podporuje modernizáciu verejnej dopravy', 'Sľubuje investície do čistenia ovzdušia'],
        climateCons: ['Nejasný postoj k uhoľnej teplárni', 'Nepodporuje obmedzenie automobilovej dopravy v centre', 'Slabá história v oblasti klimatických opatrení'],
        climateScore: 31,
      },
      {
        id: 'ke-p-3',
        name: 'Lucia Kováčová',
        party: 'Nezávislá kandidátka',
        position: 'Environmentálna aktivistka',
        description: 'Dlhoročná environmentálna aktivistka a vedkyňa z Technickej univerzity v Košiciach.',
        climatePros: ['Jasný klimatický plán pre mesto', 'Podporuje úplný prechod na obnoviteľné zdroje do 2035', 'Plán na 100 km nových cyklotrás', 'Zavedenie nízkoemisných zón'],
        climateCons: ['Obmedzené politické skúsenosti', 'Niektoré návrhy môžu byť finančne náročné'],
        climateScore: 82,
      },
    ],
  },
  {
    id: 'presovsky',
    name: 'Prešovský kraj',
    nameEn: 'Prešov Region',
    abbreviation: 'PSK',
    capitalName: 'Prešov',
    capitalNameEn: 'Prešov',
    zupanCandidates: [
      {
        id: 'po-z-1', name: 'Milan Majerský', party: 'KDH', position: 'Súčasný predseda PSK',
        description: 'Aktuálny predseda Prešovského samosprávneho kraja.',
        climatePros: ['Podporil zatepľovanie krajských budov', 'Investície do cykloturistických trás'],
        climateCons: ['Obmedzená podpora obnoviteľných zdrojov', 'Nedostatočné riešenie odpadového hospodárstva'],
        climateScore: 48,
      },
      {
        id: 'po-z-2', name: 'Michal Kaliňák', party: 'SMER-SD', position: 'Politický analytik',
        description: 'Známy politický komentátor a bývalý štátny tajomník.',
        climatePros: ['Skúsenosti s riadením verejných financií'],
        climateCons: ['Nejasný klimatický program', 'Bez skúseností v regionálnej samospráve'],
        climateScore: 22,
      },
    ],
    primatorCandidates: [
      {
        id: 'po-p-1', name: 'František Oľha', party: 'Nezávislý', position: 'Súčasný primátor Prešova',
        description: 'Aktuálny primátor mesta Prešov.',
        climatePros: ['Podporil revitalizáciu mestských parkov', 'Investície do elektrobusov'],
        climateCons: ['Pomalá realizácia cykloinfraštruktúry', 'Nedostatočná ochrana zelených plôch'],
        climateScore: 45,
      },
    ],
  },
  {
    id: 'bratislavsky', name: 'Bratislavský kraj', nameEn: 'Bratislava Region', abbreviation: 'BSK',
    capitalName: 'Bratislava', capitalNameEn: 'Bratislava',
    zupanCandidates: [
      {
        id: 'ba-z-1', name: 'Juraj Droba', party: 'SaS, PS', position: 'Súčasný predseda BSK',
        description: 'Aktuálny predseda Bratislavského samosprávneho kraja.',
        climatePros: ['Silná podpora cyklistickej dopravy', 'Integrovaný dopravný systém', 'Zelené investície do krajských budov'],
        climateCons: ['Pomalá realizácia niektorých projektov'],
        climateScore: 71,
      },
    ],
    primatorCandidates: [
      {
        id: 'ba-p-1', name: 'Matúš Vallo', party: 'Team Vallo', position: 'Súčasný primátor',
        description: 'Architekt a súčasný primátor Bratislavy známy progresívnym prístupom k mestu.',
        climatePros: ['Klimatický plán Bratislavy 2030', 'Rozsiahla výsadba stromov', 'Pešie zóny a cyklotrasy', 'Modernizácia MHD'],
        climateCons: ['Kontroverzné parkovacie politiky'],
        climateScore: 85,
      },
      {
        id: 'ba-p-2', name: 'Rudolf Kusý', party: 'SMER-SD, HLAS-SD', position: 'Bývalý starosta Nového Mesta',
        description: 'Dlhoročný komunálny politik z bratislavského Nového Mesta.',
        climatePros: ['Skúsenosti so správou mestskej časti', 'Podporuje verejnú dopravu'],
        climateCons: ['Slabší klimatický program', 'Uprednostňuje automobilovú infraštruktúru'],
        climateScore: 35,
      },
    ],
  },
  {
    id: 'trnavsky', name: 'Trnavský kraj', nameEn: 'Trnava Region', abbreviation: 'TTSK',
    capitalName: 'Trnava', capitalNameEn: 'Trnava',
    zupanCandidates: [
      {
        id: 'tt-z-1', name: 'Jozef Viskupič', party: 'OĽaNO, Nezávislí', position: 'Súčasný predseda TTSK',
        description: 'Predseda Trnavského samosprávneho kraja od roku 2017.',
        climatePros: ['Program „Zelený kraj"', 'Podpora cyklotrás v regióne'],
        climateCons: ['Obmedzené investície do obnoviteľných zdrojov'],
        climateScore: 55,
      },
    ],
    primatorCandidates: [
      {
        id: 'tt-p-1', name: 'Peter Bročka', party: 'KDH, NOVA', position: 'Súčasný primátor Trnavy',
        description: 'Dlhoročný primátor mesta Trnava.',
        climatePros: ['Podpora pešej zóny v centre', 'Zelené verejné priestranstvá'],
        climateCons: ['Nedostatočná cyklistická infraštruktúra'],
        climateScore: 52,
      },
    ],
  },
  {
    id: 'trenciansky', name: 'Trenčiansky kraj', nameEn: 'Trenčín Region', abbreviation: 'TSK',
    capitalName: 'Trenčín', capitalNameEn: 'Trenčín',
    zupanCandidates: [
      {
        id: 'tn-z-1', name: 'Jaroslav Baška', party: 'SMER-SD', position: 'Súčasný predseda TSK',
        description: 'Predseda Trenčianskeho samosprávneho kraja.',
        climatePros: ['Investície do regionálnych ciest'],
        climateCons: ['Slabá podpora obnoviteľných zdrojov', 'Nedostatočný klimatický program'],
        climateScore: 25,
      },
    ],
    primatorCandidates: [
      {
        id: 'tn-p-1', name: 'Richard Rybníček', party: 'Nezávislý', position: 'Súčasný primátor Trenčína',
        description: 'Primátor Trenčína známy projektom „Trenčín si ty".',
        climatePros: ['Revitalizácia nábrežia Váhu', 'Podpora mestskej zelene', 'Pešia zóna v centre'],
        climateCons: ['Pomalý postup pri cyklistickej infraštruktúre'],
        climateScore: 68,
      },
    ],
  },
  {
    id: 'nitriansky', name: 'Nitriansky kraj', nameEn: 'Nitra Region', abbreviation: 'NSK',
    capitalName: 'Nitra', capitalNameEn: 'Nitra',
    zupanCandidates: [
      {
        id: 'nr-z-1', name: 'Branislav Becík', party: 'SMER-SD, SNS', position: 'Súčasný predseda NSK',
        description: 'Predseda Nitrianskeho samosprávneho kraja.',
        climatePros: ['Podpora agroturizmu'],
        climateCons: ['Slabý klimatický program', 'Nedostatočná podpora verejnej dopravy'],
        climateScore: 20,
      },
    ],
    primatorCandidates: [
      {
        id: 'nr-p-1', name: 'Marek Hattas', party: 'PS, SPOLU', position: 'Súčasný primátor Nitry',
        description: 'Primátor Nitry od roku 2018.',
        climatePros: ['Podpora cykloinfraštruktúry', 'Revitalizácia mestských parkov', 'Modernizácia verejného osvetlenia'],
        climateCons: ['Obmedzené zdroje na väčšie klimatické projekty'],
        climateScore: 65,
      },
    ],
  },
  {
    id: 'zilinsky', name: 'Žilinský kraj', nameEn: 'Žilina Region', abbreviation: 'ŽSK',
    capitalName: 'Žilina', capitalNameEn: 'Žilina',
    zupanCandidates: [
      {
        id: 'za-z-1', name: 'Erika Jurinová', party: 'OĽaNO', position: 'Súčasná predsedníčka ŽSK',
        description: 'Predsedníčka Žilinského samosprávneho kraja.',
        climatePros: ['Podpora turistických cyklotrás', 'Zatepľovanie krajských budov'],
        climateCons: ['Obmedzená podpora mestskej verejnej dopravy'],
        climateScore: 50,
      },
    ],
    primatorCandidates: [
      {
        id: 'za-p-1', name: 'Peter Fiabáne', party: 'Nezávislý', position: 'Súčasný primátor Žiliny',
        description: 'Primátor Žiliny so zameraním na modernizáciu mesta.',
        climatePros: ['Podpora elektrobusov', 'Rozšírenie mestskej zelene'],
        climateCons: ['Pomalá realizácia cykloinfraštruktúry', 'Kontroverzné stavebné projekty'],
        climateScore: 46,
      },
    ],
  },
  {
    id: 'banskobystricky', name: 'Banskobystrický kraj', nameEn: 'Banská Bystrica Region', abbreviation: 'BBSK',
    capitalName: 'Banská Bystrica', capitalNameEn: 'Banská Bystrica',
    zupanCandidates: [
      {
        id: 'bb-z-1', name: 'Ondrej Lunter', party: 'Nezávislý', position: 'Súčasný predseda BBSK',
        description: 'Predseda Banskobystrického samosprávneho kraja.',
        climatePros: ['Silná podpora regionálneho turizmu', 'Ochrana prírodného dedičstva', 'Zatepľovanie škôl a nemocníc'],
        climateCons: ['Obmedzené investície do verejnej dopravy'],
        climateScore: 70,
      },
    ],
    primatorCandidates: [
      {
        id: 'bb-p-1', name: 'Ján Nosko', party: 'Nezávislý', position: 'Súčasný primátor B. Bystrice',
        description: 'Dlhoročný primátor Banskej Bystrice.',
        climatePros: ['Podpora mestskej zelene', 'Revitalizácia verejných priestranstiev'],
        climateCons: ['Nedostatočná cyklistická infraštruktúra', 'Pomalá modernizácia MHD'],
        climateScore: 44,
      },
    ],
  },
];

const getScoreBarColor = (score: number): string => {
  if (score >= 70) return '#66BB6A';
  if (score >= 40) return '#FFA726';
  return '#EF5350';
};

const CandidateCard = ({ candidate, language }: { candidate: Candidate; language: string }) => {
  const barColor = getScoreBarColor(candidate.climateScore);

  return (
    <Card className="rounded-none" style={{ border: '2px solid #E0E0E0' }}>
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-lg sm:text-xl font-bold">{candidate.name}</CardTitle>
          <CardDescription className="text-sm mt-1">{candidate.party}</CardDescription>
          <Badge variant="outline" className="mt-2 rounded-none">
            {candidate.position}
          </Badge>
        </div>
        {/* Climate Score */}
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
            {language === 'sk' ? 'Klimatické skóre' : 'Climate Score'}
          </p>
          <p className="text-2xl font-bold" style={{ color: barColor }}>
            {candidate.climateScore} / 100
          </p>
          <div className="w-full h-2 rounded-full mt-2" style={{ backgroundColor: '#E0E0E0' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${candidate.climateScore}%`, backgroundColor: barColor }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{candidate.description}</p>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="font-semibold text-green-700 flex items-center gap-2 mb-2">
              <Check className="h-4 w-4" />
              {language === 'sk' ? 'Klimatické pozitíva' : 'Climate Pros'}
            </h4>
            <ul className="space-y-1">
              {candidate.climatePros.map((pro, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <Check className="h-3 w-3 text-green-600 mt-1 shrink-0" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-red-700 flex items-center gap-2 mb-2">
              <X className="h-4 w-4" />
              {language === 'sk' ? 'Klimatické negatíva' : 'Climate Cons'}
            </h4>
            <ul className="space-y-1">
              {candidate.climateCons.map((con, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <X className="h-3 w-3 text-red-600 mt-1 shrink-0" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Elections = () => {
  const { language } = useLanguage();
  const [selectedKraj, setSelectedKraj] = useState('kosicky');

  const currentKraj = krajeData.find(k => k.id === selectedKraj) || krajeData[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[70vh] sm:min-h-screen flex flex-col justify-center items-center text-center px-4 py-12 sm:py-20 text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${climateHeroBg})`, backgroundAttachment: 'fixed' }}
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 text-balance">
            Tvoj kraj. Tvoje voľby. Tvoja klíma.
          </h1>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto opacity-90">
            Zistite, ako kandidáti na župana a primátora plánujú riešiť ovzdušie, energetiku a zelenú infraštruktúru vo vašom regióne.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button 
              onClick={() => document.getElementById('kraj-select')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-white/90 w-full sm:w-auto"
            >
              Nájdi svojich kandidátov
            </button>
            <Link 
              to="/preco-volit"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-white hover:text-primary w-full sm:w-auto text-center"
            >
              Prečo na tom záleží?
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 px-4" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#E8F5E9' }}>
              <Landmark className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-2xl font-black">8 županov</p>
              <p className="text-sm text-muted-foreground">rozhoduje o miliardách eur z eurofondov ročne</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#E8F5E9' }}>
              <Users className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-2xl font-black">8 primátorov</p>
              <p className="text-sm text-muted-foreground">riadi dopravu, zeleň a energetiku krajských miest</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: '#E8F5E9' }}>
              <CalendarDays className="h-6 w-6" style={{ color: '#2E7D32' }} />
            </div>
            <div>
              <p className="text-2xl font-black">25. október 2026</p>
              <p className="text-sm text-muted-foreground">deň, keď môžeš ovplyvniť nasledujúce 4 roky</p>
            </div>
          </div>
        </div>
      </section>

      {/* Region Cards */}
      <section id="kraj-select" className="py-12 sm:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Vyberte váš kraj</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {krajeData.map((kraj) => (
              <button
                key={kraj.id}
                onClick={() => {
                  setSelectedKraj(kraj.id);
                  setTimeout(() => document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
                className={`p-4 border-2 text-left transition-all duration-200 hover:border-green-600 hover:shadow-md ${
                  selectedKraj === kraj.id ? 'border-green-600 bg-green-50' : ''
                }`}
                style={{ borderColor: selectedKraj === kraj.id ? '#2E7D32' : '#E0E0E0' }}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: '#2E7D32' }} />
                  <span className="font-semibold text-sm sm:text-base">{kraj.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Candidates */}
      <section id="candidates" className="py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Methodology Summary Box */}
          <div className="mb-6 p-4 text-sm" style={{ backgroundColor: '#F5F5F5' }}>
            <p className="text-muted-foreground">
              {language === 'sk'
                ? 'Skóre vychádza z programu kandidáta, jeho odpovedí na náš dotazník, hlasovaní v zastupiteľstve a online komunikácie. Váhy: Program 25 % | Dotazník 30 % | Hlasovanie 40 % | Online 5 %'
                : 'Score is based on candidate program, questionnaire responses, council votes and online communication. Weights: Program 25% | Questionnaire 30% | Voting 40% | Online 5%'}
            </p>
            <Link to="/metodologia" className="text-primary font-medium hover:underline mt-2 inline-block">
              {language === 'sk' ? 'Celá metodológia →' : 'Full methodology →'}
            </Link>
          </div>

          {/* Legal Disclaimer Banner */}
          <div className="mb-8 w-full p-4 italic text-sm" style={{ backgroundColor: '#FFF8E1', borderLeft: '4px solid #F9A825' }}>
            {language === 'sk'
              ? 'Toto hodnotenie slúži výlučne na informovanie voličov a vychádza z verejne dostupných dát. Klíma ťa potrebuje nikoho neodporúča ani neodmieta.'
              : 'This evaluation is solely for informing voters and is based on publicly available data. Klíma ťa potrebuje does not recommend or reject anyone.'}
          </div>

          {/* Tabs for župan / primátor */}
          <Tabs defaultValue="zupan" className="w-full">
            <TabsList className="w-full flex h-auto gap-2 bg-transparent mb-8 justify-center">
              <TabsTrigger 
                value="zupan"
                className="flex items-center gap-2 rounded-none border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
              >
                <MapPin className="h-4 w-4" />
                {`${currentKraj.abbreviation} – ${language === 'sk' ? 'Župan' : 'Chairman'}`}
              </TabsTrigger>
              <TabsTrigger 
                value="primator"
                className="flex items-center gap-2 rounded-none border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
              >
                <Building2 className="h-4 w-4" />
                {`${currentKraj.capitalName} – ${language === 'sk' ? 'Primátor' : 'Mayor'}`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="zupan">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {language === 'sk'
                    ? `Kandidáti na predsedu – ${currentKraj.name}`
                    : `Chairman Candidates – ${currentKraj.nameEn}`}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentKraj.zupanCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} language={language} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="primator">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                  {language === 'sk'
                    ? `Kandidáti na primátora – ${currentKraj.capitalName}`
                    : `Mayor Candidates – ${currentKraj.capitalNameEn}`}
                </h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentKraj.primatorCandidates.map((candidate) => (
                  <CandidateCard key={candidate.id} candidate={candidate} language={language} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 px-4 bg-yellow-50 border-y border-yellow-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">
                {language === 'sk' ? 'Upozornenie' : 'Disclaimer'}
              </h3>
              <p className="text-sm text-yellow-700">
                {language === 'sk'
                  ? 'Toto hodnotenie je založené na verejne dostupných informáciách a vyjadreniach kandidátov. Údaje slúžia len na informačné účely. Pred voľbami si overte aktuálne postoje kandidátov. Táto stránka používa ilustračné údaje.'
                  : 'This evaluation is based on publicly available information and candidate statements. Data is for informational purposes only. Verify current candidate positions before voting. This page uses illustrative data.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Elections;
