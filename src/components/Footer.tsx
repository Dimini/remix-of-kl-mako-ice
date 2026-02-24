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
          <Link to="/klimaticka-zmena" className="hover:text-primary transition-colors font-medium">
            Klimatická zmena
          </Link>
          <Link to="/klimaticke-data" className="hover:text-primary transition-colors font-medium">
            Klimatické dáta
          </Link>
          <Link to="/metodologia" className="hover:text-primary transition-colors font-medium">
            Metodológia
          </Link>
        </div>
        
        <div className="text-center text-xs sm:text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            Vytvorené s 
            <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
              Lovable
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
