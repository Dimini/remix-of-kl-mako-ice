import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Why Bratislava data for temperature?",
    answer: "Temperature data from Bratislava serves as a reasonable proxy for Slovakia's national temperature trends. While city-level data may show urban heat island effects, the long-term trends generally align with national patterns. For rigorous analysis of national averages, consult national meteorological datasets from SHMÚ (Slovak Hydrometeorological Institute)."
  },
  {
    question: "Why per-capita CO₂ emissions?",
    answer: "Per-capita CO₂ emissions enable fair comparisons across countries of different sizes and over time periods with population changes. This metric reflects the average carbon footprint per person and is commonly used in climate policy discussions and international agreements."
  },
  {
    question: "Why focus on electricity mix?",
    answer: "The electricity generation mix is a key indicator of decarbonization progress and affects both industrial competitiveness and household energy bills. Slovakia's heavy reliance on nuclear power and growing renewable share influences energy security, carbon intensity, and the transition pathways for other sectors like transport and heating."
  }
];

export function FAQ() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        
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