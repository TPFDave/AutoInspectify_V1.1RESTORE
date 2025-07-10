import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useAuth } from "./AuthProvider";
import NavBar from "./NavBar";

export default function Dashboard() {
  const user = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [compact, setCompact] = useState(false);
  const [expandedIds, setExpandedIds] = useState([]);

  const statusOptions = [
    "Waiting for Inspection",
    "In Service",
    "Awaiting Pickup",
    "Completed",
  ];

  // Fetch vehicles (all time)
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `shops/${user.uid}/vehicles`),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [user]);

  // Fetch inspections (all time)
  useEffect(() => {
    if (!user) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const q = query(
      collection(db, `shops/${user.uid}/inspections`),
      where("createdAt", ">=", thirtyDaysAgo),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setInspections(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return unsub;
  }, [user]);

  // 30-day vehicles
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const vehiclesLast30Days = vehicles.filter(
    (v) => v.createdAt?.toDate?.() >= thirtyDaysAgo
  );

  const totalVehicles = vehiclesLast30Days.length;
  const totalInspections = inspections.length;
  const inspectedPercent = totalVehicles
    ? Math.round((totalInspections / totalVehicles) * 100)
    : 0;

  const progressColor =
    inspectedPercent >= 70
      ? "bg-green-500"
      : inspectedPercent >= 40
      ? "bg-yellow-500"
      : "bg-red-500";

  const filteredVehicles = vehicles
    .filter((v) =>
      statusFilter === "all" ? true : v.status === statusFilter
    )
    .filter((v) => {
      const t = searchTerm.toLowerCase();
      return (
        v.owner?.toLowerCase().includes(t) ||
        v.vin?.toLowerCase().includes(t) ||
        v.plate?.toLowerCase().includes(t)
      );
    });

  const updateStatus = async (id, newStatus) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, `shops/${user.uid}/vehicles`, id), {
        status: newStatus,
      });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const removeVehicle = async (v) => {
    if (!user) return;
    const dateStr =
      v.createdAt?.toDate?.().toLocaleString() || "Unknown Date";
    const confirmMessage = `Confirm vehicle has left the premises on or before ${dateStr}?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      await addDoc(collection(db, `shops/${user.uid}/vehicle_removals`), {
        removedAt: serverTimestamp(),
        removedBy: user.email || user.uid,
        vehicle: {
          year: v.year || "-",
          make: v.make || "-",
          model: v.model || "-",
          color: v.color || "-",
          vin: v.vin || "-",
          plate: v.plate || "-",
          owner: v.owner || "-",
          phone: v.phone || "-",
          createdAt: v.createdAt || null,
          status: v.status || "-",
        },
      });

      await deleteDoc(doc(db, `shops/${user.uid}/vehicles`, v.id));
    } catch (err) {
      console.error("Error removing vehicle:", err);
    }
  };

  const toggleExpanded = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <NavBar />

      {/* 30-Day Performance */}
      <div className="mb-6 border rounded p-4 bg-white shadow">
        <div className="flex flex-wrap gap-4 mb-2">
          <div className="flex-1">
            <div className="text-sm text-gray-600">Vehicles Checked In</div>
            <div className="text-lg font-bold">{totalVehicles}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">Inspections Completed</div>
            <div className="text-lg font-bold">{totalInspections}</div>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-600">% Vehicles Inspected</div>
            <div className="text-lg font-bold">{inspectedPercent}%</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded h-3">
          <div
            className={`${progressColor} h-3 rounded`}
            style={{ width: `${inspectedPercent}%` }}
          ></div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-red-700">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusOptions.map((status) => (
          <div key={status} className="p-3 border rounded text-center">
            <div className="text-lg font-bold">
              {vehicles.filter((v) => v.status === status).length}
            </div>
            <div className="text-xs text-gray-600">{status}</div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-2">Vehicles on Premise</h2>

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="Search by name, VIN, plate..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 flex-1 min-w-[150px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          onClick={() => setCompact(!compact)}
          className="border px-3 py-2 text-sm"
        >
          {compact ? "Normal View" : "Compact View"}
        </button>
      </div>

      {filteredVehicles.length === 0 ? (
        <p className="text-gray-500">No vehicles found.</p>
      ) : (
        <ul className="space-y-2">
          {filteredVehicles.map((v) => {
            const isExpanded = expandedIds.includes(v.id);
            return (
              <li
                key={v.id}
                className="border rounded p-3 bg-white shadow-sm"
              >
                {compact ? (
                  <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-2">
                    <div className="flex-1">
                      <span className="font-medium">
                        {v.year} {v.make} {v.model}
                      </span>{" "}
                      • {v.owner}
                    </div>
                    <select
                      value={v.status}
                      onChange={(e) => updateStatus(v.id, e.target.value)}
                      className="border p-1 text-sm"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {v.status === "Completed" && (
                      <button
                        onClick={() => removeVehicle(v)}
                        className="text-red-600 underline text-sm"
                      >
                        Remove
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpanded(v.id)}
                      className="text-blue-600 underline text-sm"
                    >
                      {isExpanded ? "Hide" : "Expand"}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-medium">
                        {v.year} {v.make} {v.model} ({v.color || "-"})
                      </div>
                      <div className="text-gray-600">
                        VIN: {v.vin || "-"}
                        {v.plate && ` • Plate: ${v.plate}`}
                      </div>
                      <div className="text-gray-600">
                        {v.owner || "-"} • {v.phone || "-"}
                      </div>
                      {v.createdAt?.toDate && (
                        <div className="text-gray-500 text-xs">
                          Checked in: {v.createdAt.toDate().toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                      <select
                        value={v.status}
                        onChange={(e) => updateStatus(v.id, e.target.value)}
                        className="border p-1 text-sm"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      {v.status === "Completed" && (
                        <button
                          onClick={() => removeVehicle(v)}
                          className="text-red-600 underline text-sm"
                        >
                          Remove
                        </button>
                      )}
                      <button
                        onClick={() =>
                          navigate("/inspection", { state: { vehicle: v } })
                        }
                        className="text-sm text-green-700 underline"
                      >
                        Start Inspection
                      </button>
                    </div>
                  </div>
                )}
                {compact && isExpanded && (
                  <div className="mt-2 text-sm text-gray-700 space-y-1">
                    <div>Color: {v.color || "-"}</div>
                    <div>VIN: {v.vin || "-"}</div>
                    <div>Plate: {v.plate || "-"}</div>
                    <div>Phone: {v.phone || "-"}</div>
                    {v.createdAt?.toDate && (
                      <div>
                        Checked in: {v.createdAt.toDate().toLocaleString()}
                      </div>
                    )}
                    <button
                      onClick={() =>
                        navigate("/inspection", { state: { vehicle: v } })
                      }
                      className="text-sm text-green-700 underline mt-1"
                    >
                      Start Inspection
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
