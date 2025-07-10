import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

export default function VinScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const hasScanned = useRef(false);
  const [error, setError] = useState(null);

  const stopCamera = () => {
    const video = videoRef.current;
    if (video?.srcObject) {
      console.log("🛑 Stopping camera...");
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  const handleCancel = () => {
    console.log("❌ Cancel clicked.");
    hasScanned.current = true;
    stopCamera();
    readerRef.current?.reset();
    onClose();
  };

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const startScanner = async () => {
      console.log("🚀 Starting scanner...");
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === "videoinput");
        const backCam = cameras.find((d) =>
          d.label.toLowerCase().includes("back")
        );
        const deviceId = backCam?.deviceId || cameras[0]?.deviceId;

        if (!deviceId) throw new Error("No camera available");

        await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
          if (result && !hasScanned.current) {
            hasScanned.current = true;
            const vin = result.getText();
            console.log("✅ Scanned VIN:", vin);

            // Stop the camera safely before React tries to re-render
            stopCamera();
            reader.reset();

            // Pass the VIN back to parent (delayed unmount is handled there)
            onDetected(vin);
          }
          if (err && err.name !== "NotFoundException") {
            console.warn("⚠️ Scanner error:", err);
          }
        });
      } catch (err) {
        console.error("❌ Scanner start error:", err);
        setError("Camera access failed. Please check permissions.");
      }
    };

    startScanner();

    return () => {
      console.log("🔄 Unmounting VinScanner...");
      stopCamera();
      reader.reset();
    };
  }, [onDetected, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
      <video
        ref={videoRef}
        className="w-full max-w-md rounded"
        autoPlay
        muted
        playsInline
        style={{ backgroundColor: "black" }}
      />
      <button
        onClick={handleCancel}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded z-10"
      >
        Cancel
      </button>
      {error && (
        <p className="text-red-400 mt-2 text-sm text-center">
          ⚠️ {error}
        </p>
      )}
    </div>
  );
}
