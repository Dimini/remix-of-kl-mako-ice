import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Prečo údaje z Bratislavy pre teplotu?",
    answer: "Teplotné údaje z Bratislavy slúžia ako rozumný zástupca národných teplotných trendov Slovenska. Hoci údaje na úrovni mesta môžu vykazovať efekty mestského tepelného ostrova, dlhodobé trendy sa všeobecne zhodujú s národnými vzorcami. Pre dôkladnú analýzu národných priemerov konzultujte národné meteorologické súbory údajov od SHMÚ (Slovenský hydrometeorologický ústav)."
  },
  {
    question: "Prečo emisie CO₂ na obyvateľa?",
    answer: "Emisie CO₂ na obyvateľa umožňujú spravodlivé porovnania medzi krajinami rôznych veľkostí a v časových obdobiach so zmenami populácie. Táto metrika odráža priemernú uhlíkovú stopu na osobu a bežne sa používa v diskusiách o klimatických politikách a medzinárodných dohodách."
  },
  {
    question: "Prečo sa zamerať na elektrický mix?",
    answer: "Mix výroby elektriny je kľúčovým ukazovateľom pokroku v dekarbonizácii a ovplyvňuje konkurencieschopnosť priemyslu aj účty domácností za energiu. Silná závislosť Slovenska od jadrovej energie a rastúci podiel obnoviteľných zdrojov ovplyvňuje energetickú bezpečnosť, uhlíkovú náročnosť a transformačné cesty pre iné sektory ako doprava a vykurovanie."
  }
];

export function FAQ() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Často kladené otázky</h2>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-lg px-6">
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}