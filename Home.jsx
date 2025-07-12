import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate("/checkin");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow p-6 flex flex-col items-center text-center">
        <img
          src="/logo.png"
          alt="AutoInspectify logo"
          className="h-32 w-auto mb-2"
        />
        <h1 className="text-3xl font-bold mb-1">AutoInspectify</h1>
        <p className="text-gray-600 mb-4">Your Digital Inspection Solution</p>

        <button
          onClick={handleEnter}
          className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition"
        >
          Enter App
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 space-y-12">
        {/* Info Section */}
        <div className="max-w-xl text-center space-y-6">
          <p className="text-lg">
            Save time, stay organized, and present your findings professionally.
          </p>
          <p className="text-md text-gray-700">
            AutoInspectify helps your shop document vehicle inspections
            digitally with clean, consistent, and printable reports.
          </p>
        </div>

        {/* Contact Form */}
        <div className="w-full max-w-md bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">Contact Us</h2>
          <form
            action="https://formspree.io/f/mayvlkqb"
            method="POST"
            className="space-y-4"
          >
            <input
              type="text"
              name="name"
              required
              placeholder="Your Name"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <input
              type="email"
              name="email"
              required
              placeholder="Your Email"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <textarea
              name="message"
              required
              placeholder="Your Message"
              rows="4"
              className="w-full border border-gray-300 px-4 py-2 rounded"
            />
            <button
              type="submit"
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow p-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} AutoInspectify. All rights reserved.
      </footer>
    </div>
  );
}
