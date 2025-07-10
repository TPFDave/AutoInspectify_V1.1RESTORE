import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export default function CustomerSelector({ onCustomerSelected, user }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!searchTerm || !user) {
      setResults([]);
      return;
    }

    const fetchCustomers = async () => {
      const snap = await getDocs(collection(db, `shops/${user.uid}/customers`));
      const allCustomers = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      const filtered = allCustomers.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered);
    };

    fetchCustomers().catch(console.error);
  }, [searchTerm, user]);

  const handleSelect = (customer) => {
    setSelected(customer);
    setResults([]);
    setSearchTerm("");
    if (onCustomerSelected) {
      onCustomerSelected(customer);
    }
  };

  const handleAddNew = async () => {
    if (!user) return;
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      setMessage("Please enter name and phone.");
      return;
    }
    try {
      const docRef = await addDoc(
        collection(db, `shops/${user.uid}/customers`),
        {
          ...newCustomer,
          createdAt: serverTimestamp(),
          vehicles: [],
        }
      );
      const newCust = { id: docRef.id, ...newCustomer, vehicles: [] };
      handleSelect(newCust);
      setAddingNew(false);
      setNewCustomer({ name: "", phone: "" });
      setMessage("");
    } catch (err) {
      console.error(err);
      setMessage("Error adding customer.");
    }
  };

  return (
    <div className="mb-4 p-3 border rounded bg-gray-50">
      {selected ? (
        <div className="flex justify-between items-center">
          <div>
            <div className="font-medium">{selected.name}</div>
            <div className="text-sm text-gray-600">{selected.phone}</div>
          </div>
          <button
            onClick={() => {
              setSelected(null);
              onCustomerSelected(null);
            }}
            className="text-sm text-red-600 underline"
          >
            Clear
          </button>
        </div>
      ) : addingNew ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Customer Name"
            value={newCustomer.name}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, name: e.target.value })
            }
            className="border p-2 w-full"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
            className="border p-2 w-full"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddNew}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Save Customer
            </button>
            <button
              onClick={() => {
                setAddingNew(false);
                setMessage("");
              }}
              className="text-sm underline"
            >
              Cancel
            </button>
          </div>
          {message && <div className="text-sm text-red-600">{message}</div>}
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Search customer by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 w-full"
          />
          {results.length > 0 && (
            <ul className="mt-2 border rounded bg-white max-h-48 overflow-y-auto">
              {results.map((c) => (
                <li
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="p-2 hover:bg-red-50 cursor-pointer"
                >
                  {c.name} • {c.phone}
                </li>
              ))}
            </ul>
          )}
          {user?.email === "test@shop.com" ? (
            <div className="text-sm text-gray-500 mt-2">
              Adding new customers is disabled in demo mode.
            </div>
          ) : (
            <button
              onClick={() => setAddingNew(true)}
              className="text-sm text-blue-700 underline mt-2"
            >
              + Add New Customer
            </button>
          )}
        </div>
      )}
    </div>
  );
}
