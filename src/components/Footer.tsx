import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t mt-8 sm:mt-12 md:mt-16">
      <div className="container mx-auto px-4 py-8 sm:py-10 md:py-12">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary transition-colors font-medium">
            Kandidáti
          </Link>
          <Link to="/preco-volit" className="hover:text-primary transition-colors font-medium">
            Prečo voliť?
          </Link>
          <Link to="/metodologia" className="hover:text-primary transition-colors font-medium">
            Metodológia
          </Link>
          <Link to="/klimaticka-zmena" className="hover:text-primary transition-colors font-medium">
            Klimatická zmena
          </Link>
          <a href="https://klimatapotrebuje.sk" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">
            O projekte
          </a>
          <a href="https://klimatapotrebuje.sk/kontakt" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors font-medium">
            Kontakt
          </a>
        </div>
        
        <div className="text-center text-xs sm:text-sm text-muted-foreground space-y-2">
          <p>
            <a href="https://klimatapotrebuje.sk" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Klíma ťa potrebuje
            </a>
            {' | '}
            <a href="https://klimatapotrebuje.sk" target="_blank" rel="noopener noreferrer" className="hover:underline">
              klimatapotrebuje.sk
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            © 2026 Klíma ťa potrebuje. Všetky hodnotenia sú nezávislé a nefinancované kandidátmi.
          </p>
        </div>
      </div>
    </footer>
  );
}
