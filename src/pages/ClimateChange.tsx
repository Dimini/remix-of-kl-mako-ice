import { Thermometer, TrendingUp, Droplets, AlertTriangle } from "lucide-react";
export default function ClimateChange() {
  return <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <h1 className="text-4xl font-bold text-foreground mb-8 sm:text-5xl">Klimatická zmena (faktaoklimatu.cz)

      </h1>
        
        {/* Navigation Tabs */}
        <nav className="flex flex-wrap gap-4 sm:gap-6 mb-12 border-b border-border pb-4">
          <a href="#uvod" className="text-sm sm:text-base hover:text-primary transition-colors">
            Úvod
          </a>
          <a href="#data" className="text-sm sm:text-base hover:text-primary transition-colors">
            Dáta a pozorované zmeny
          </a>
          <a href="#fyzika" className="text-sm sm:text-base hover:text-primary transition-colors">
            Fyzikálne základy a princípy
          </a>
          <a href="#dopady" className="text-sm sm:text-base hover:text-primary transition-colors">
            Dopady a budúci vývoj
          </a>
          <a href="#extremy" className="text-sm sm:text-base hover:text-primary transition-colors">
            Extrémne javy
          </a>
        </nav>

        {/* Intro Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-foreground">
              <strong>Súčasná klimatická zmena je způsobená činnosťou človeka</strong>. Tým sa výrazne líši od zmien klímy v minulosti. <strong>Spaľovanie uhlia, ropy a zemného plynu</strong> a niektoré ďalšie činnosti <strong>menia zloženie atmosféry</strong> a pridávajú do nej skleníkové plyny. Zosilnený skleníkový efekt potom spôsobuje otepľovanie s dôsledkami ako topenie ľadovcov, vzostup hladín oceánov, dlhodobé suchá alebo častejšie vlny horúčav a iné extrémne prejavy počasia.
            </p>
            <p className="text-lg leading-relaxed text-foreground">
              <strong>Dopady zmeny klímy</strong> na spoločnosť i prírodu, s ktorými sa budeme stretávať v nasledujúcich desaťročiach, <strong>budú priamo závislé na množstve skleníkových plynov, ktoré ešte do atmosféry vypustíme</strong>, či už spaľovaním fosílnych palív alebo inými aktivitami, pri ktorých vzniká veľké množstvo emisií.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md aspect-square bg-primary/10 rounded-lg flex items-center justify-center">
              <Thermometer className="w-32 h-32 text-primary" />
            </div>
          </div>
        </div>

        {/* Key Statistics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary mb-2">420 ppm</div>
            <div className="text-sm text-muted-foreground">
              koncentrácia CO₂ v atmosfére v roku 2022
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary mb-2">+1,2 °C</div>
            <div className="text-sm text-muted-foreground">
              oteplenie sveta od druhej polovice 19. storočia
            </div>
          </div>
          
          <div className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl font-bold text-primary mb-2">+2,3 °C</div>
            <div className="text-sm text-muted-foreground">
              oteplenie Slovenska od roku 1960
            </div>
          </div>
        </div>

        {/* Arctic Ice Statistics */}
        <div className="bg-card rounded-lg border p-6 mb-16">
          <h3 className="text-xl font-semibold mb-4">Zaľadnenie Severného ľadového oceánu</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">7,5 mil. km²</div>
              <div className="text-sm text-muted-foreground">v septembri 1980</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">4,7 mil. km²</div>
              <div className="text-sm text-muted-foreground">v septembri 2021</div>
            </div>
          </div>
        </div>

        {/* Sea Level Rise */}
        <div className="bg-card rounded-lg border p-6 mb-16">
          <h3 className="text-xl font-semibold mb-4">Zvýšenie hladín oceánov</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">20 cm</div>
              <div className="text-sm text-muted-foreground">do roku 2018</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">80-150 cm</div>
              <div className="text-sm text-muted-foreground">očakávaný nárast do roku 2150</div>
            </div>
          </div>
        </div>

        {/* In a Nutshell Section */}
        <section id="uvod" className="mb-16">
          <h2 className="text-3xl font-bold mb-8">V kostce</h2>
          <p className="text-lg mb-8 text-muted-foreground">
            Ako sa vyznať v zložitej problematike klímy a jej zmien? Pre začiatok je dobré vedieť, že:
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg border p-6">
              <div className="text-6xl font-bold text-primary/20 mb-4">1</div>
              <h3 className="text-lg font-semibold mb-3">
                Súčasná zmena klímy je <strong>séria príčin a následkov</strong>
              </h3>
              <p className="text-sm text-muted-foreground">
                Ľudstvo mení zloženie atmosféry, čo zosilňuje skleníkový efekt. Ten potom spôsobuje otepľovanie, topenie ľadovcov a ďalšie javy.
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <div className="text-6xl font-bold text-primary/20 mb-4">2</div>
              <h3 className="text-lg font-semibold mb-3">
                <strong>Čím viac skleníkových plynov</strong> ľudstvo vypustí do atmosféry, <strong>tým viac sa planéta oteplí</strong>
              </h3>
              <p className="text-sm text-muted-foreground">
                Množstvo emisií priamo určuje rozsah zmien klímy a ich dopadov na spoločnosť i prírodu.
              </p>
            </div>

            <div className="bg-card rounded-lg border p-6">
              <div className="text-6xl font-bold text-primary/20 mb-4">3</div>
              <h3 className="text-lg font-semibold mb-3">
                Klimatická zmena sa neprejavuje všade stejne: <strong>rôzne oblasti sveta sa otepľujú rôzne rýchlo</strong>
              </h3>
              <p className="text-sm text-muted-foreground">
                Slovensko sa otepľuje rýchlejšie než svetový priemer. Zmeny sa prejavujú v teplotách, zrážkach a extrémnych javoch.
              </p>
            </div>
          </div>
        </section>

        {/* Data Section */}
        <section id="data" className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Dáta a pozorované zmeny</h2>
          <div className="bg-card rounded-lg border p-6 sm:p-8">
            <p className="text-lg text-muted-foreground mb-4">
              Merania ukazujú jednoznačné trendy otepľovania a zmien v zrážkových úhrnoch. Slovensko sa otepľuje rýchlejšie než svetový priemer.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Rast teplôt</div>
                  <div className="text-sm text-muted-foreground">
                    Priemerná teplota na Slovensku vzrástla o viac ako 2°C od roku 1960
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Droplets className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Zmeny zrážok</div>
                  <div className="text-sm text-muted-foreground">
                    Menia sa rozloženie a intenzita zrážok počas roka
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Physics Section */}
        <section id="fyzika" className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Fyzikálne základy a princípy</h2>
          <div className="bg-card rounded-lg border p-6 sm:p-8">
            <p className="text-lg text-muted-foreground mb-4">
              Skleníkový efekt je prirodzený jav - bez neho by bola Zem o 33°C chladnejšia. Problém vzniká, keď ľudská činnosť zosilňuje tento efekt pridávaním skleníkových plynov do atmosféry.
            </p>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3" />
                <span>CO₂ z fosílnych palív sa hromadí v atmosfére</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3" />
                <span>Viac CO₂ = silnejší skleníkový efekt</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3" />
                <span>Zosilnený efekt vedie k otepľovaniu planéty</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Impacts Section */}
        <section id="dopady" className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Dopady a budúci vývoj</h2>
          <div className="bg-card rounded-lg border p-6 sm:p-8">
            <p className="text-lg text-muted-foreground mb-6">
              Dopady zmeny klímy na Slovensku zahŕňajú:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Extrémne horúčavy</div>
                  <div className="text-sm text-muted-foreground">
                    Častejšie a intenzívnejšie vlny horúčav
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Droplets className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Suchá</div>
                  <div className="text-sm text-muted-foreground">
                    Dlhšie obdobia bez zrážok
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Povodne</div>
                  <div className="text-sm text-muted-foreground">
                    Intenzívnejšie zrážky v krátkom čase
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                <div>
                  <div className="font-semibold mb-1">Topenie ľadovcov</div>
                  <div className="text-sm text-muted-foreground">
                    Zánik malých slovenských ľadovcov
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Extreme Events Section */}
        <section id="extremy" className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Extrémne javy</h2>
          <div className="bg-card rounded-lg border p-6 sm:p-8">
            <p className="text-lg text-muted-foreground">
              Zmena klímy zvyšuje pravdepodobnosť a intenzitu extrémnych poveternostných javov. Na Slovensku to znamená častejšie horúčavy, intenzívnejšie búrky a dlhšie suchá.
            </p>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center pt-8 border-t border-border">
          <a href="/" className="inline-flex items-center gap-2 text-primary hover:underline">
            ← Späť na hlavnú stránku
          </a>
        </div>
      </section>
    </div>;
}