import { Building2, MapPin } from 'lucide-react';

export function ResponsibilitiesSection({ language }: { language: string }) {
  const sk = language === 'sk';

  const city = {
    title: sk ? 'Mestské voľby (Mesto Košice)' : 'City Elections (City of Košice)',
    icon: <Building2 className="h-6 w-6" />,
    items: sk
      ? [
          'Riadi lokálnu infraštruktúru – cyklotrasy, parky, verejná doprava',
          'Spravuje mestský rozpočet pre zelené projekty',
          'Reguluje výstavbu a ochranu zelených plôch',
          'Rozhoduje o mestskej energetike a verejnom osvetlení',
          'Stanovuje pravidlá pre odpadové hospodárstvo',
        ]
      : [
          'Controls local infrastructure – bike lanes, parks, public transport',
          'Manages municipal budgets for green projects',
          'Regulates construction and protection of green areas',
          'Decides on municipal energy and public lighting',
          'Sets rules for waste management',
        ],
  };

  const region = {
    title: sk ? 'Regionálne voľby (Košický samosprávny kraj)' : 'Regional Elections (Košice Self-Governing Region)',
    icon: <MapPin className="h-6 w-6" />,
    items: sk
      ? [
          'Dozerá na väčšie environmentálne politiky a normy kvality ovzdušia',
          'Riadi regionálne dopravné siete a prímestskú dopravu',
          'Rozdeľuje fondy EÚ a štátne dotácie na klimatické projekty',
          'Spravuje stredné školy – vzdelávanie o klíme',
          'Koordinuje protipovodňové opatrenia v regióne',
        ]
      : [
          'Oversees larger environmental policies and air quality regulations',
          'Manages regional transport networks and suburban transit',
          'Distributes EU and state funds for climate projects',
          'Manages secondary schools – climate education',
          'Coordinates flood prevention measures in the region',
        ],
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[city, region].map((block, i) => (
        <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            {block.icon}
            <h3 className="text-lg sm:text-xl font-bold">{block.title}</h3>
          </div>
          <ul className="space-y-3">
            {block.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm opacity-90">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/70 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
