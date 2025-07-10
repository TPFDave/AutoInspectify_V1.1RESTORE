import React, { useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { useNavigate } from "react-router-dom";

export default function ScanVin() {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);
  const hasScannedRef = useRef(false);
  const navigate = useNavigate();

  const stopCamera = () => {
    const video = videoRef.current;
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startScanner = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === "videoinput");
        const backCam = cameras.find((d) =>
          d.label.toLowerCase().includes("back")
        );
        const deviceId = backCam?.deviceId || cameras[0]?.deviceId;

        console.log("📸 Starting decodeFromVideoDevice with ID:", deviceId);

        await codeReader.decodeFromVideoDevice(
          deviceId,
          videoRef.current,
          (result, err) => {
            if (result && !hasScannedRef.current) {
              hasScannedRef.current = true;
              const vin = result.getText();
              console.log("✅ Scanned VIN:", vin);

              stopCamera();
              codeReader.reset();

              // ⚠️ Delay redirect to let camera teardown clean up
              setTimeout(() => {
                navigate("/checkin", { state: { vin } });
              }, 300);
            }
          }
        );
      } catch (err) {
        console.error("Scanner error:", err);
        navigate("/checkin");
      }
    };

    startScanner();

    return () => {
      codeReader.reset();
      stopCamera();
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <video
        ref={videoRef}
        className="w-full max-w-md rounded"
        autoPlay
        muted
        playsInline
        style={{ backgroundColor: "black" }}
      >
        Camera access required.
      </video>
      <button
        onClick={() => navigate("/checkin")}
        className="mt-6 px-4 py-2 bg-red-600 text-white rounded"
      >
        Cancel
      </button>
    </div>
  );
}
