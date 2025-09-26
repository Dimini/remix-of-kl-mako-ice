import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { KPITile } from '@/components/KPITile';
import { InfoCard } from '@/components/InfoCard';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';
import { CO2Chart } from '@/components/charts/CO2Chart';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { ElectricityMixChart } from '@/components/charts/ElectricityMixChart';
import { LoadingSkeleton, KPITileSkeleton, ChartSkeleton } from '@/components/LoadingSkeleton';
import { 
  fetchCO2Data, 
  fetchElectricityData, 
  fetchTemperatureData,
  calculateWarmingSince1950,
  CO2Data,
  ElectricityData,
  TemperatureData 
} from '@/services/api';
import { Factory, Users, Droplets, FileText, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [co2Data, setCO2Data] = useState<CO2Data | null>(null);
  const [electricityData, setElectricityData] = useState<ElectricityData | null>(null);
  const [temperatureData, setTemperatureData] = useState<TemperatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [co2, electricity, temperature] = await Promise.all([
          fetchCO2Data(),
          fetchElectricityData(),
          fetchTemperatureData()
        ]);
        
        setCO2Data(co2);
        setElectricityData(electricity);
        setTemperatureData(temperature);
        
        if (!co2 || !electricity || !temperature) {
          toast({
            title: "Data Loading Issue",
            description: "Some data could not be loaded. Showing available information.",
            variant: "destructive",
          });
        }
      } catch (err) {
        setError('Failed to load climate data');
        toast({
          title: "Error",
          description: "Failed to load climate data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const kpiMetrics = useMemo(() => {
    if (!co2Data || !electricityData || !temperatureData) return null;

    const lowCarbonShare = 
      electricityData.electricityMix.nuclear + 
      electricityData.electricityMix.hydro + 
      electricityData.electricityMix.wind + 
      electricityData.electricityMix.solar + 
      electricityData.electricityMix.other_renewables;

    const warming = calculateWarmingSince1950(temperatureData.timeSeries);

    return {
      co2: {
        value: co2Data.latest.value.toFixed(1),
        year: co2Data.latest.year
      },
      lowCarbon: lowCarbonShare.toFixed(1),
      warming: warming ? `+${warming}` : 'N/A'
    };
  }, [co2Data, electricityData, temperatureData]);

  const scrollToSources = () => {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Nie je možné načítať údaje</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Skúsiť znovu
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Klíma a Slovensko: Trendy a dopady</h1>
              <p className="text-muted-foreground">Jednoduchý prehľad klimatických trendov a ich význam pre ľudí a priemysel na Slovensku.</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <button 
                onClick={scrollToSources}
                className="text-primary hover:underline"
              >
                Zdroje
              </button>
              <span className="text-muted-foreground">
                Posledná aktualizácia: {new Date().toLocaleDateString('sk-SK')}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* KPI Tiles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Kľúčové ukazovatele</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {loading || !kpiMetrics ? (
              <>
                <KPITileSkeleton />
                <KPITileSkeleton />
                <KPITileSkeleton />
              </>
            ) : (
              <>
                <KPITile
                  title="CO₂ na obyvateľa"
                  value={kpiMetrics.co2.value}
                  unit="tCO₂/osoba"
                  description={`Najnovšie údaje z roku ${kpiMetrics.co2.year}`}
                  tooltip="Ročné emisie oxidu uhličitého delené počtom obyvateľov. Zahŕňa emisie zo spaľovania fosílnych palív a výroby cementu."
                  color="co2"
                />
                <KPITile
                  title="Nízkouhlíková elektrina"
                  value={kpiMetrics.lowCarbon}
                  unit="%"
                  description="Jadrová energia + obnoviteľné zdroje"
                  tooltip="Percentuálny podiel elektrickej energie zo zdrojov s nízkymi emisiami CO₂: jadrová, vodná, veterná, solárna a ostatné obnoviteľné zdroje."
                  color="success"
                />
                <KPITile
                  title="Otepľovanie od roku 1950"
                  value={kpiMetrics.warming}
                  unit="°C"
                  description="Priemerná zmena teploty"
                  tooltip="Rozdiel medzi nedávnym 5-ročným priemerom (2018-2022) a referenčnou hodnotou z 50. rokov (1950-1959) pre oblasť Bratislavy."
                  color="warning"
                />
              </>
            )}
          </div>
        </section>

        {/* Charts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Klimatické trendy</h2>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {loading || !co2Data ? (
              <ChartSkeleton />
            ) : (
              <CO2Chart data={co2Data} />
            )}
            
            {loading || !temperatureData ? (
              <ChartSkeleton />
            ) : (
              <TemperatureChart data={temperatureData} />
            )}
            
            <div className="xl:col-span-2">
              {loading || !electricityData ? (
                <ChartSkeleton />
              ) : (
                <ElectricityMixChart data={electricityData} />
              )}
            </div>
          </div>
        </section>

        {/* Impact Cards */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Čo to znamená pre Slovensko</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoCard
              title="Priemysel a energetika"
              icon={<Factory size={20} />}
              content={[
                { text: "Slovenský priemyselný sektor je vystavený volatilným cenám energie, čo ovplyvňuje najmä výrobu ocele a hliníka." },
                { text: "Vysoký podiel jadrovej energie (50%+) poskytuje relatívne stabilné náklady na elektrinu, ale vyžaduje si dlhodobé investície do obnovy parku." },
                { text: "Rastúca kapacita obnoviteľných zdrojov vytvára príležitosti pre zelenú výrobu a priťahuje investície do čistej energie." },
                { text: "Dekarbonizačné politiky EÚ poháňajú priemyselnú transformáciu smerom k elektrifikácii a aplikáciám vodíka.", 
                  link: { url: "https://www.eea.europa.eu/", text: "Viac informácií" } }
              ]}
            />
            
            <InfoCard
              title="Ľudia a zdravie"
              icon={<Users size={20} />}
              content={[
                { text: "Rastúce teploty zvyšujú zdravotné riziká súvisiace s horúčavami, najmä v mestských oblastiach ako Bratislava a Košice." },
                { text: "Zlepšenie kvality ovzdušia z čistejšej elektriny a dopravy znižuje zaťaženie respiračnými chorobami." },
                { text: "Energetická transformácia ovplyvňuje účty domácností: jadrová energia poskytuje cenovú stabilitu, zatiaľ čo obnoviteľné zdroje ponúkajú dlhodobé cenové výhody." },
                { text: "Potreby klimatickej adaptácie zahŕňajú chladiace systémy a mestskú zelenú infraštruktúru.", 
                  link: { url: "https://www.shmu.sk/", text: "Viac informácií" } }
              ]}
            />
            
            <InfoCard
              title="Voda a poľnohospodárstvo"
              icon={<Droplets size={20} />}
              content={[
                { text: "Meniace sa vzorce zrážok ovplyvňujú hladiny Dunaja, čo má dopad na výrobu vodnej energie a lodná preprava." },
                { text: "Poľnohospodárska produktivita čelí tlaku z častejších sucha a extrémnych poveternostných udalostí." },
                { text: "Lesné ekosystémy zažívajú stres z otepľovania a prepuknutia škodcov." },
                { text: "Vodohospodárstvo si vyžaduje investície do skladovania, efektívnosti a systémov protipovodňovej ochrany.", 
                  link: { url: "https://www.eea.europa.eu/", text: "Viac informácií" } }
              ]}
            />
            
            <InfoCard
              title="Politický kontext"
              icon={<FileText size={20} />}
              content={[
                { text: "Balík EÚ Fit for 55 vyžaduje 55% zníženie emisií do roku 2030, čo ovplyvňuje všetky ekonomické sektory." },
                { text: "Národný energetický a klimatický plán Slovenska cieli na zvýšenie obnoviteľných zdrojov a energetickej efektívnosti." },
                { text: "Systém obchodovania s emisiami EÚ (ETS) stanovuje uhlíkovú cenu na priemyselné emisie a výrobu elektriny." },
                { text: "Plán obnovy a odolnosti zahŕňa 2,2 miliardy eur na projekty zelenej transformácie.", 
                  link: { url: "https://www.eea.europa.eu/", text: "Viac informácií" } }
              ]}
            />
          </div>
        </section>

        {/* FAQ */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
