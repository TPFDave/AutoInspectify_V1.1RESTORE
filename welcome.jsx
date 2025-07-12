import React from "react";
import Login from "./Login";

export default function Welcome() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Login Banner */}
      <header className="bg-red-700 text-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between">
          <h2 className="text-lg font-semibold">Log In to Access ShopInspect</h2>
          <Login />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto p-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo.png"
            alt="ShopInspect Logo"
            className="h-24 object-contain"
          />
        </div>

        {/* Welcome Title */}
        <h1 className="text-3xl font-bold text-center text-red-700 mb-4">
          Welcome to ShopInspect
        </h1>

        {/* Intro Text */}
        <p className="text-center text-gray-700 mb-8 max-w-2xl mx-auto">
          ShopInspect is the all-in-one digital platform for managing vehicle inspections, client records,
          and shop performance. Log in above to get started, or explore more below.
        </p>

        {/* Info Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* About Us */}
          <div className="bg-white border rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2 text-red-700">About Us</h2>
            <p className="text-gray-700">
              Our mission is to make vehicle inspections and customer management simple, fast, and professional
              for automotive shops of any size.
            </p>
          </div>

          {/* FAQ */}
          <div className="bg-white border rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-2 text-red-700">Frequently Asked Questions</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>How do I create an account? <span className="italic">(Coming Soon)</span></li>
              <li>How do I reset my password? <span className="italic">(Coming Soon)</span></li>
              <li>Need help? Contact support.</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm p-4">
        &copy; {new Date().getFullYear()} ShopInspect. All rights reserved.
      </footer>
    </div>
  );
}
