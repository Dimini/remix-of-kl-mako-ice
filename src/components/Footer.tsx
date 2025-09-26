import { ExternalLink } from "lucide-react";

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

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Zdroje údajov a API</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium mb-2">Živé údaje získané z:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• World Bank API (emisie CO₂ na obyvateľa)</li>
                  <li>• Our World in Data CSV (mix výroby elektriny)</li>
                  <li>• Open-Meteo ERA5 (archív mesačných teplôt)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Dozvedieť sa viac</h3>
            <div className="grid gap-3">
              {dataSources.map((source, index) => (
                <a
                  key={index}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 text-sm hover:text-primary transition-colors"
                >
                  <ExternalLink size={14} className="flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100" />
                  <div>
                    <span className="font-medium">{source.title}</span>
                    <p className="text-xs text-muted-foreground">{source.description}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t pt-8 mt-8 text-center text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Upozornenie k údajom:</strong> Informácie sú poskytované na vzdelávacie účely. 
            Zdroje údajov majú rôzne frekvencie aktualizácie a metodológie. 
            Pre politické alebo výskumné použitie konzultujte pôvodné zdroje priamo.
          </p>
          <p className="flex items-center justify-center gap-2">
            Vytvorené s 
            <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Lovable
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}