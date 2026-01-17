import { ArrowLeft, Check, X, AlertTriangle, ThumbsUp, ThumbsDown, Users, Building2, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Footer } from '@/components/Footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Candidate {
  id: string;
  name: string;
  party: string;
  position: string;
  photo?: string;
  climatePros: string[];
  climateCons: string[];
  recommended: boolean;
  description: string;
}

interface ElectionType {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ReactNode;
  candidates: Candidate[];
}

const electionsData: ElectionType[] = [
  {
    id: 'primator',
    title: 'Primátor mesta Košice',
    titleEn: 'Mayor of Košice',
    description: 'Volíme primátora celého mesta Košice',
    descriptionEn: 'Electing the mayor of the entire city of Košice',
    icon: <Building2 className="h-5 w-5" />,
    candidates: [
      {
        id: '1',
        name: 'Jaroslav Polaček',
        party: 'KDH, SPOLU, Za ľudí',
        position: 'Súčasný primátor',
        description: 'Súčasný primátor Košíc, ktorý sa zameriava na rozvoj mesta a modernizáciu infraštruktúry.',
        climatePros: [
          'Podporil rozšírenie cyklotrás v meste',
          'Inicioval projekt zelených striech na mestských budovách',
          'Podporuje elektrifikáciu mestskej dopravy'
        ],
        climateCons: [
          'Pomalý postup pri znižovaní emisií z teplárenstva',
          'Nedostatočná podpora solárnych panelov',
          'Obmedzená ochrana mestskej zelene pri nových projektoch'
        ],
        recommended: true
      },
      {
        id: '2',
        name: 'Martin Smetanka',
        party: 'SMER-SD, HLAS-SD',
        position: 'Poslanec NR SR',
        description: 'Poslanec parlamentu s dlhoročnými skúsenosťami v regionálnej politike.',
        climatePros: [
          'Podporuje modernizáciu verejnej dopravy',
          'Sľubuje investície do čistenia ovzdušia'
        ],
        climateCons: [
          'Nejasný postoj k uhoľnej teplárni',
          'Nepodporuje obmedzenie automobilovej dopravy v centre',
          'Slabá história v oblasti klimatických opatrení',
          'Podporoval projekty ťažobného priemyslu'
        ],
        recommended: false
      },
      {
        id: '3',
        name: 'Lucia Kováčová',
        party: 'Nezávislá kandidátka',
        position: 'Environmentálna aktivistka',
        description: 'Dlhoročná environmentálna aktivistka a vedkyňa z Technickej univerzity v Košiciach.',
        climatePros: [
          'Jasný klimatický plán pre mesto',
          'Podporuje úplný prechod na obnoviteľné zdroje do 2035',
          'Plán na 100 km nových cyklotrás',
          'Zavedenie nízkoemisných zón'
        ],
        climateCons: [
          'Obmedzené politické skúsenosti',
          'Niektoré návrhy môžu byť finančne náročné'
        ],
        recommended: true
      }
    ]
  },
  {
    id: 'zupan',
    title: 'Predseda Košického samosprávneho kraja',
    titleEn: 'Chairman of Košice Self-Governing Region',
    description: 'Volíme župana - predsedu Košického samosprávneho kraja',
    descriptionEn: 'Electing the chairman of the Košice Self-Governing Region',
    icon: <MapPin className="h-5 w-5" />,
    candidates: [
      {
        id: '4',
        name: 'Rastislav Trnka',
        party: 'KDH, Aliancia, SPOLU',
        position: 'Súčasný predseda KSK',
        description: 'Aktuálny predseda Košického samosprávneho kraja od roku 2017.',
        climatePros: [
          'Spustil program „Zelená župa"',
          'Podporil zatepľovanie krajských budov',
          'Investície do regionálnej železničnej dopravy'
        ],
        climateCons: [
          'Pomalý postup pri obnove lesov',
          'Nedostatočná podpora pre ekologické poľnohospodárstvo',
          'Krajské cesty stále uprednostňujú autá pred cyklistami'
        ],
        recommended: true
      },
      {
        id: '5',
        name: 'Viliam Zahorčák',
        party: 'SMER-SD, SNS',
        position: 'Bývalý primátor Michaloviec',
        description: 'Skúsený komunálny politik, bývalý dlhoročný primátor Michaloviec.',
        climatePros: [
          'Skúsenosti s riadením samosprávy',
          'Podporuje rozvoj turizmu v prírode'
        ],
        climateCons: [
          'Slabý klimatický program',
          'Podporoval rozvoj automobilovej infraštruktúry',
          'Nejasný postoj k obnoviteľným zdrojom',
          'Nepodporuje klimatickú núdzu'
        ],
        recommended: false
      }
    ]
  },
  {
    id: 'starosta',
    title: 'Starostovia mestských častí',
    titleEn: 'District Mayors',
    description: 'Volíme starostov 22 mestských častí Košíc',
    descriptionEn: 'Electing mayors of 22 city districts of Košice',
    icon: <Users className="h-5 w-5" />,
    candidates: [
      {
        id: '6',
        name: 'Peter Kiska',
        party: 'PS, SPOLU',
        position: 'Kandidát na starostu - Staré Mesto',
        description: 'Urbanista a architekt so zameraním na udržateľný rozvoj miest.',
        climatePros: [
          'Plán pešej zóny v celom centre',
          'Zelené parkovacie plochy',
          'Podpora lokálnych farmárskych trhov',
          'Zníženie svetelného znečistenia'
        ],
        climateCons: [
          'Nový v komunálnej politike'
        ],
        recommended: true
      },
      {
        id: '7',
        name: 'Mária Bednárová',
        party: 'SMER-SD',
        position: 'Kandidátka na starostku - Sídlisko KVP',
        description: 'Dlhoročná poslankyňa mestského zastupiteľstva.',
        climatePros: [
          'Podporuje komunitné záhrady'
        ],
        climateCons: [
          'Podporovala výstavbu parkovísk na zelených plochách',
          'Slabá podpora cyklistickej infraštruktúry',
          'Uprednostňuje autá pred MHD'
        ],
        recommended: false
      },
      {
        id: '8',
        name: 'Tomáš Zelený',
        party: 'Zelení, nezávislí',
        position: 'Kandidát na starostu - Západ',
        description: 'Environmentálny inžinier a miestny aktivista.',
        climatePros: [
          'Komplexný klimatický akčný plán',
          'Podpora dažďových záhrad',
          'Ochrana stromov pri výstavbe',
          'Bezplatná MHD pre študentov'
        ],
        climateCons: [
          'Niektoré návrhy môžu byť kontroverzné'
        ],
        recommended: true
      }
    ]
  }
];

