import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Budsjetter from "./pages/Budsjetter";
import MinOkonomi from "./pages/MinOkonomi";
import Bank from "./pages/Bank";
import Avstemninger from "./pages/Avstemninger";
import Chat from "./pages/Chat";
import Medlemmer from "./pages/Medlemmer";
import Kontrakter from "./pages/Kontrakter";
import Kalender from "./pages/Kalender";
import Leverandorer from "./pages/Leverandorer";
import Innstillinger from "./pages/Innstillinger";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Join from "./pages/Join";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/join" element={<Join />} />
            <Route path="/join/:code" element={<Join />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/min-okonomi" element={<ProtectedRoute><MinOkonomi /></ProtectedRoute>} />
            <Route path="/budsjetter" element={<ProtectedRoute><Budsjetter /></ProtectedRoute>} />
            <Route path="/bank" element={<ProtectedRoute><Bank /></ProtectedRoute>} />
            <Route path="/avstemninger" element={<ProtectedRoute><Avstemninger /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/medlemmer" element={<ProtectedRoute><Medlemmer /></ProtectedRoute>} />
            <Route path="/kontrakter" element={<ProtectedRoute><Kontrakter /></ProtectedRoute>} />
            <Route path="/kalender" element={<ProtectedRoute><Kalender /></ProtectedRoute>} />
            <Route path="/leverandorer" element={<ProtectedRoute><Leverandorer /></ProtectedRoute>} />
            <Route path="/innstillinger" element={<ProtectedRoute><Innstillinger /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
