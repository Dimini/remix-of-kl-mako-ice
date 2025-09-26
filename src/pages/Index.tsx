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
          <h1 className="text-2xl font-bold mb-2">Unable to Load Data</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
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
              <h1 className="text-3xl font-bold text-foreground">Climate & Slovakia: Trends and Impacts</h1>
              <p className="text-muted-foreground">A simple data overview of climate trends and what they mean for people and industry in Slovakia.</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <button 
                onClick={scrollToSources}
                className="text-primary hover:underline"
              >
                Sources
              </button>
              <span className="text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* KPI Tiles */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>
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
                  title="CO₂ per Capita"
                  value={kpiMetrics.co2.value}
                  unit="tCO₂/person"
                  description={`Latest data from ${kpiMetrics.co2.year}`}
                  tooltip="Annual carbon dioxide emissions divided by population. Includes emissions from fossil fuel combustion and cement production."
                  color="co2"
                />
                <KPITile
                  title="Low-Carbon Electricity"
                  value={kpiMetrics.lowCarbon}
                  unit="%"
                  description="Nuclear + renewables combined"
                  tooltip="Percentage of electricity from sources with low CO₂ emissions: nuclear, hydro, wind, solar, and other renewables."
                  color="success"
                />
                <KPITile
                  title="Warming Since 1950"
                  value={kpiMetrics.warming}
                  unit="°C"
                  description="Average temperature change"
                  tooltip="Difference between recent 5-year average (2018-2022) and 1950s baseline (1950-1959) for Bratislava area."
                  color="warning"
                />
              </>
            )}
          </div>
        </section>

        {/* Charts */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Climate Trends</h2>
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
          <h2 className="text-2xl font-bold mb-6">What This Means for Slovakia</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InfoCard
              title="Industry & Energy"
              icon={<Factory size={20} />}
              content={[
                { text: "Slovakia's industrial sector faces exposure to volatile energy prices, particularly affecting steel and aluminum production." },
                { text: "High nuclear share (50%+) provides relatively stable electricity costs but requires long-term investment in fleet renewal." },
                { text: "Growing renewable capacity creates opportunities for green manufacturing and attracts clean energy investments." },
                { text: "EU decarbonization policies drive industrial transformation toward electrification and hydrogen applications.", 
                  link: { url: "https://www.eea.europa.eu/", text: "Learn more" } }
              ]}
            />
            
            <InfoCard
              title="People & Health"
              icon={<Users size={20} />}
              content={[
                { text: "Rising temperatures increase heat-related health risks, particularly in urban areas like Bratislava and Košice." },
                { text: "Air quality improvements from cleaner electricity and transport reduce respiratory disease burden." },
                { text: "Energy transition affects household bills: nuclear provides cost stability while renewables offer long-term price benefits." },
                { text: "Climate adaptation needs include cooling systems and urban green infrastructure.", 
                  link: { url: "https://www.shmu.sk/", text: "Learn more" } }
              ]}
            />
            
            <InfoCard
              title="Water & Agriculture"
              icon={<Droplets size={20} />}
              content={[
                { text: "Changing precipitation patterns affect Danube river levels, impacting hydroelectric generation and shipping." },
                { text: "Agricultural productivity faces pressure from more frequent droughts and extreme weather events." },
                { text: "Forest ecosystems experience stress from warming temperatures and pest outbreaks." },
                { text: "Water management requires investment in storage, efficiency, and flood protection systems.", 
                  link: { url: "https://www.eea.europa.eu/", text: "Learn more" } }
              ]}
            />
            
            <InfoCard
              title="Policy Context"
              icon={<FileText size={20} />}
              content={[
                { text: "EU Fit for 55 package requires 55% emission reduction by 2030, affecting all economic sectors." },
                { text: "Slovakia's National Energy and Climate Plan targets increased renewables and energy efficiency." },
                { text: "EU Emissions Trading System (ETS) puts carbon price on industrial emissions and electricity generation." },
                { text: "Recovery and Resilience Plan includes €2.2 billion for green transition projects.", 
                  link: { url: "https://www.eea.europa.eu/", text: "Learn more" } }
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
