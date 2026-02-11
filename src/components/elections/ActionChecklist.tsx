import { CheckCircle, MessageSquare, Share2 } from 'lucide-react';

export function ActionChecklist({ language }: { language: string }) {
  const sk = language === 'sk';

  const sections = [
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: sk ? 'Hlasujte za kandidátov so silnými klimatickými plánmi' : 'Vote for candidates with strong climate plans',
      items: sk
        ? [
            'Má kandidát konkrétny klimatický akčný plán?',
            'Podporuje rozvoj verejnej dopravy a cykloinfraštruktúry?',
            'Zaväzuje sa k znižovaniu emisií a zlepšeniu kvality ovzdušia?',
            'Plánuje rozšírenie zelených plôch a ochranu existujúcich?',
            'Podporuje energetickú efektívnosť a obnoviteľné zdroje?',
          ]
        : [
            'Does the candidate have a concrete climate action plan?',
            'Do they support public transport and cycling infrastructure?',
            'Are they committed to reducing emissions and improving air quality?',
            'Do they plan to expand and protect green spaces?',
            'Do they support energy efficiency and renewables?',
          ],
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: sk ? 'Pýtajte sa kandidátov' : 'Ask candidates questions',
      desc: sk
        ? 'Pri stretnutiach s kandidátmi sa opýtajte:'
        : 'When meeting candidates, ask them:',
      items: sk
        ? [
            '„Aký je váš plán na zlepšenie kvality ovzdušia v Košiciach?"',
            '„Ako plánujete znížiť závislosť mesta od fosílnych palív?"',
            '„Podporíte bezplatnú MHD pre študentov a seniorov?"',
            '„Aké zelené plochy plánujete vytvoriť v našej mestskej časti?"',
          ]
        : [
            '"What\'s your plan to improve air quality in Košice?"',
            '"How do you plan to reduce the city\'s dependence on fossil fuels?"',
            '"Will you support free public transport for students and seniors?"',
            '"What green spaces do you plan to create in our district?"',
          ],
    },
    {
      icon: <Share2 className="h-6 w-6" />,
      title: sk ? 'Šírte povedomie' : 'Spread the word',
      items: sk
        ? [
            'Zdieľajte túto stránku s rodinou a priateľmi',
            'Diskutujte o klimatických témach vo svojej komunite',
            'Sledujte miestne environmentálne organizácie',
          ]
        : [
            'Share this page with family and friends',
            'Discuss climate topics in your community',
            'Follow local environmental organizations',
          ],
    },
  ];

  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <div key={i} className="border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-full">{section.icon}</div>
            <h3 className="text-lg font-bold">{section.title}</h3>
          </div>
          {'desc' in section && section.desc && (
            <p className="text-sm text-muted-foreground mb-3">{section.desc}</p>
          )}
          <ul className="space-y-2">
            {section.items.map((item, j) => (
              <li key={j} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
