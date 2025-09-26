import { ExternalLink } from "lucide-react";

const dataSources = [
  {
    title: "World Bank Data (Slovakia CO₂)",
    url: "https://data.worldbank.org/indicator/EN.ATM.CO2E.PC?locations=SK",
    description: "Official CO₂ emissions per capita statistics"
  },
  {
    title: "Our World in Data – Energy",
    url: "https://ourworldindata.org/energy",
    description: "Comprehensive global energy statistics and analysis"
  },
  {
    title: "Open-Meteo ERA5 Documentation",
    url: "https://open-meteo.com/en/docs/era5",
    description: "Historical weather data API documentation"
  },
  {
    title: "European Environment Agency",
    url: "https://www.eea.europa.eu/",
    description: "EU environmental data and climate information"
  },
  {
    title: "Slovak Hydrometeorological Institute",
    url: "https://www.shmu.sk/",
    description: "Slovakia's official weather and climate agency"
  }
];

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Data Sources & APIs</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="font-medium mb-2">Live data fetched from:</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• World Bank API (CO₂ emissions per capita)</li>
                  <li>• Our World in Data CSV (electricity generation mix)</li>
                  <li>• Open-Meteo ERA5 (monthly temperature archive)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Learn More</h3>
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
            <strong>Data Disclaimer:</strong> Information is provided for educational purposes. 
            Data sources have different update frequencies and methodologies. 
            For policy or research use, consult original sources directly.
          </p>
          <p className="flex items-center justify-center gap-2">
            Built with 
            <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Lovable
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}