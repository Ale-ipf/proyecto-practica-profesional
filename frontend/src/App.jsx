import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import RutaProtegida from "./components/RutaProtegida.jsx";

import HomePage from "./pages/HomePage.jsx";
import PropertyDetailPage from "./pages/PropertyDetailPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import OwnerDashboardPage from "./pages/OwnerDashboardPage.jsx";
import StudentDashboardPage from "./pages/StudentDashboardPage.jsx";
import InstitutionalPage from "./pages/InstitutionalPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="propiedades/:id" element={<PropertyDetailPage />} />
          <Route path="ingresar" element={<LoginPage />} />
          <Route path="crear-cuenta" element={<RegisterPage />} />
          <Route path="institucional" element={<InstitutionalPage />} />
          <Route path="contacto" element={<ContactPage />} />

          <Route
            path="panel-dueno"
            element={
              <RutaProtegida rolRequerido="owner">
                <OwnerDashboardPage />
              </RutaProtegida>
            }
          />

          <Route
            path="panel-estudiante"
            element={
              <RutaProtegida rolRequerido="student">
                <StudentDashboardPage />
              </RutaProtegida>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}
