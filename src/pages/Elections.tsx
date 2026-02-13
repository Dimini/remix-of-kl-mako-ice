import { Check, X, AlertTriangle, Building2, MapPin } from 'lucide-react';
import climateHeroBg from '@/assets/climate-hero-bg.jpg';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  climatePros: string[];
  climateCons: string[];
  description: string;
}

interface KrajData {
  id: string;
  name: string;
  nameEn: string;
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
      },
      {
        id: 'ke-z-2',
        name: 'Viliam Zahorčák',
        party: 'SMER-SD, SNS',
        position: 'Bývalý primátor Michaloviec',
        description: 'Skúsený komunálny politik, bývalý dlhoročný primátor Michaloviec.',
        climatePros: ['Skúsenosti s riadením samosprávy', 'Podporuje rozvoj turizmu v prírode'],
        climateCons: ['Slabý klimatický program', 'Podporoval rozvoj automobilovej infraštruktúry', 'Nejasný postoj k obnoviteľným zdrojom'],
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
      },
      {
        id: 'ke-p-2',
        name: 'Martin Smetanka',
        party: 'SMER-SD, HLAS-SD',
        position: 'Poslanec NR SR',
        description: 'Poslanec parlamentu s dlhoročnými skúsenosťami v regionálnej politike.',
        climatePros: ['Podporuje modernizáciu verejnej dopravy', 'Sľubuje investície do čistenia ovzdušia'],
        climateCons: ['Nejasný postoj k uhoľnej teplárni', 'Nepodporuje obmedzenie automobilovej dopravy v centre', 'Slabá história v oblasti klimatických opatrení'],
      },
      {
        id: 'ke-p-3',
        name: 'Lucia Kováčová',
        party: 'Nezávislá kandidátka',
        position: 'Environmentálna aktivistka',
        description: 'Dlhoročná environmentálna aktivistka a vedkyňa z Technickej univerzity v Košiciach.',
        climatePros: ['Jasný klimatický plán pre mesto', 'Podporuje úplný prechod na obnoviteľné zdroje do 2035', 'Plán na 100 km nových cyklotrás', 'Zavedenie nízkoemisných zón'],
        climateCons: ['Obmedzené politické skúsenosti', 'Niektoré návrhy môžu byť finančne náročné'],
      },
    ],
  },
  {
    id: 'presovsky',
    name: 'Prešovský kraj',
    nameEn: 'Prešov Region',
    capitalName: 'Prešov',
    capitalNameEn: 'Prešov',
    zupanCandidates: [
      {
        id: 'po-z-1',
        name: 'Milan Majerský',
        party: 'KDH',
        position: 'Súčasný predseda PSK',
        description: 'Aktuálny predseda Prešovského samosprávneho kraja.',
        climatePros: ['Podporil zatepľovanie krajských budov', 'Investície do cykloturistických trás'],
        climateCons: ['Obmedzená podpora obnoviteľných zdrojov', 'Nedostatočné riešenie odpadového hospodárstva'],
      },
      {
        id: 'po-z-2',
        name: 'Michal Kaliňák',
        party: 'SMER-SD',
        position: 'Politický analytik',
        description: 'Známy politický komentátor a bývalý štátny tajomník.',
        climatePros: ['Skúsenosti s riadením verejných financií'],
        climateCons: ['Nejasný klimatický program', 'Bez skúseností v regionálnej samospráve'],
      },
    ],
    primatorCandidates: [
      {
        id: 'po-p-1',
        name: 'František Oľha',
        party: 'Nezávislý',
        position: 'Súčasný primátor Prešova',
        description: 'Aktuálny primátor mesta Prešov.',
        climatePros: ['Podporil revitalizáciu mestských parkov', 'Investície do elektrobusov'],
        climateCons: ['Pomalá realizácia cykloinfraštruktúry', 'Nedostatočná ochrana zelených plôch'],
      },
    ],
  },
  {
    id: 'bratislavsky',
    name: 'Bratislavský kraj',
    nameEn: 'Bratislava Region',
    capitalName: 'Bratislava',
    capitalNameEn: 'Bratislava',
    zupanCandidates: [
      {
        id: 'ba-z-1',
        name: 'Juraj Droba',
        party: 'SaS, PS',
        position: 'Súčasný predseda BSK',
        description: 'Aktuálny predseda Bratislavského samosprávneho kraja.',
        climatePros: ['Silná podpora cyklistickej dopravy', 'Integrovaný dopravný systém', 'Zelené investície do krajských budov'],
        climateCons: ['Pomalá realizácia niektorých projektov'],
      },
    ],
    primatorCandidates: [
      {
        id: 'ba-p-1',
        name: 'Matúš Vallo',
        party: 'Team Vallo',
        position: 'Súčasný primátor',
        description: 'Architekt a súčasný primátor Bratislavy známy progresívnym prístupom k mestu.',
        climatePros: ['Klimatický plán Bratislavy 2030', 'Rozsiahla výsadba stromov', 'Pešie zóny a cyklotrasy', 'Modernizácia MHD'],
        climateCons: ['Kontroverzné parkovacie politiky'],
      },
      {
        id: 'ba-p-2',
        name: 'Rudolf Kusý',
        party: 'SMER-SD, HLAS-SD',
        position: 'Bývalý starosta Nového Mesta',
        description: 'Dlhoročný komunálny politik z bratislavského Nového Mesta.',
        climatePros: ['Skúsenosti so správou mestskej časti', 'Podporuje verejnú dopravu'],
        climateCons: ['Slabší klimatický program', 'Uprednostňuje automobilovú infraštruktúru'],
      },
    ],
  },
  {
    id: 'trnavsky',
    name: 'Trnavský kraj',
    nameEn: 'Trnava Region',
    capitalName: 'Trnava',
    capitalNameEn: 'Trnava',
    zupanCandidates: [
      {
        id: 'tt-z-1',
        name: 'Jozef Viskupič',
        party: 'OĽaNO, Nezávislí',
        position: 'Súčasný predseda TTSK',
        description: 'Predseda Trnavského samosprávneho kraja od roku 2017.',
        climatePros: ['Program „Zelený kraj"', 'Podpora cyklotrás v regióne'],
        climateCons: ['Obmedzené investície do obnoviteľných zdrojov'],
      },
    ],
    primatorCandidates: [
      {
        id: 'tt-p-1',
        name: 'Peter Bročka',
        party: 'KDH, NOVA',
        position: 'Súčasný primátor Trnavy',
        description: 'Dlhoročný primátor mesta Trnava.',
        climatePros: ['Podpora pešej zóny v centre', 'Zelené verejné priestranstvá'],
        climateCons: ['Nedostatočná cyklistická infraštruktúra'],
      },
    ],
  },
  {
    id: 'trenciansky',
    name: 'Trenčiansky kraj',
    nameEn: 'Trenčín Region',
    capitalName: 'Trenčín',
    capitalNameEn: 'Trenčín',
    zupanCandidates: [
      {
        id: 'tn-z-1',
        name: 'Jaroslav Baška',
        party: 'SMER-SD',
        position: 'Súčasný predseda TSK',
        description: 'Predseda Trenčianskeho samosprávneho kraja.',
        climatePros: ['Investície do regionálnych ciest'],
        climateCons: ['Slabá podpora obnoviteľných zdrojov', 'Nedostatočný klimatický program'],
      },
    ],
    primatorCandidates: [
      {
        id: 'tn-p-1',
        name: 'Richard Rybníček',
        party: 'Nezávislý',
        position: 'Súčasný primátor Trenčína',
        description: 'Primátor Trenčína známy projektom „Trenčín si ty".',
        climatePros: ['Revitalizácia nábrežia Váhu', 'Podpora mestskej zelene', 'Pešia zóna v centre'],
        climateCons: ['Pomalý postup pri cyklistickej infraštruktúre'],
      },
    ],
  },
  {
    id: 'nitriansky',
    name: 'Nitriansky kraj',
    nameEn: 'Nitra Region',
    capitalName: 'Nitra',
    capitalNameEn: 'Nitra',
    zupanCandidates: [
      {
        id: 'nr-z-1',
        name: 'Branislav Becík',
        party: 'SMER-SD, SNS',
        position: 'Súčasný predseda NSK',
        description: 'Predseda Nitrianskeho samosprávneho kraja.',
        climatePros: ['Podpora agroturizmu'],
        climateCons: ['Slabý klimatický program', 'Nedostatočná podpora verejnej dopravy'],
      },
    ],
    primatorCandidates: [
      {
        id: 'nr-p-1',
        name: 'Marek Hattas',
        party: 'PS, SPOLU',
        position: 'Súčasný primátor Nitry',
        description: 'Primátor Nitry od roku 2018.',
        climatePros: ['Podpora cykloinfraštruktúry', 'Revitalizácia mestských parkov', 'Modernizácia verejného osvetlenia'],
        climateCons: ['Obmedzené zdroje na väčšie klimatické projekty'],
      },
    ],
  },
  {
    id: 'zilinsky',
    name: 'Žilinský kraj',
    nameEn: 'Žilina Region',
    capitalName: 'Žilina',
    capitalNameEn: 'Žilina',
    zupanCandidates: [
      {
        id: 'za-z-1',
        name: 'Erika Jurinová',
        party: 'OĽaNO',
        position: 'Súčasná predsedníčka ŽSK',
        description: 'Predsedníčka Žilinského samosprávneho kraja.',
        climatePros: ['Podpora turistických cyklotrás', 'Zatepľovanie krajských budov'],
        climateCons: ['Obmedzená podpora mestskej verejnej dopravy'],
      },
    ],
    primatorCandidates: [
      {
        id: 'za-p-1',
        name: 'Peter Fiabáne',
        party: 'Nezávislý',
        position: 'Súčasný primátor Žiliny',
        description: 'Primátor Žiliny so zameraním na modernizáciu mesta.',
        climatePros: ['Podpora elektrobusov', 'Rozšírenie mestskej zelene'],
        climateCons: ['Pomalá realizácia cykloinfraštruktúry', 'Kontroverzné stavebné projekty'],
      },
    ],
  },
  {
    id: 'banskobystricky',
    name: 'Banskobystrický kraj',
    nameEn: 'Banská Bystrica Region',
    capitalName: 'Banská Bystrica',
    capitalNameEn: 'Banská Bystrica',
    zupanCandidates: [
      {
        id: 'bb-z-1',
        name: 'Ondrej Lunter',
        party: 'Nezávislý',
        position: 'Súčasný predseda BBSK',
        description: 'Predseda Banskobystrického samosprávneho kraja.',
        climatePros: ['Silná podpora regionálneho turizmu', 'Ochrana prírodného dedičstva', 'Zatepľovanie škôl a nemocníc'],
        climateCons: ['Obmedzené investície do verejnej dopravy'],
      },
    ],
    primatorCandidates: [
      {
        id: 'bb-p-1',
        name: 'Ján Nosko',
        party: 'Nezávislý',
        position: 'Súčasný primátor B. Bystrice',
        description: 'Dlhoročný primátor Banskej Bystrice.',
        climatePros: ['Podpora mestskej zelene', 'Revitalizácia verejných priestranstiev'],
        climateCons: ['Nedostatočná cyklistická infraštruktúra', 'Pomalá modernizácia MHD'],
      },
    ],
  },
];

