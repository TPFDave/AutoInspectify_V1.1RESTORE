import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { useAuth } from "./AuthProvider";
import { getAuth, signOut } from "firebase/auth";

// Reusable input
const NumInput = ({ label, value, set }) => (
  <div className="flex flex-col">
    <label className="text-sm mb-1 text-gray-800">{label}</label>
    <input
      type="number"
      step="0.1"
      value={value}
      onChange={(e) => set(e.target.value)}
      className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-600"
    />
  </div>
);

export default function InspectionForm() {
  const location = useLocation();
  const prefill = location.state?.vehicle || {};
  const user = useAuth();
  const auth = getAuth();

  const [tread, setTread] = useState({ lf: "", rf: "", lr: "", rr: "" });
  const [brakes, setBrakes] = useState({ lf: "", rf: "", lr: "", rr: "" });
  const [pressure, setPressure] = useState({ lf: "", rf: "", lr: "", rr: "" });

  const [lights, setLights] = useState("");
  const [message, setMessage] = useState("");

  const [fluids, setFluids] = useState({
    oil: "good",
    coolant: "good",
    transmission: "good",
    steering: "good",
  });

  const [general, setGeneral] = useState({
    battery: "good",
    wipers: "good",
    lights: "good",
    windshield: "good",
    leaks: "good",
    belts: "good",
    airFilter: "good",
  });

  const handleLogout = () => {
    signOut(auth).catch((err) => console.error("Logout failed:", err));
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setMessage("You must be logged in.");

    try {
      await addDoc(collection(db, `shops/${user.uid}/inspections`), {
        tread,
        brakes,
        pressure,
        lights,
        fluids,
        general,
        vehicle: {
          year: prefill.year,
          make: prefill.make,
          model: prefill.model,
          color: prefill.color,
          owner: prefill.owner,
          phone: prefill.phone,
          id: prefill.id,
        },
        createdAt: serverTimestamp(),
      });

      // Mark vehicle as inspected
      if (prefill.id) {
        await updateDoc(doc(db, `shops/${user.uid}/vehicles`, prefill.id), {
          status: "inspected",
        });
      }

      setMessage("✅ Inspection saved!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Save failed.");
    }
  };


  const renderConditionOptions = (group, key, setter) => (
    <div className="flex items-center gap-4">
      {["good", "attention", "bad"].map((status) => {
        const color =
          status === "good"
            ? "text-green-600"
            : status === "attention"
            ? "text-yellow-600"
            : "text-red-600";
        return (
          <label key={status} className={`flex items-center gap-1 ${color}`}>
            <input
              type="radio"
              name={`${group}-${key}`}
              value={status}
              checked={group[key] === status}
              onChange={(e) => setter({ ...group, [key]: e.target.value })}
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </label>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <nav className="flex justify-between items-center mb-6 text-sm">
  <div className="flex gap-4">
    <Link to="/checkin" className="text-red-700 underline">Check‑In</Link>
    <Link to="/" className="text-red-700 underline">New</Link>
    <Link to="/inspections" className="text-red-700 underline">Past</Link>
  </div>
  {user && (
    <button onClick={handleLogout} className="text-red-600 underline">
      Log Out
    </button>
  )}
</nav>

      <h1 className="text-2xl font-bold mb-4 text-red-700">Vehicle Inspection</h1>

      
      {prefill && prefill.year && (
        <div className="mb-4 p-4 bg-gray-50 rounded border">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Vehicle Info</h2>
          <p className="text-sm text-gray-800">
            <strong>{prefill.year} {prefill.make} {prefill.model} ({prefill.color})</strong><br />
            Owner: {prefill.owner}<br />
            Phone: {prefill.phone}
          </p>
        </div>
      )}
<form onSubmit={handleSubmit} className="space-y-6">
        {/* Tread & Brakes */}
        <div className="grid grid-cols-2 gap-4">
          {["lf", "rf", "lr", "rr"].map((pos) => (
            <NumInput
              key={pos}
              label={`Tire Tread (${pos.toUpperCase()}) mm`}
              value={tread[pos]}
              set={(v) => setTread({ ...tread, [pos]: v })}
            />
          ))}
          {["lf", "rf", "lr", "rr"].map((pos) => (
            <NumInput
              key={pos}
              label={`Brake Pad (${pos.toUpperCase()}) mm`}
              value={brakes[pos]}
              set={(v) => setBrakes({ ...brakes, [pos]: v })}
            />
          ))}
          {["lf", "rf", "lr", "rr"].map((pos) => (
            <NumInput
              key={pos}
              label={`Tire Pressure (${pos.toUpperCase()}) PSI`}
              value={pressure[pos]}
              set={(v) => setPressure({ ...pressure, [pos]: v })}
            />
          ))}
        </div>

        {/* Lights */}
        <div>
          <label className="text-sm text-gray-700 mb-1 block">Exterior Lights</label>
          <input
            type="text"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-red-600"
            value={lights}
            onChange={(e) => setLights(e.target.value)}
            placeholder="e.g. All working"
          />
        </div>

        {/* Fluid Levels */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold text-red-800 mb-3">Fluid Checks</h2>
          <div className="space-y-4">
            {Object.keys(fluids).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium capitalize mb-1">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                {renderConditionOptions(fluids, key, setFluids)}
              </div>
            ))}
          </div>
        </div>

        {/* General Conditions */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold text-red-800 mb-3">General Condition</h2>
          <div className="space-y-4">
            {Object.keys(general).map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium capitalize mb-1">
                  {key.replace(/([A-Z])/g, " $1")}
                </label>
                {renderConditionOptions(general, key, setGeneral)}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-red-700 hover:bg-red-800 text-white px-6 py-2 rounded w-full font-semibold shadow"
        >
          Save Inspection
        </button>

        {message && <p className="text-sm text-green-600 mt-2">{message}</p>}
      </form>
    </div>
  );
}
