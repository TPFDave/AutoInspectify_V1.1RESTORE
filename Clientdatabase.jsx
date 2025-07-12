import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "./AuthProvider";
import NavBar from "./NavBar";

export default function ClientDatabase() {
  const user = useAuth();
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ name: "", phone: "", phone2: "" });
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    phone2: "",
  });

  useEffect(() => {
    if (!user) return;
    const fetchCustomers = async () => {
      const snap = await getDocs(collection(db, `shops/${user.uid}/customers`));
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchCustomers().catch(console.error);
  }, [user]);

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const startEdit = (cust) => {
    setEditing(cust.id);
    setEditData({
      name: cust.name,
      phone: cust.phone,
      phone2: cust.phone2 || "",
    });
    setMessage("");
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, `shops/${user.uid}/customers`, id), editData);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...editData } : c))
      );
      setEditing(null);
      setMessage("✅ Saved.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error saving.");
    }
  };

  const removeCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await deleteDoc(doc(db, `shops/${user.uid}/customers`, id));
      setCustomers((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setMessage("❌ Error deleting.");
    }
  };

  const saveNewCustomer = async () => {
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
        }
      );
      setCustomers((prev) => [...prev, { id: docRef.id, ...newCustomer }]);
      setNewCustomer({ name: "", phone: "", phone2: "" });
      setAdding(false);
      setMessage("✅ Customer added.");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error adding customer.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <NavBar />

      <h1 className="text-2xl font-bold mb-4 text-red-700">Client Database</h1>

      <input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 mb-4 w-full"
      />

      {adding ? (
        <div className="mb-4 space-y-2 border p-3 rounded bg-gray-50">
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
            type="text"
            placeholder="Primary Phone"
            value={newCustomer.phone}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone: e.target.value })
            }
            className="border p-2 w-full"
          />
          <input
            type="text"
            placeholder="Secondary Phone (optional)"
            value={newCustomer.phone2}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, phone2: e.target.value })
            }
            className="border p-2 w-full"
          />
          <div className="flex gap-2">
            <button
              onClick={saveNewCustomer}
              className="bg-green-600 text-white px-3 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setNewCustomer({ name: "", phone: "", phone2: "" });
                setMessage("");
              }}
              className="text-sm underline"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setAdding(true);
            setMessage("");
          }}
          className="text-sm text-blue-700 underline mb-4"
        >
          + New Customer
        </button>
      )}

      {filtered.length === 0 ? (
        <p className="text-gray-600">No customers found.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((c) => (
            <li key={c.id} className="border rounded p-3 bg-white shadow-sm">
              {editing === c.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                    className="border p-2 w-full"
                  />
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                    className="border p-2 w-full"
                  />
                  <input
                    type="text"
                    placeholder="Secondary Phone"
                    value={editData.phone2}
                    onChange={(e) =>
                      setEditData({ ...editData, phone2: e.target.value })
                    }
                    className="border p-2 w-full"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(c.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="text-sm underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-sm text-gray-600">
                      {c.phone}
                      {c.phone2 && ` • ${c.phone2}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(c)}
                      className="text-blue-600 underline text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeCustomer(c.id)}
                      className="text-red-600 underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {message && <div className="text-sm mt-2">{message}</div>}
    </div>
  );
}
