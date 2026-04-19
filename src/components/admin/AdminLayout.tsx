import { Link, NavLink, Outlet } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Inbox, Download } from "lucide-react";

const navItem =
  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors";

export function AdminLayout() {
  const { lock } = useAdminAuth();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/admin" className="font-semibold text-foreground">
            Klima Kompas <span className="text-muted-foreground">/ admin</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `${navItem} ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              <Users className="w-4 h-4" /> Kandidáti
            </NavLink>
            <NavLink
              to="/admin/review"
              className={({ isActive }) =>
                `${navItem} ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              <Inbox className="w-4 h-4" /> Review
            </NavLink>
            <NavLink
              to="/admin/export"
              className={({ isActive }) =>
                `${navItem} ${isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`
              }
            >
              <Download className="w-4 h-4" /> Export
            </NavLink>
            <Button variant="ghost" size="sm" onClick={lock} className="ml-2">
              <LogOut className="w-4 h-4 mr-1" /> Odhlásiť
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
