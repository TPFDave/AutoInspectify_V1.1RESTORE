// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import ClientDatabase from "./ClientDatabase";
import InspectionForm from "./InspectionForm";
import InspectionsList from "./InspectionsList";
import CheckIn from "./CheckIn";
import Home from "./Home";
import ScanVin from "./ScanVin";
import Welcome from "./Welcome";
import Shop from "./Shop";
import AuthProvider, { useAuth } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";
import "./index.css";

function AppRouter() {
  const user = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <Welcome />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/scan-vin" element={<ScanVin />} />
      <Route path="/checkin" element={user ? <CheckIn /> : <Welcome />} />
      <Route path="/inspections" element={user ? <InspectionsList /> : <Welcome />} />
      <Route path="/inspection" element={user ? <InspectionForm /> : <Welcome />} />
      <Route path="/clients" element={user ? <ClientDatabase /> : <Welcome />} />
      <Route path="/shop" element={user ? <Shop /> : <Welcome />} />
      <Route path="*" element={<Welcome />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppRouter />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
