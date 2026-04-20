import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Inbox, Download, Menu, X, ShieldCheck } from "lucide-react";

const navItem =
  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap";

export function AdminLayout() {
  const { signOut, reviewer } = useAdminAuth();
  const lock = () => void signOut();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <NavLink
        to="/admin"
        end
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${navItem} ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
        }
      >
        <Users className="w-4 h-4" /> Kandidáti
      </NavLink>
      <NavLink
        to="/admin/review"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${navItem} ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
        }
      >
        <Inbox className="w-4 h-4" /> Review
      </NavLink>
      <NavLink
        to="/admin/export"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${navItem} ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
        }
      >
        <Download className="w-4 h-4" /> Export
      </NavLink>
      <NavLink
        to="/admin/users"
        onClick={() => setOpen(false)}
        className={({ isActive }) =>
          `${navItem} ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
        }
      >
        <ShieldCheck className="w-4 h-4" /> Používatelia
      </NavLink>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-2">
          <Link
            to="/admin"
            className="font-semibold text-foreground truncate min-w-0"
            onClick={() => setOpen(false)}
          >
            Klima Kompas{" "}
            <span className="text-muted-foreground hidden sm:inline">/ admin</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links}
            {reviewer && (
              <span className="ml-2 text-xs text-muted-foreground hidden lg:inline truncate max-w-[140px]">
                {reviewer}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={lock} className="ml-2">
              <LogOut className="w-4 h-4 mr-1" /> Odhlásiť
            </Button>
          </nav>

          {/* Mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden shrink-0"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile drawer */}
        {open && (
          <nav className="md:hidden border-t bg-card px-3 py-2 flex flex-col gap-1">
            {links}
            {reviewer && (
              <div className="px-3 pt-2 pb-1 text-xs text-muted-foreground">
                Recenzent: <span className="text-foreground font-medium">{reviewer}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setOpen(false);
                lock();
              }}
              className="justify-start"
            >
              <LogOut className="w-4 h-4 mr-1" /> Odhlásiť
            </Button>
          </nav>
        )}
      </header>
      <main className="flex-1 container mx-auto px-4 py-6 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
