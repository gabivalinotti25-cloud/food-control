import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import OnboardingWizard from "../components/OnboardingWizard";
import api from "../services/api";

export default function MainLayout({ children }) {
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);

  useEffect(() => {
    api
      .get("/onboarding/estado")
      .then((res) => {
        const estado = res.data.onboarding?.estado;
        if (estado === "PENDIENTE" || estado === "EN_PROGRESO") {
          setMostrarOnboarding(true);
        }
      })
      .catch(() => {
        // Si el endpoint no existe aún, no mostrar nada
      });
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">{children}</div>
      </main>
      {mostrarOnboarding && (
        <OnboardingWizard onCerrar={() => setMostrarOnboarding(false)} />
      )}
    </div>
  );
}
