import { useEffect, useState } from 'react';
import { CO2Chart } from '@/components/charts/CO2Chart';
import { ElectricityMixChart } from '@/components/charts/ElectricityMixChart';
import { TemperatureChart } from '@/components/charts/TemperatureChart';
import { PrecipitationChart } from '@/components/charts/PrecipitationChart';
import { KPITile } from '@/components/KPITile';
import { KPITileSkeleton, ChartSkeleton } from '@/components/LoadingSkeleton';
import { FAQ } from '@/components/FAQ';
import { Footer } from '@/components/Footer';
import { CO2Data, ElectricityData, TemperatureData, PrecipitationData, fetchCO2Data, fetchElectricityData, fetchTemperatureData, fetchPrecipitationData, calculateWarmingSince1950 } from '@/services/api';
import { TrendingUp, TrendingDown, Activity, Zap, Thermometer, Leaf, Menu, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { t, language, setLanguage } = useLanguage();
  const [co2Data, setCo2Data] = useState<CO2Data | null>(null);
  const [electricityData, setElectricityData] = useState<ElectricityData | null>(null);
  const [temperatureData, setTemperatureData] = useState<TemperatureData | null>(null);
  const [precipitationData, setPrecipitationData] = useState<PrecipitationData | null>(null);

  useEffect(() => {
    // Fetch data independently for progressive loading
    fetchCO2Data()
      .then(setCo2Data)
      .catch(error => console.error('Error fetching CO2 data:', error));
    
    fetchElectricityData()
      .then(setElectricityData)
      .catch(error => console.error('Error fetching electricity data:', error));
    
    fetchTemperatureData()
      .then(setTemperatureData)
      .catch(error => console.error('Error fetching temperature data:', error));
    
    fetchPrecipitationData()
      .then(setPrecipitationData)
      .catch(error => console.error('Error fetching precipitation data:', error));
  }, []);
  const lowCarbonShare = electricityData ? electricityData.electricityMix.nuclear + electricityData.electricityMix.hydro + electricityData.electricityMix.wind + electricityData.electricityMix.solar + electricityData.electricityMix.other_renewables : 0;
  const warmingSince1950 = temperatureData ? calculateWarmingSince1950(temperatureData.timeSeries) : null;
  return <div className="min-h-screen bg-white">
      {/* Hero Section - Klimatapotrebuje.sk inspired */}
      <section className="relative min-h-[70vh] sm:min-h-screen flex flex-col justify-center items-center text-center px-4 py-12 sm:py-20">
        <div className="absolute inset-0 bg-mosaic opacity-5"></div>
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 sm:mb-8 text-balance">{t('heroTitle')}</h1>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto text-muted-foreground px-2">
            {t('heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <button 
              onClick={() => document.getElementById('metrics')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-primary text-primary-foreground px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-primary/90 w-full sm:w-auto"
            >
              {t('viewData')}
            </button>
            <button 
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-2 border-primary text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none transition-all duration-200 hover:bg-primary hover:text-primary-foreground w-full sm:w-auto"
            >
              {t('learnMore')}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-12 w-12 sm:h-14 sm:w-14 rounded-none border-2 border-muted hover:border-primary transition-all"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-card border shadow-lg z-50"
              >
                <DropdownMenuItem asChild>
                  <a 
                    href="/klimaticka-zmena"
                    className="cursor-pointer font-medium"
                  >
                    {t('climateChange')}
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <a 
                    href="https://klimatapotrebuje.sk/pridaj-sa-k-nam/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    {t('joinAction')}
                  </a>
                </DropdownMenuItem>
                
                <DropdownMenuItem asChild>
                  <a 
                    href="https://klimatapotrebuje.darujme.sk/podpor-nase-aktivity-klimatapotrebuje/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cursor-pointer"
                  >
                    {t('supportProject')}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section id="metrics" className="py-12 sm:py-16 md:py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-8 sm:mb-12 md:mb-16">
            {t('keyIndicators')}
          </h2>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-8 sm:mb-12 md:mb-16">
            {co2Data ? (
              <KPITile 
                title={t('co2Emissions')} 
                value={co2Data.latest.value.toFixed(1)} 
                unit={t('co2Unit')} 
                description={`${t('co2Description')} ${co2Data.latest.year}`} 
                tooltip={t('co2Tooltip')} 
                trend={co2Data.timeSeries.length > 1 && co2Data.latest.value < co2Data.timeSeries[co2Data.timeSeries.length - 2].value ? 'down' : 'up'} 
                color="co2" 
              />
            ) : (
              <KPITileSkeleton />
            )}

            {electricityData ? (
              <KPITile 
                title={t('cleanElectricity')} 
                value={lowCarbonShare.toFixed(0)} 
                unit="%" 
                description={t('cleanElectricityDescription')} 
                tooltip={t('cleanElectricityTooltip')} 
                trend={lowCarbonShare > 80 ? 'up' : 'down'} 
                color="success" 
              />
            ) : (
              <KPITileSkeleton />
            )}

            {warmingSince1950 !== null ? (
              <KPITile 
                title={t('warming')} 
                value={warmingSince1950 > 0 ? `+${warmingSince1950}` : warmingSince1950.toString()} 
                unit="°C" 
                description={t('warmingDescription')} 
                tooltip={t('warmingTooltip')} 
                trend={warmingSince1950 > 0 ? 'up' : 'down'} 
                color="warning" 
              />
            ) : (
              <KPITileSkeleton />
            )}
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-8 sm:mb-12 md:mb-16">
            {t('trendsTitle')}
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <div className="chart-container">
              {co2Data ? <CO2Chart data={co2Data} /> : <ChartSkeleton />}
            </div>
            
            <div className="chart-container">
              {electricityData ? <ElectricityMixChart data={electricityData} /> : <ChartSkeleton />}
            </div>
          </div>
          
          <div className="chart-container">
            {temperatureData ? <TemperatureChart data={temperatureData} /> : <ChartSkeleton />}
          </div>
          
          <div className="chart-container mt-4 sm:mt-6 md:mt-8">
            {precipitationData ? <PrecipitationChart data={precipitationData} /> : <ChartSkeleton />}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="cta" className="py-12 sm:py-16 md:py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6 sm:mb-8">
            {t('ctaTitle')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl leading-relaxed mb-8 sm:mb-12 opacity-90 px-2">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <a 
              href="https://klimatapotrebuje.sk/pridaj-sa-k-nam/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none hover:bg-gray-100 transition-colors w-full sm:w-auto text-center"
            >
              {t('joinAction')}
            </a>
            <a 
              href="https://klimatapotrebuje.darujme.sk/podpor-nase-aktivity-klimatapotrebuje/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-none hover:bg-white hover:text-primary transition-colors w-full sm:w-auto text-center"
            >
              {t('supportProject')}
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-center mb-8 sm:mb-12 md:mb-16">
            {t('faqTitle')}
          </h2>
          <FAQ />
        </div>
      </section>

      {/* Language Switcher */}
      <section className="py-8 px-4 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="gap-2"
              >
                <Languages className="h-4 w-4" />
                {t('language')}: {language === 'sk' ? 'Slovenčina' : 'English'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem 
                onClick={() => setLanguage('sk')}
                className={language === 'sk' ? 'bg-accent' : ''}
              >
                🇸🇰 Slovenčina
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-accent' : ''}
              >
                🇬🇧 English
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;