const CandidateCard = ({ candidate, language }: { candidate: Candidate; language: string }) => {
  return (
    <Card className="rounded-none border-2 border-border">
      <CardHeader className="pb-3">
        <div>
          <CardTitle className="text-lg sm:text-xl font-bold">{candidate.name}</CardTitle>
          <CardDescription className="text-sm mt-1">{candidate.party}</CardDescription>
          <Badge variant="outline" className="mt-2 rounded-none">
            {candidate.position}
          </Badge>
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
      {/* Hero with Parallax */}
      <section className="relative min-h-[70vh] sm:min-h-screen flex flex-col justify-center items-center text-center px-4 py-12 sm:py-20 text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${climateHeroBg})`, backgroundAttachment: 'fixed' }}
        />
        <div className="absolute inset-0 bg-primary/75" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 text-balance">
            {language === 'sk' ? 'Voľby 2026' : 'Elections 2026'}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed mb-4 max-w-3xl mx-auto opacity-90">
            {language === 'sk' ? 'Slovensko' : 'Slovakia'}
          </p>
          <p className="text-base sm:text-lg leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto opacity-80">
            {language === 'sk'
              ? 'Hodnotíme kandidátov na základe ich postojov a činov v oblasti klimatickej zmeny. Vyberte si informovane pre budúcnosť vášho regiónu.'
              : 'We evaluate candidates based on their climate change positions and actions. Choose informed for the future of your region.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button 
              onClick={() => document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-white/90 w-full sm:w-auto"
            >
              {language === 'sk' ? 'Pozrieť kandidátov' : 'View Candidates'}
            </button>
            <Link 
              to="/preco-volit"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-white hover:text-primary w-full sm:w-auto text-center"
            >
              {language === 'sk' ? 'Prečo voliť?' : 'Why Vote?'}
            </Link>
          </div>
        </div>
      </section>

      {/* Election Types Info */}
      <section className="py-8 px-4 bg-gray-50 border-y">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">
            {language === 'sk' ? 'Typy volieb' : 'Types of elections'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 bg-white border">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                {language === 'sk' ? 'Župan (predseda VÚC)' : 'Regional Chairman'}
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'sk'
                  ? 'Predseda samosprávneho kraja - riadi regionálne cesty, stredné školy a sociálne služby.'
                  : 'Chairman of the self-governing region - manages regional roads, secondary schools and social services.'}
              </p>
            </div>
            <div className="p-4 bg-white border">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                {language === 'sk' ? 'Primátor krajského mesta' : 'Regional Capital Mayor'}
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'sk'
                  ? 'Vedúci krajského mesta s rozhodovacou právomocou v oblasti dopravy, životného prostredia a rozvoja.'
                  : 'Leader of the regional capital with decision power over transport, environment and development.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kraj Selector + Candidates */}
      <section id="candidates" className="py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Kraj Selector */}
          <div className="mb-8 max-w-md mx-auto">
            <label className="block text-sm font-semibold mb-2 text-center">
              {language === 'sk' ? 'Vyberte kraj' : 'Select Region'}
            </label>
            <Select value={selectedKraj} onValueChange={setSelectedKraj}>
              <SelectTrigger className="rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {krajeData.map((kraj) => (
                  <SelectItem key={kraj.id} value={kraj.id}>
                    {language === 'sk' ? kraj.name : kraj.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabs for župan / primátor */}
          <Tabs defaultValue="zupan" className="w-full">
            <TabsList className="w-full flex h-auto gap-2 bg-transparent mb-8 justify-center">
              <TabsTrigger 
                value="zupan"
                className="flex items-center gap-2 rounded-none border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
              >
                <MapPin className="h-5 w-5" />
                {language === 'sk'
                  ? `Predseda ${currentKraj.name.replace(' kraj', 'ého kraja').replace('Košický', 'Košického').replace('Prešovský', 'Prešovského').replace('Bratislavský', 'Bratislavského').replace('Trnavský', 'Trnavského').replace('Trenčiansky', 'Trenčianskeho').replace('Nitriansky', 'Nitrianskeho').replace('Žilinský', 'Žilinského').replace('Banskobystrický', 'Banskobystrického')}`
                  : `${currentKraj.nameEn} Chairman`}
              </TabsTrigger>
              <TabsTrigger 
                value="primator"
                className="flex items-center gap-2 rounded-none border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
              >
                <Building2 className="h-5 w-5" />
                {language === 'sk'
                  ? `Primátor – ${currentKraj.capitalName}`
                  : `Mayor – ${currentKraj.capitalNameEn}`}
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
                  ? 'Toto hodnotenie je založené na verejne dostupných informáciách a vyjadreniach kandidátov. Údaje slúžia len na informačné účely a nepredstavujú oficiálne odporúčanie. Pred voľbami si overte aktuálne postoje kandidátov. Táto stránka používa ilustračné údaje.'
                  : 'This evaluation is based on publicly available information and candidate statements. Data is for informational purposes only and does not represent an official recommendation. Verify current candidate positions before voting. This page uses illustrative data.'}
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
