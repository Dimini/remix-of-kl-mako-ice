import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import ClimateChange from "./pages/ClimateChange";
import Elections from "./pages/Elections";
import WhyVoteMatters from "./pages/WhyVoteMatters";
import NotFound from "./pages/NotFound";
import Metodologia from "./pages/Metodologia";
import SlovakiaMap from "./pages/SlovakiaMap";
import RegionPage from "./pages/RegionPage";
import CandidateDetail from "./pages/CandidateDetail";
import Questionnaire from "./pages/Questionnaire";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { AdminGate } from "@/components/admin/AdminGate";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminCandidatesList from "./pages/admin/AdminCandidatesList";
import AdminCandidateDetail from "./pages/admin/AdminCandidateDetail";
import AdminReviewQueue from "./pages/admin/AdminReviewQueue";
import AdminExport from "./pages/admin/AdminExport";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVotingImport from "./pages/admin/AdminVotingImport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AdminAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<SlovakiaMap />} />
              <Route path="/region/:krajId" element={<RegionPage />} />
              <Route path="/kandidat/:id" element={<CandidateDetail />} />
              {/* Questionnaire is intentionally public — candidates fill it without auth. */}
              <Route path="/dotaznik/:uuid" element={<Questionnaire />} />
              <Route path="/kandidati" element={<Elections />} />
              <Route path="/preco-volit" element={<WhyVoteMatters />} />
              <Route path="/klimaticka-zmena" element={<ClimateChange />} />
              <Route path="/klimaticke-data" element={<Index />} />
              <Route path="/metodologia" element={<Metodologia />} />

              {/* Admin login — public. */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Admin — every route inside requires session + reviewer/admin role. */}
              <Route path="/admin" element={<AdminGate><AdminLayout /></AdminGate>}>
                <Route index element={<AdminCandidatesList />} />
                <Route path="candidate/:id" element={<AdminCandidateDetail />} />
                <Route path="review" element={<AdminReviewQueue />} />
                <Route path="export" element={<AdminExport />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="voting-import" element={<AdminVotingImport />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminAuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
