// src/Shop.jsx
import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./AuthProvider";
import NavBar from "./NavBar";
import { useTheme } from "./ThemeProvider";

export default function Shop() {
  const user = useAuth();
  const { theme, saveTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [shopData, setShopData] = useState({
    name: "",
    address: "",
    phone: "",
    website: "",
    logoUrl: "",
    description: "",
  });

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const ref = doc(db, `shops/${user.uid}`);
        const snap = await getDoc(ref);
        if (snap.exists()) setShopData(snap.data());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const saveShop = async () => {
    if (!shopData.name.trim()) {
      setMessage("Shop name required.");
      return;
    }
    await setDoc(doc(db, `shops/${user.uid}`), shopData, { merge: true });
    setEditMode(false);
    setMessage("✅ Saved.");
  };

  if (!user) return <p className="p-4">Please log in.</p>;
  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <NavBar />
      <h1 className="text-2xl font-bold mb-4" style={{ color: theme.color }}>
        Shop Profile & Theme
      </h1>

      {editMode ? (
        <div className="space-y-3">
          {["name", "address", "phone", "website", "logoUrl"].map((field) => (
            <input
              key={field}
              type="text"
              placeholder={field}
              value={shopData[field]}
              onChange={(e) =>
                setShopData({ ...shopData, [field]: e.target.value })
              }
              className="border p-2 w-full"
            />
          ))}
          <textarea
            placeholder="Description"
            value={shopData.description}
            onChange={(e) =>
              setShopData({ ...shopData, description: e.target.value })
            }
            className="border p-2 w-full min-h-[80px]"
          />
          <button
            onClick={saveShop}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Save Shop Info
          </button>
          <button
            onClick={() => setEditMode(false)}
            className="text-sm underline"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {shopData.logoUrl && (
            <img
              src={shopData.logoUrl}
              alt="Logo"
              className="max-h-32 object-contain mb-2"
            />
          )}
          <div>{shopData.name}</div>
          <div className="text-sm">{shopData.description}</div>
          <button
            onClick={() => setEditMode(true)}
            className="text-sm text-blue-700 underline"
          >
            Edit Shop Info
          </button>
        </div>
      )}

      <hr className="my-4" />

      <h2 className="text-lg font-semibold mb-2">Theme Settings</h2>
      <div className="space-y-2">
        <label className="block text-sm">Primary Color:</label>
        <input
          type="color"
          value={theme.color}
          onChange={(e) => saveTheme({ ...theme, color: e.target.value })}
          className="w-16 h-10 border p-0"
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={theme.darkMode}
            onChange={(e) => saveTheme({ ...theme, darkMode: e.target.checked })}
          />
          Enable Dark Mode
        </label>
      </div>

      {message && <div className="text-sm mt-2">{message}</div>}
    </div>
  );
}
