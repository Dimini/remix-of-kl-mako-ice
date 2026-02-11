import { Wind, Trees, Bus, Zap, Recycle } from 'lucide-react';

interface ImpactRow {
  icon: React.ReactNode;
  issue: { sk: string; en: string };
  influence: { sk: string; en: string };
  matters: { sk: string; en: string };
}

const rows: ImpactRow[] = [
  {
    icon: <Wind className="h-5 w-5" />,
    issue: { sk: 'Kvalita ovzdušia', en: 'Air Quality' },
    influence: {
      sk: 'Regulácia priemyselných emisií (U.S. Steel), podpora čistej dopravy, presadzovanie noriem EÚ pre ovzdušie',
      en: 'Regulate industrial emissions (U.S. Steel), promote clean transport, enforce EU air standards',
    },
    matters: {
      sk: 'Zlé ovzdušie = vyššie náklady na zdravotnú starostlivosť, respiračné ochorenia, nižšia dĺžka života',
      en: 'Poor air = higher healthcare costs, respiratory diseases, lower life expectancy',
    },
  },
  {
    icon: <Trees className="h-5 w-5" />,
    issue: { sk: 'Zelené plochy', en: 'Green Spaces' },
    influence: {
      sk: 'Financovanie parkov, mestských lesov, peších zón a komunitných záhrad',
      en: 'Fund parks, urban forests, pedestrian zones and community gardens',
    },
    matters: {
      sk: 'Viac zelene = lepšie duševné zdravie, chladnejšie letá, vyššia hodnota nehnuteľností',
      en: 'More green areas = better mental health, cooler summers, higher property values',
    },
  },
  {
    icon: <Bus className="h-5 w-5" />,
    issue: { sk: 'Verejná doprava', en: 'Public Transport' },
    influence: {
      sk: 'Investície do elektrických autobusov, cyklotrás, cenovo dostupného cestovného',
      en: 'Invest in electric buses, bike lanes, affordable fares',
    },
    matters: {
      sk: 'Lacnejšie a rýchlejšie dochádzanie, menej dopravných zápch, čistejší vzduch',
      en: 'Cheaper, faster commutes; less traffic; cleaner air',
    },
  },
  {
    icon: <Zap className="h-5 w-5" />,
    issue: { sk: 'Energetická efektívnosť', en: 'Energy Efficiency' },
    influence: {
      sk: 'Dotácie na zatepľovanie domov, solárne panely, LED verejné osvetlenie',
      en: 'Subsidize home insulation, solar panels, LED streetlights',
    },
    matters: {
      sk: 'Nižšie účty za energie, znížená závislosť od fosílnych palív',
      en: 'Lower energy bills, reduced dependence on fossil fuels',
    },
  },
  {
    icon: <Recycle className="h-5 w-5" />,
    issue: { sk: 'Odpadové hospodárstvo', en: 'Waste Management' },
    influence: {
      sk: 'Zavedenie recyklačných programov, zníženie skládkovania, podpora kompostovania',
      en: 'Implement recycling programs, reduce landfill use, promote composting',
    },
    matters: {
      sk: 'Menej znečistenia, čistejšie ulice, potenciál tvorby „zelených" pracovných miest',
      en: 'Less pollution, cleaner streets, potential job creation in green industries',
    },
  },
];

export function ImpactTable({ language }: { language: string }) {
  const sk = language === 'sk';

  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-primary">
              <th className="text-left p-3 font-bold">{sk ? 'Oblasť' : 'Issue'}</th>
              <th className="text-left p-3 font-bold">{sk ? 'Ako to ovplyvňujú politici' : 'How Politicians Influence It'}</th>
              <th className="text-left p-3 font-bold">{sk ? 'Prečo je to dôležité pre vás' : 'Why It Matters to You'}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                <td className="p-3 font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{row.icon}</span>
                    {sk ? row.issue.sk : row.issue.en}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{sk ? row.influence.sk : row.influence.en}</td>
                <td className="p-3 text-muted-foreground">{sk ? row.matters.sk : row.matters.en}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {rows.map((row, i) => (
          <div key={i} className="border bg-card p-4 space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <span className="text-primary">{row.icon}</span>
              {sk ? row.issue.sk : row.issue.en}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                {sk ? 'Vplyv politikov' : 'Political influence'}
              </p>
              <p className="text-sm">{sk ? row.influence.sk : row.influence.en}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                {sk ? 'Dopad na vás' : 'Impact on you'}
              </p>
              <p className="text-sm">{sk ? row.matters.sk : row.matters.en}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
