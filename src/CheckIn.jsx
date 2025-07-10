import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "./AuthProvider";
import { getAuth, signOut } from "firebase/auth";
import CustomerSelector from "./CustomerSelector";
import NavBar from "./NavBar";

export default function CheckIn() {
  const navigate = useNavigate();
  const user = useAuth();
  const auth = getAuth();

  const [vehicle, setVehicle] = useState({
    owner: "",
    phone: "",
    year: "",
    make: "",
    model: "",
    color: "",
    vin: "",
    mileage: "",
    plate: "",
  });
  const [message, setMessage] = useState("");
  const [queue, setQueue] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const vehicleMakeModels = {
    Acura: ["Integra", "Legend", "TL", "RL", "MDX", "RDX", "ILX", "TSX"],
    "Alfa Romeo": ["Giulia", "Stelvio"],
    Audi: ["A3", "A4", "A6", "A8", "Q3", "Q5", "Q7", "Q8"],
    BMW: ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7"],
    Buick: ["Century", "Regal", "LaCrosse", "Enclave", "Encore"],
    Cadillac: ["CTS", "ATS", "Escalade", "XT5", "SRX"],
    Chevrolet: [
      "Cavalier",
      "Impala",
      "Malibu",
      "Cruze",
      "Equinox",
      "Tahoe",
      "Silverado",
      "Suburban",
      "Traverse",
      "Trailblazer",
    ],
    Chrysler: ["300", "Sebring", "Pacifica", "Town & Country", "Voyager"],
    Dodge: [
      "Caravan",
      "Durango",
      "Charger",
      "Challenger",
      "Journey",
      "Ram 1500",
      "Dakota",
      "Neon",
      "Nitro",
    ],
    Fiat: ["500", "500X"],
    Ford: [
      "Escort",
      "Focus",
      "Fusion",
      "Taurus",
      "Mustang",
      "Escape",
      "Edge",
      "Explorer",
      "Expedition",
      "F-150",
      "Ranger",
      "Transit",
    ],
    Genesis: ["G70", "G80", "G90"],
    GMC: ["Sierra", "Canyon", "Acadia", "Terrain", "Yukon"],
    Honda: [
      "Accord",
      "Civic",
      "Fit",
      "Insight",
      "CR-V",
      "Pilot",
      "Odyssey",
      "Ridgeline",
      "Passport",
    ],
    Hyundai: ["Elantra", "Sonata", "Accent", "Santa Fe", "Tucson", "Kona"],
    Infiniti: ["G35", "G37", "Q50", "QX60", "QX80"],
    Isuzu: ["Rodeo", "Trooper"],
    Jaguar: ["XF", "XJ", "F-Pace", "E-Pace"],
    Jeep: ["Cherokee", "Grand Cherokee", "Liberty", "Wrangler", "Compass"],
    Kia: ["Rio", "Forte", "Optima", "Sorento", "Sportage", "Soul"],
    "Land Rover": ["Range Rover", "Discovery", "LR3", "LR4"],
    Lexus: ["ES", "GS", "IS", "RX", "NX", "GX"],
    Lincoln: ["MKZ", "MKS", "MKX", "Navigator", "Aviator"],
    Maserati: ["Ghibli", "Levante", "Quattroporte"],
    Mazda: ["3", "6", "CX-3", "CX-5", "CX-9", "MX-5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE"],
    Mercury: ["Sable", "Grand Marquis", "Mountaineer"],
    Mini: ["Cooper", "Countryman", "Clubman"],
    Mitsubishi: ["Lancer", "Galant", "Outlander", "Eclipse"],
    Nissan: [
      "Altima",
      "Sentra",
      "Maxima",
      "Rogue",
      "Murano",
      "Frontier",
      "Titan",
      "Pathfinder",
    ],
    Oldsmobile: ["Alero", "Intrigue", "Silhouette"],
    Pontiac: ["Grand Am", "Grand Prix", "G6", "G8", "Vibe"],
    Porsche: ["911", "Cayenne", "Macan", "Panamera"],
    Ram: ["1500", "2500", "3500"],
    Saab: ["9-3", "9-5"],
    Saturn: ["Ion", "Vue", "L-Series"],
    Scion: ["xA", "xB", "xD", "tC", "FR-S"],
    Smart: ["Fortwo"],
    Subaru: ["Impreza", "Legacy", "Outback", "Forester", "Crosstrek"],
    Suzuki: ["SX4", "Grand Vitara", "Forenza"],
    Tesla: ["Model S", "Model 3", "Model X", "Model Y"],
    Toyota: [
      "Corolla",
      "Camry",
      "Avalon",
      "Prius",
      "RAV4",
      "Highlander",
      "Tacoma",
      "Tundra",
      "4Runner",
    ],
    Volkswagen: ["Jetta", "Passat", "Golf", "Tiguan", "Atlas"],
    Volvo: ["S60", "S80", "XC60", "XC90"],
  };

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, `shops/${user.uid}/vehicles`),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snap) =>
      setQueue(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [user]);

  useEffect(() => {
    const make = vehicle.make.trim();
    if (vehicleMakeModels[make]) {
      setFilteredModels(vehicleMakeModels[make]);
    } else {
      setFilteredModels([]);
    }
  }, [vehicle.make]);

  const handleChange = (field) => (e) =>
    setVehicle({ ...vehicle, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return setMessage("⚠️  Please log in first.");
    try {
      await addDoc(collection(db, `shops/${user.uid}/vehicles`), {
        ...vehicle,
        status: "pending",
        createdAt: serverTimestamp(),
        customerId: selectedCustomer ? selectedCustomer.id : null,
      });
      setVehicle({
        owner: "",
        phone: "",
        year: "",
        make: "",
        model: "",
        color: "",
        vin: "",
        mileage: "",
        plate: "",
      });
      setSelectedCustomer(null);
      setMessage("✅ Vehicle checked in!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Could not save.");
    }
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `shops/${user.uid}/vehicles`, id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleVinScannerClick = () => {
    window.alert("Feature not available yet");
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <NavBar />

      {user && (
        <div className="text-sm text-gray-600 mb-2">
          Logged in as <span className="font-medium">{user.email}</span>
        </div>
      )}

      <CustomerSelector
        user={user}
        onCustomerSelected={(customer) => {
          setSelectedCustomer(customer);
          if (customer) {
            setVehicle((prev) => ({
              ...prev,
              owner: customer.name,
              phone: customer.phone,
            }));
          } else {
            setVehicle((prev) => ({ ...prev, owner: "", phone: "" }));
          }
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 bg-white p-4 rounded shadow mb-6"
      >
        <input
          type="text"
          placeholder="Owner Name"
          value={vehicle.owner}
          onChange={handleChange("owner")}
          className="border p-2"
        />
        <input
          type="tel"
          placeholder="Phone Number"
          value={vehicle.phone}
          onChange={handleChange("phone")}
          className="border p-2"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Year"
            value={vehicle.year}
            onChange={handleChange("year")}
            className="border p-2"
          />
          <input
            list="vehicleMakes"
            type="text"
            placeholder="Make"
            value={vehicle.make}
            onChange={handleChange("make")}
            className="border p-2"
          />
          <datalist id="vehicleMakes">
            {Object.keys(vehicleMakeModels).map((make) => (
              <option key={make} value={make} />
            ))}
          </datalist>
        </div>
        <input
          list="vehicleModels"
          type="text"
          placeholder="Model"
          value={vehicle.model}
          onChange={handleChange("model")}
          className="border p-2"
        />
        <datalist id="vehicleModels">
          {filteredModels.map((model) => (
            <option key={model} value={model} />
          ))}
        </datalist>
        <input
          type="text"
          placeholder="Color"
          value={vehicle.color}
          onChange={handleChange("color")}
          className="border p-2"
        />
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="VIN"
            value={vehicle.vin}
            onChange={handleChange("vin")}
            className="border p-2 flex-1"
          />
          <button
            type="button"
            onClick={handleVinScannerClick}
            className="border p-2 bg-red-600 text-white"
          >
            Scan VIN
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Mileage"
            value={vehicle.mileage}
            onChange={handleChange("mileage")}
            className="border p-2"
          />
          <input
            type="text"
            placeholder="License Plate"
            value={vehicle.plate}
            onChange={handleChange("plate")}
            className="border p-2"
          />
        </div>
        <button
          type="submit"
          className="bg-red-700 text-white p-2 rounded hover:bg-red-800"
        >
          Check In Vehicle
        </button>
        {message && <div className="text-sm">{message}</div>}
      </form>

      <div className="mt-6">
        <h2 className="text-lg mb-2">Pending Vehicles</h2>
        {queue.length === 0 ? (
          <p className="text-sm text-gray-500">No vehicles waiting.</p>
        ) : (
          <ul className="space-y-2">
            {queue.map((v) => (
              <li
                key={v.id}
                className="flex items-center gap-2 border rounded p-3 bg-white shadow-sm hover:bg-red-50 transition"
              >
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => navigate("/inspection", { state: { vehicle: v } })}
                >
                  <div className="font-medium">
                    {v.year} {v.make} {v.model} ({v.color})
                  </div>
                  <div className="text-sm text-gray-600">
                    VIN: {v.vin}
                    {v.plate && <> • Plate: {v.plate}</>}
                    <br />
                    {v.owner} • {v.phone}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(v.id);
                  }}
                  className="text-sm text-red-600 hover:text-red-800 underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
