import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthProvider";
import NavBar from "./NavBar";

function StatusPill({ label, value }) {
  const color =
    value === "good"
      ? "text-green-600"
      : value === "attention"
      ? "text-yellow-600"
      : "text-red-600";
  const bg =
    value === "good"
      ? "bg-green-100"
      : value === "attention"
      ? "bg-yellow-100"
      : "bg-red-100";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${color} ${bg}`}>
      {label}: {value.charAt(0).toUpperCase() + value.slice(1)}
    </span>
  );
}

function InspectionCard({ insp }) {
  const cardRef = useRef(null);

  const handlePrint = () => {
    const printContent = cardRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const {
    vehicle = {},
    tread = {},
    brakes = {},
    pressure = {},
    lights = "",
    fluids = {},
    general = {},
    createdAt,
  } = insp;

  const positions = ["lf", "rf", "lr", "rr"];

  const posLabel = {
    lf: "LF",
    rf: "RF",
    lr: "LR",
    rr: "RR",
  };

  return (
    <li ref={cardRef} className="border p-6 rounded shadow bg-white">
      {/* Vehicle Header */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-red-800">
          {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.color})
        </h3>
        <p className="text-sm text-gray-700">
          Owner: {vehicle.owner} &bull; {vehicle.phone}
        </p>
      </div>

      {/* Measurements */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-red-700 mb-2">Tire Tread (mm)</h4>
          <ul className="text-sm space-y-1">
            {positions.map((p) => (
              <li key={p}>
                {posLabel[p]}: {tread[p] || "—"}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-red-700 mb-2">Brake Pad (mm)</h4>
          <ul className="text-sm space-y-1">
            {positions.map((p) => (
              <li key={p}>
                {posLabel[p]}: {brakes[p] || "—"}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-red-700 mb-2">Tire Pressure (PSI)</h4>
          <ul className="text-sm space-y-1">
            {positions.map((p) => (
              <li key={p}>
                {posLabel[p]}: {pressure[p] || "—"}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Lights */}
      <p className="mb-4 text-sm">
        <strong className="text-red-700">Exterior Lights:</strong>{" "}
        {lights || "—"}
      </p>

      {/* Fluids & General */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="font-medium text-red-700 mb-2">Fluid Checks</h4>
          <div className="space-y-1">
            {Object.entries(fluids).map(([k, v]) => (
              <StatusPill key={k} label={k.replace(/([A-Z])/g, " $1")} value={v} />
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-red-700 mb-2">General Condition</h4>
          <div className="space-y-1">
            {Object.entries(general).map(([k, v]) => (
              <StatusPill key={k} label={k.replace(/([A-Z])/g, " $1")} value={v} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500">
        Saved: {createdAt?.toDate?.().toLocaleString?.() || "N/A"}
      </p>

      <button
        onClick={handlePrint}
        className="mt-4 bg-red-700 hover:bg-red-800 text-white px-4 py-1 rounded text-sm shadow"
      >
        Print
      </button>
    </li>
  );
}

export default function InspectionsList() {
  const user = useAuth();
  const [inspections, setInspections] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const snap = await getDocs(collection(db, `shops/${user.uid}/inspections`));
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setInspections(data);
    };
    fetchData();
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <NavBar />

      <h2 className="text-2xl font-bold mb-4 text-red-700">Past Inspections</h2>

      {inspections.length === 0 ? (
        <p className="text-gray-600">No inspections found.</p>
      ) : (
        <ul className="space-y-6">
          {inspections.map((insp) => (
            <InspectionCard key={insp.id} insp={insp} />
          ))}
        </ul>
      )}
    </div>
  );
}
