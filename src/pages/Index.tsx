import { useEffect, useState } from 'react';
import { CO2Chart } from '@/components/charts/CO2Chart';
import { ElectricityMixChart } from '@/components/charts/ElectricityMixChart';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { PrecipitationChart } from '@/components/charts/PrecipitationChart';
import { KPITile } from '@/components/KPITile';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';
import { CO2Data, ElectricityData, TemperatureData, PrecipitationData, fetchCO2Data, fetchElectricityData, fetchTemperatureData, fetchPrecipitationData, calculateWarmingSince1950 } from '@/services/api';
import { TrendingUp, TrendingDown, Activity, Zap, Thermometer, Leaf } from 'lucide-react';
const Index = () => {
  const [co2Data, setCo2Data] = useState<CO2Data | null>(null);
  const [electricityData, setElectricityData] = useState<ElectricityData | null>(null);
  const [temperatureData, setTemperatureData] = useState<TemperatureData | null>(null);
  const [precipitationData, setPrecipitationData] = useState<PrecipitationData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [co2, electricity, temperature, precipitation] = await Promise.all([
          fetchCO2Data(), 
          fetchElectricityData(), 
          fetchTemperatureData(),
          fetchPrecipitationData()
        ]);
        setCo2Data(co2);
        setElectricityData(electricity);
        setTemperatureData(temperature);
        setPrecipitationData(precipitation);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  if (loading) {
    return <LoadingSkeleton />;
  }
  const lowCarbonShare = electricityData ? electricityData.electricityMix.nuclear + electricityData.electricityMix.hydro + electricityData.electricityMix.wind + electricityData.electricityMix.solar + electricityData.electricityMix.other_renewables : 0;
  const warmingSince1950 = temperatureData ? calculateWarmingSince1950(temperatureData.timeSeries) : null;
  return <div className="min-h-screen bg-white">
      {/* Hero Section - Klimatapotrebuje.sk inspired */}
      <section className="relative min-h-[70vh] sm:min-h-screen flex flex-col justify-center items-center text-center px-4 py-12 sm:py-20">
        <div className="absolute inset-0 bg-mosaic opacity-5"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 sm:mb-8 text-balance">#klímaSlovenska</h1>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto text-muted-foreground px-2">
            Klimatická kríza je definitívne tu. Sledujte kľúčové údaje o klíme Slovenska 
            a pozrite si, ako sa mení naša krajina v reálnom čase.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <button className="bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-primary/90 w-full sm:w-auto">
              Pozrite si údaje
            </button>
            <button className="border-2 border-primary text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-primary hover:text-primary-foreground w-full sm:w-auto">
              Zistite viac
            </button>
          </div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-8 sm:mb-12 md:mb-16">
            Kľúčové klimatické ukazovatele
          </h2>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-8 sm:mb-12 md:mb-16">
            {co2Data && <KPITile title="CO₂ emisie" value={co2Data.latest.value.toFixed(1)} unit="t/osoba" description={`Emisie CO₂ na obyvateľa v roku ${co2Data.latest.year}`} tooltip="CO₂ emisie z fosílnych palív na obyvateľa - kľúčový ukazovateľ uhlíkovej stopy krajiny" trend={co2Data.timeSeries.length > 1 && co2Data.latest.value < co2Data.timeSeries[co2Data.timeSeries.length - 2].value ? 'down' : 'up'} color="co2" />}

            {electricityData && <KPITile title="Čistá elektrina" value={lowCarbonShare.toFixed(0)} unit="%" description="Podiel nízkouhlíkovej elektriny" tooltip="Percentuálny podiel elektriny z jadrových a obnoviteľných zdrojov" trend={lowCarbonShare > 80 ? 'up' : 'down'} color="success" />}

            {warmingSince1950 !== null && <KPITile title="Otepľovanie" value={warmingSince1950 > 0 ? `+${warmingSince1950}` : warmingSince1950.toString()} unit="°C" description="Zmena teploty od roku 1950" tooltip="Priemerná zmena teploty za posledných 5 rokov oproti 50. rokom" trend={warmingSince1950 > 0 ? 'up' : 'down'} color="warning" />}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-8 sm:mb-12 md:mb-16">
            Analýza klimatických trendov
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            {co2Data && <div className="chart-container">
                <CO2Chart data={co2Data} />
              </div>}
            
            {electricityData && <div className="chart-container">
                <ElectricityMixChart data={electricityData} />
              </div>}
          </div>
          
          {temperatureData && <div className="chart-container">
              <TemperatureChart data={temperatureData} />
            </div>}
          
          {precipitationData && <div className="chart-container mt-4 sm:mt-6 md:mt-8">
              <PrecipitationChart data={precipitationData} />
            </div>}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8">
            Kríza je tu, aký je váš plán?
          </h2>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-12 opacity-90 px-2">
            Klimatická kríza ohrozuje naše mestá, domovy, pracovné miesta a zdravie. 
            Ak ju chceme zastaviť, musíme konať. Teraz.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <button className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none hover:bg-gray-100 transition-colors w-full sm:w-auto">
              Zapojte sa do akcie
            </button>
            <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none hover:bg-white hover:text-primary transition-colors w-full sm:w-auto">
              Zdieľajte údaje
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-8 sm:mb-12 md:mb-16">
            Často kladené otázky
          </h2>
          <FAQ />
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;