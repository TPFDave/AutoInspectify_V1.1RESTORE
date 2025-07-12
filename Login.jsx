// src/Login.jsx
import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      console.error(err);
      setMessage("❌ Login failed. Please check your credentials.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap md:flex-nowrap gap-2 items-center">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-1 text-sm w-48"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-1 text-sm w-48"
        required
      />
      <button
        type="submit"
        className="bg-red-700 text-white px-3 py-1 rounded text-sm hover:bg-red-800"
      >
        Log In
      </button>
      {message && (
        <div className="text-sm text-red-600 w-full mt-1">{message}</div>
      )}
      <div className="text-xs mt-1 w-full">
        <Link to="/welcome" className="text-red-700 underline">
          Learn more about AutoInspectify
        </Link>
      </div>
    </form>
  );
}
