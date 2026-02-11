import { useState } from 'react';
import { ArrowLeft, ArrowRight, Printer, Wind, Trees, Bus, Zap, Recycle, Heart, Wallet, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BrochurePreviewProps {
  language: string;
}

export const BrochurePreview = ({ language }: BrochurePreviewProps) => {
  const sk = language === 'sk';
  const [currentPage, setCurrentPage] = useState(0);

  // 6 panels for a tri-fold brochure (2 sides × 3 panels)
  const pages = [
    // SIDE A - Panel 1: Cover
    {
      id: 'cover',
      content: (
        <div className="h-full flex flex-col justify-between bg-primary text-white p-8">
          <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
            <div className="w-16 h-16 border-2 border-white/50 rounded-full flex items-center justify-center">
              <Trees className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-tight">
              {sk ? 'VOĽBY 2026' : 'ELECTIONS 2026'}
            </h2>
            <p className="text-base font-semibold opacity-90">
              {sk ? 'Košice & Košický kraj' : 'Košice & Košice Region'}
            </p>
            <div className="w-12 h-0.5 bg-white/40 my-2" />
            <p className="text-sm opacity-80 leading-relaxed max-w-[200px]">
              {sk
                ? 'Váš sprievodca klimatickými voľbami'
                : 'Your Climate Election Guide'}
            </p>
          </div>
          <p className="text-[10px] text-center opacity-50">klimatapotrebuje.sk</p>
        </div>
      ),
    },
    // SIDE A - Panel 2: Why It Matters
    {
      id: 'why',
      content: (
        <div className="h-full flex flex-col bg-white text-foreground p-6">
          <h3 className="text-lg font-bold mb-4 text-primary border-b border-primary/20 pb-2">
            {sk ? 'Prečo voliť?' : 'Why Vote?'}
          </h3>
          <div className="space-y-3 text-xs leading-relaxed flex-1">
            <p>
              {sk
                ? 'Miestni politici rozhodujú o veciach, ktoré priamo ovplyvňujú vaše zdravie, peňaženku a vzduch, ktorý dýchate.'
                : 'Local politicians decide on things that directly affect your health, wallet, and the air you breathe.'}
            </p>
            <div className="space-y-2">
              {[
                { icon: <Heart className="h-3.5 w-3.5" />, text: sk ? 'Kvalita ovzdušia → vaše zdravie' : 'Air quality → your health' },
                { icon: <Wallet className="h-3.5 w-3.5" />, text: sk ? 'Energetická efektívnosť → vaše účty' : 'Energy efficiency → your bills' },
                { icon: <Trees className="h-3.5 w-3.5" />, text: sk ? 'Zelené plochy → kvalita života' : 'Green spaces → quality of life' },
                { icon: <Bus className="h-3.5 w-3.5" />, text: sk ? 'Verejná doprava → mobilita' : 'Public transport → mobility' },
                { icon: <Recycle className="h-3.5 w-3.5" />, text: sk ? 'Odpadové hospodárstvo → čisté ulice' : 'Waste management → clean streets' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className="text-primary shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    // SIDE A - Panel 3: Who Decides What
    {
      id: 'who',
      content: (
        <div className="h-full flex flex-col bg-white text-foreground p-6">
          <h3 className="text-lg font-bold mb-4 text-primary border-b border-primary/20 pb-2">
            {sk ? 'Kto o čom rozhoduje?' : 'Who Decides What?'}
          </h3>
          <div className="space-y-4 text-xs flex-1">
            <div>
              <h4 className="font-bold text-sm mb-1">{sk ? '🏛️ Primátor / Mesto' : '🏛️ Mayor / City'}</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {sk ? 'Cyklotrasy a chodníky' : 'Bike lanes & sidewalks'}</li>
                <li>• {sk ? 'Mestská zeleň a parky' : 'Urban green & parks'}</li>
                <li>• {sk ? 'MHD a parkovanie' : 'Public transit & parking'}</li>
                <li>• {sk ? 'Komunálny odpad' : 'Municipal waste'}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-1">{sk ? '🏔️ Župan / Kraj' : '🏔️ Chairman / Region'}</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {sk ? 'Regionálne cesty' : 'Regional roads'}</li>
                <li>• {sk ? 'Kvalita ovzdušia' : 'Air quality regulation'}</li>
                <li>• {sk ? 'EU fondy na klímu' : 'EU climate funds'}</li>
                <li>• {sk ? 'Regionálna doprava' : 'Regional transport'}</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    // SIDE B - Panel 4: Candidate Scorecard
    {
      id: 'scorecard',
      content: (
        <div className="h-full flex flex-col bg-white text-foreground p-6">
          <h3 className="text-lg font-bold mb-3 text-primary border-b border-primary/20 pb-2">
            {sk ? 'Hodnotenie kandidátov' : 'Candidate Scorecard'}
          </h3>
          <div className="text-[10px] text-muted-foreground mb-2">
            {sk ? '★ = slabý | ★★★ = výborný' : '★ = weak | ★★★ = excellent'}
          </div>
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1 font-bold">{sk ? 'Kandidát' : 'Candidate'}</th>
                  <th className="text-center py-1">🌬️</th>
                  <th className="text-center py-1">🌳</th>
                  <th className="text-center py-1">🚌</th>
                  <th className="text-center py-1">⚡</th>
                  <th className="text-center py-1">♻️</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {[
                  { name: sk ? 'Kandidát A' : 'Candidate A', scores: ['★★★', '★★', '★★★', '★★', '★★'] },
                  { name: sk ? 'Kandidát B' : 'Candidate B', scores: ['★★', '★★★', '★★', '★★★', '★★★'] },
                  { name: sk ? 'Kandidát C' : 'Candidate C', scores: ['★', '★★', '★', '★★', '★'] },
                  { name: sk ? 'Kandidát D' : 'Candidate D', scores: ['★★★', '★★★', '★★', '★', '★★'] },
                  { name: sk ? 'Kandidát E' : 'Candidate E', scores: ['★★', '★', '★★★', '★★★', '★★'] },
                ].map((c, i) => (
                  <tr key={i} className="border-b border-dashed">
                    <td className="py-1.5 font-medium">{c.name}</td>
                    {c.scores.map((s, j) => (
                      <td key={j} className="text-center py-1.5">{s}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-[9px] text-muted-foreground">
              <span className="font-bold">{sk ? 'Legenda:' : 'Legend:'}</span>{' '}
              🌬️ {sk ? 'Ovzdušie' : 'Air'} | 🌳 {sk ? 'Zeleň' : 'Green'} | 🚌 {sk ? 'Doprava' : 'Transit'} | ⚡ {sk ? 'Energia' : 'Energy'} | ♻️ {sk ? 'Odpad' : 'Waste'}
            </div>
          </div>
        </div>
      ),
    },
    // SIDE B - Panel 5: Your Checklist
    {
      id: 'checklist',
      content: (
        <div className="h-full flex flex-col bg-white text-foreground p-6">
          <h3 className="text-lg font-bold mb-4 text-primary border-b border-primary/20 pb-2">
            {sk ? 'Váš checklist' : 'Your Checklist'}
          </h3>
          <div className="space-y-2 text-xs flex-1">
            {[
              sk ? 'Zistite, kto kandiduje vo vašom obvode' : 'Find out who is running in your district',
              sk ? 'Prečítajte si ich klimatický program' : 'Read their climate programme',
              sk ? 'Opýtajte sa ich na konkrétne plány' : 'Ask them about specific plans',
              sk ? 'Porovnajte ich hodnotenie v tabuľke' : 'Compare their scorecard ratings',
              sk ? 'Choďte voliť – každý hlas sa počíta!' : 'Go vote – every vote counts!',
              sk ? 'Zdieľajte túto brožúru s priateľmi' : 'Share this brochure with friends',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-0.5 w-3.5 h-3.5 border border-muted-foreground/40 rounded-sm shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-primary/5 border border-primary/20 text-[10px]">
            <p className="font-bold text-primary mb-1">
              {sk ? 'Otázky pre kandidátov:' : 'Questions for candidates:'}
            </p>
            <ul className="space-y-1 text-muted-foreground">
              <li>→ {sk ? 'Aký je váš plán pre kvalitu ovzdušia?' : 'What is your plan for air quality?'}</li>
              <li>→ {sk ? 'Koľko investujete do zelených plôch?' : 'How much will you invest in green spaces?'}</li>
            </ul>
          </div>
        </div>
      ),
    },
    // SIDE B - Panel 6: Back Cover / CTA
    {
      id: 'back',
      content: (
        <div className="h-full flex flex-col justify-between bg-primary text-white p-8">
          <div className="flex-1 flex flex-col justify-center items-center text-center gap-4">
            <h3 className="text-xl font-bold">
              {sk ? 'Váš hlas má silu.' : 'Your vote has power.'}
            </h3>
            <p className="text-sm opacity-80 leading-relaxed max-w-[220px]">
              {sk
                ? 'Rozhodnite sa informovane. Volte za lepšie Košice.'
                : 'Make an informed decision. Vote for a better Košice.'}
            </p>
            <div className="w-12 h-0.5 bg-white/40 my-1" />
            <div className="text-xs opacity-70 space-y-1">
              <p>klimatapotrebuje.sk</p>
              <p>{sk ? 'Voľby 2026 – Košice' : 'Elections 2026 – Košice'}</p>
            </div>
          </div>
          <p className="text-[9px] text-center opacity-40">
            {sk ? 'Vytlačte, preložte na tretiny a rozdajte.' : 'Print, tri-fold, and hand out.'}
          </p>
        </div>
      ),
    },
  ];

  const totalPages = pages.length;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const sideA = [0, 1, 2]; // cover, why, who
    const sideB = [5, 4, 3]; // back, checklist, scorecard (reversed for tri-fold)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${sk ? 'Volebná brožúra 2026' : 'Election Brochure 2026'}</title>
        <style>
          @page { size: A4 landscape; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; }
          .page { width: 297mm; height: 210mm; display: flex; page-break-after: always; }
          .page:last-child { page-break-after: avoid; }
          .panel { width: 99mm; height: 210mm; overflow: hidden; }
          .label { position: absolute; top: 2mm; left: 50%; transform: translateX(-50%); font-size: 7pt; color: #999; }
        </style>
      </head>
      <body>
        <div class="page" id="sideA"></div>
        <div class="page" id="sideB"></div>
      </body>
      </html>
    `);
    printWindow.document.close();

    // Render panels into the print window
    const renderPanel = (container: HTMLElement, panelIdx: number) => {
      const panel = printWindow!.document.createElement('div');
      panel.className = 'panel';
      panel.style.cssText = 'width: 99mm; height: 210mm; overflow: hidden;';
      // We'll use an iframe-like approach — just clone from DOM
      container.appendChild(panel);
    };

    // For simplicity, trigger print after a short delay
    setTimeout(() => {
      printWindow!.print();
    }, 500);
  };

  return (
    <div>
      <div className="flex flex-col items-center">
        {/* Preview container */}
        <div className="w-full max-w-sm mx-auto">
          {/* Page indicator */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {sk ? `Strana ${currentPage + 1} / ${totalPages}` : `Page ${currentPage + 1} / ${totalPages}`}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              {currentPage < 3
                ? (sk ? 'Strana A (vonkajšia)' : 'Side A (outside)')
                : (sk ? 'Strana B (vnútorná)' : 'Side B (inside)')}
            </span>
          </div>

          {/* Brochure panel preview */}
          <div className="relative border-2 border-border bg-white shadow-xl aspect-[2/3] overflow-hidden">
            {pages[currentPage].content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              {sk ? 'Späť' : 'Prev'}
            </Button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentPage ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              {sk ? 'Ďalej' : 'Next'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>

        {/* Print button */}
        <Button
          onClick={() => window.print()}
          className="mt-8 gap-2"
          size="lg"
        >
          <Printer className="h-5 w-5" />
          {sk ? 'Vytlačiť brožúru' : 'Print Brochure'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center max-w-xs">
          {sk
            ? 'Vytlačte na A4 na šírku, obojstranne, a preložte na tretiny.'
            : 'Print on A4 landscape, double-sided, and tri-fold.'}
        </p>
      </div>

      {/* Hidden print layout */}
      <div className="hidden print:block">
        <style>{`
          @media print {
            body * { visibility: hidden; }
            .print-brochure, .print-brochure * { visibility: visible; }
            .print-brochure {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
            @page { size: A4 landscape; margin: 0; }
          }
        `}</style>
        <div className="print-brochure">
          {/* Side A */}
          <div className="flex w-full h-screen" style={{ pageBreakAfter: 'always' }}>
            {[0, 1, 2].map(i => (
              <div key={i} className="flex-1 h-full overflow-hidden border-r last:border-r-0 border-dashed border-gray-300">
                {pages[i].content}
              </div>
            ))}
          </div>
          {/* Side B (reversed order for tri-fold) */}
          <div className="flex w-full h-screen">
            {[5, 4, 3].map(i => (
              <div key={i} className="flex-1 h-full overflow-hidden border-r last:border-r-0 border-dashed border-gray-300">
                {pages[i].content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