const CandidateCard = ({ candidate, language }: { candidate: Candidate; language: string }) => {
  return (
    <Card className={`rounded-none border-2 ${candidate.recommended ? 'border-green-500 bg-green-50/30' : 'border-red-300 bg-red-50/20'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold">{candidate.name}</CardTitle>
            <CardDescription className="text-sm mt-1">{candidate.party}</CardDescription>
            <Badge variant="outline" className="mt-2 rounded-none">
              {candidate.position}
            </Badge>
          </div>
          <div className={`p-2 rounded-full ${candidate.recommended ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {candidate.recommended ? <ThumbsUp className="h-5 w-5" /> : <ThumbsDown className="h-5 w-5" />}
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
        
        <div className={`p-3 rounded-none ${candidate.recommended ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'}`}>
          <div className="flex items-center gap-2 font-semibold">
            {candidate.recommended ? (
              <>
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="text-green-700">
                  {language === 'sk' ? 'Odporúčaný z klimatického hľadiska' : 'Recommended for climate'}
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-red-700">
                  {language === 'sk' ? 'Neodporúčaný z klimatického hľadiska' : 'Not recommended for climate'}
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Elections = () => {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero with Parallax */}
      <section className="relative min-h-[70vh] sm:min-h-screen flex flex-col justify-center items-center text-center px-4 py-12 sm:py-20 bg-primary text-primary-foreground overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"
          style={{ 
            backgroundAttachment: 'fixed',
            backgroundSize: '60px 60px'
          }}
        />
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 text-balance">
            {language === 'sk' 
              ? 'Voľby 2026' 
              : 'Elections 2026'}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl leading-relaxed mb-4 max-w-3xl mx-auto opacity-90">
            {language === 'sk' ? 'Košice & Košický kraj' : 'Košice & Košice Region'}
          </p>
          <p className="text-base sm:text-lg leading-relaxed mb-8 sm:mb-12 max-w-2xl mx-auto opacity-80">
            {language === 'sk'
              ? 'Hodnotíme kandidátov na základe ich postojov a činov v oblasti klimatickej zmeny. Vyberte si informovane pre budúcnosť nášho regiónu.'
              : 'We evaluate candidates based on their climate change positions and actions. Choose informed for the future of our region.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button 
              onClick={() => document.getElementById('candidates')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-white/90 w-full sm:w-auto"
            >
              {language === 'sk' ? 'Pozrieť kandidátov' : 'View Candidates'}
            </button>
            <Link 
              to="/klimaticke-data"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-white hover:text-primary w-full sm:w-auto text-center"
            >
              {language === 'sk' ? 'Klimatické dáta' : 'Climate Data'}
            </Link>
          </div>
        </div>
      </section>

      {/* Election Types Info */}
      <section className="py-8 px-4 bg-gray-50 border-y">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">
            {language === 'sk' ? 'Typy volieb v Košiciach' : 'Types of elections in Košice'}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-4 bg-white border">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                {language === 'sk' ? 'Primátor' : 'Mayor'}
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'sk' 
                  ? 'Vedúci celého mesta Košice s rozhodovacou právomocou v oblasti dopravy, životného prostredia a rozvoja.'
                  : 'Leader of entire Košice city with decision power over transport, environment and development.'}
              </p>
            </div>
            <div className="p-4 bg-white border">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <MapPin className="h-5 w-5 text-primary" />
                {language === 'sk' ? 'Župan (KSK)' : 'Regional Chairman'}
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'sk'
                  ? 'Predseda Košického samosprávneho kraja - riadi regionálne cesty, stredné školy a sociálne služby.'
                  : 'Chairman of Košice Region - manages regional roads, secondary schools and social services.'}
              </p>
            </div>
            <div className="p-4 bg-white border">
              <div className="flex items-center gap-2 font-semibold mb-2">
                <Users className="h-5 w-5 text-primary" />
                {language === 'sk' ? 'Starosta' : 'District Mayor'}
              </div>
              <p className="text-sm text-muted-foreground">
                {language === 'sk'
                  ? 'Košice má 22 mestských častí, každá so svojím starostom a miestnym zastupiteľstvom.'
                  : 'Košice has 22 city districts, each with its own mayor and local council.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Candidates */}
      <section id="candidates" className="py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="primator" className="w-full">
            <TabsList className="w-full flex flex-wrap h-auto gap-2 bg-transparent mb-8 justify-center">
              {electionsData.map((election) => (
                <TabsTrigger 
                  key={election.id} 
                  value={election.id}
                  className="flex items-center gap-2 rounded-none border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2"
                >
                  {election.icon}
                  {language === 'sk' ? election.title : election.titleEn}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {electionsData.map((election) => (
              <TabsContent key={election.id} value={election.id}>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {language === 'sk' ? election.title : election.titleEn}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'sk' ? election.description : election.descriptionEn}
                  </p>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {election.candidates.map((candidate) => (
                    <CandidateCard 
                      key={candidate.id} 
                      candidate={candidate} 
                      language={language}
                    />
                  ))}
                </div>
              </TabsContent>
            ))}
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
