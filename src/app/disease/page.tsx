"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Camera, CheckCircle2 } from "lucide-react";
import {
  analyzePlantDisease,
  getDiseaseModelId,
  type DiseaseDetectionResult,
} from "@/lib/disease-detection";

export default function DiseaseDetectionPage() {
  const { t } = useLanguage();
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<null | DiseaseDetectionResult>(null);
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [liveDetectionActive, setLiveDetectionActive] = useState(false);
  const [scanHistory, setScanHistory] = useState<
    Array<{ crop: string; label: string; confidence: number; isHealthy: boolean }>
  >([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const liveDetectionTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const analysisInFlightRef = useRef(false);

  const translate = (key: string, fallback: string) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const stopLiveDetection = useCallback(() => {
    if (liveDetectionTimerRef.current) {
      clearInterval(liveDetectionTimerRef.current);
      liveDetectionTimerRef.current = null;
    }
    setLiveDetectionActive(false);
    setAnalyzing(false);
  }, []);

  const stopCamera = useCallback(() => {
    stopLiveDetection();
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, [stopLiveDetection]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const analyzeImage = async (
    source: Blob | HTMLCanvasElement,
    options?: { preserveExistingResult?: boolean }
  ) => {
    if (analysisInFlightRef.current) return;

    analysisInFlightRef.current = true;
    setAnalyzing(true);

    if (!options?.preserveExistingResult) {
      setResult(null);
    }

    try {
      const detectionResult = await analyzePlantDisease(source);
      setResult(detectionResult);
      setScanHistory((current) => [
        {
          crop: selectedCrop,
          label: detectionResult.diseaseLabel,
          confidence: detectionResult.confidence,
          isHealthy: detectionResult.isHealthy,
        },
        ...current,
      ].slice(0, 3));
      setCameraError(null);
    } catch (error) {
      console.error("Disease detection failed", error);
      setCameraError(
        translate(
          "disease_model_failed",
          "The AI model could not analyze this image. Try again with a clearer leaf photo."
        )
      );
    } finally {
      analysisInFlightRef.current = false;
      setAnalyzing(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      stopCamera();
      setCameraError(null);
      await analyzeImage(e.target.files[0]);
      e.target.value = "";
    }
  };

  const openFileCapture = () => {
    setCameraError(null);
    inputRef.current?.click();
  };

  const startLiveCamera = async () => {
    if (
      typeof window === "undefined" ||
      !window.isSecureContext ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      openFileCapture();
      return false;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setResult(null);
      setCameraError(null);
      setCameraActive(true);
      return true;
    } catch (error: unknown) {
      const errorName =
        error instanceof Error && "name" in error ? error.name : "";

      if (
        errorName === "NotAllowedError" ||
        errorName === "PermissionDeniedError"
      ) {
        setCameraError(
          translate(
            "camera_permission_denied",
            "Camera permission was denied. Allow camera access in your browser."
          )
        );
      } else if (
        errorName === "NotFoundError" ||
        errorName === "DevicesNotFoundError"
      ) {
        setCameraError(
          translate(
            "camera_unavailable",
            "Live camera is not available on this device."
          )
        );
      } else {
        setCameraError(
          translate("camera_start_failed", "Could not start the live camera.")
        );
      }
      setCameraActive(false);
      openFileCapture();
      return false;
    }
  };

  const openBestCamera = async () => {
    if (analyzing) return;
    await startLiveCamera();
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(video, 0, 0, width, height);
    stopCamera();
    await analyzeImage(canvas);
  };

  const analyzeCurrentFrame = async () => {
    if (!videoRef.current || !canvasRef.current || analysisInFlightRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, width, height);
    await analyzeImage(canvas, { preserveExistingResult: true });
  };

  const startLiveDetection = () => {
    if (!cameraActive) return;
    stopLiveDetection();
    setLiveDetectionActive(true);
    void analyzeCurrentFrame();
    liveDetectionTimerRef.current = setInterval(() => {
      void analyzeCurrentFrame();
    }, 3000);
  };

  const resetScan = () => {
    setResult(null);
    setCameraError(null);
    stopLiveDetection();
  };

  return (
    <main className="w-full flex flex-col items-center pb-24 px-4">
      <BackButton />
      <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center w-full">
        <div className="bg-[#d97706] rounded-full p-4 mb-4 shadow-sm">
          <Camera size={32} className="text-white" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          {translate("upload_crop_photo", "Disease Detection")}
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {translate("builds_buyer_trust", "Upload photo to diagnose")}
        </p>
      </div>

      <div className="w-full space-y-4 max-w-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Selected crop</p>
            <p className="mt-2 text-xl font-bold text-amber-900">{selectedCrop}</p>
            <p className="text-xs text-amber-700">Used for scan context</p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Recent scans</p>
            <p className="mt-2 text-xl font-bold text-emerald-900">{scanHistory.length}</p>
            <p className="text-xs text-emerald-700">Stored in this session</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full">
          <h2 className="font-semibold text-gray-900">Crop type</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {["Tomato", "Onion", "Potato", "Paddy", "Chili"].map((crop) => (
              <Button
                key={crop}
                size="sm"
                variant={selectedCrop === crop ? "default" : "outline"}
                onClick={() => setSelectedCrop(crop)}
              >
                {crop}
              </Button>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            Choose the crop before scanning so you can track disease results crop-wise.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
            disabled={analyzing}
          />
          <canvas ref={canvasRef} className="hidden" />

          <div
            onClick={!cameraActive && !analyzing ? () => void openBestCamera() : undefined}
            className={`w-full border-2 border-dashed rounded-2xl transition-colors ${
              analyzing ? "border-amber-400 bg-amber-50" : "border-gray-200 bg-gray-50"
            }`}
          >
            {cameraActive ? (
              <div className="p-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-56 object-cover rounded-xl bg-black"
                />
                <div className="mt-4 flex gap-2">
                  <Button
                    className="flex-1 bg-[#d97706] hover:bg-amber-700"
                    onClick={() => void capturePhoto()}
                    disabled={analyzing}
                  >
                    {translate("capture_photo", "Capture Photo")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={stopCamera}
                    disabled={analyzing}
                  >
                    {translate("stop_camera", "Stop Camera")}
                  </Button>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    className="flex-1 bg-[#15803d] hover:bg-[#166534]"
                    onClick={startLiveDetection}
                    disabled={liveDetectionActive || analyzing}
                  >
                    {translate("start_live_detection", "Start Live Detection")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={stopLiveDetection}
                    disabled={!liveDetectionActive}
                  >
                    {translate("stop_live_detection", "Stop Live Detection")}
                  </Button>
                </div>
                {liveDetectionActive && (
                  <p className="mt-3 text-sm font-medium text-green-700">
                    {translate("live_detection_active", "Live detection is running")}
                  </p>
                )}
              </div>
            ) : analyzing ? (
              <div className="h-48 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600 mb-3" />
                <span className="text-amber-700 font-bold">
                  {translate("analyzing_image", "Analyzing image with AI...")}
                </span>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center px-4">
                <Camera size={40} className="text-amber-600 mb-3" />
                <span className="text-gray-700 font-bold text-lg mb-1">
                  {translate("open_camera", "Open Camera")}
                </span>
                <span className="text-gray-400 text-sm text-center">
                  {translate("take_crop_photo", "Take a photo of the crop")}
                </span>
              </div>
            )}
          </div>

          {!cameraActive && !analyzing && (
            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1 bg-[#d97706] hover:bg-amber-700"
                onClick={openBestCamera}
              >
                {translate("start_camera", "Start Live Camera")}
              </Button>
              <Button variant="outline" className="flex-1" onClick={openFileCapture}>
                {translate("upload_photo", "Upload Photo Instead")}
              </Button>
            </div>
          )}

          {cameraError && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-100 p-3">
              <p className="text-sm text-red-700">{cameraError}</p>
            </div>
          )}

          {!analyzing && (
            <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start">
              <span className="mr-2 text-lg mt-0.5 text-blue-700">●</span>
              <div className="text-sm text-blue-800 space-y-1">
                <p>
                  {translate(
                    "disease_accuracy_note",
                    "For best accuracy, ensure the affected leaf is clearly visible and well-lit."
                  )}
                </p>
                <p className="text-xs text-blue-700">
                  {translate(
                    "local_ai_note",
                    "This runs on-device AI in your browser. The first scan can take longer while the model loads."
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full">
          <h2 className="font-semibold text-gray-900">Best scan checklist</h2>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p>1. Capture one affected leaf clearly against a plain background.</p>
            <p>2. Use natural light and avoid blurred or shadow-heavy images.</p>
            <p>3. Scan both healthy and affected leaves if symptoms are spreading.</p>
          </div>
        </div>

        {scanHistory.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 w-full">
            <h2 className="font-semibold text-gray-900">Recent scan history</h2>
            <div className="mt-3 space-y-3">
              {scanHistory.map((entry, index) => (
                <div
                  key={`${entry.crop}-${entry.label}-${index}`}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900">{entry.crop}</p>
                      <p className="text-sm text-gray-600">{entry.label}</p>
                    </div>
                    <Badge variant={entry.isHealthy ? "secondary" : "outline"}>
                      {entry.confidence}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-full animate-in fade-in zoom-in duration-300">
            <div
              className={`border-b p-5 flex items-start ${
                result.isHealthy
                  ? "bg-green-50 border-green-100"
                  : "bg-amber-50 border-amber-100"
              }`}
            >
              {result.isHealthy ? (
                <CheckCircle2
                  size={24}
                  className="text-green-600 mr-3 mt-1 flex-shrink-0"
                />
              ) : (
                <AlertTriangle
                  size={24}
                  className="text-amber-600 mr-3 mt-1 flex-shrink-0"
                />
              )}
              <div>
                <h2
                  className={`font-bold text-xl ${
                    result.isHealthy ? "text-green-900" : "text-amber-900"
                  }`}
                >
                  {translate("detection_result", "Detection Result")}
                </h2>
                <p
                  className={`text-sm mt-1 ${
                    result.isHealthy ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  {translate(result.diseaseKey, result.diseaseLabel)}
                </p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {translate("ai_confidence", "AI Confidence")}
                  </p>
                  <p className="mt-1 font-bold text-lg text-gray-900">
                    {result.confidence}%
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {translate("severity", "Severity")}
                  </p>
                  <p className="mt-1 font-bold text-lg text-gray-900">
                    {translate(result.severityKey, result.severityLabel)}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs uppercase tracking-wide text-blue-600">
                  {translate("crop_context", "Crop Context")}
                </p>
                <p className="mt-1 font-bold text-blue-900">{selectedCrop}</p>
              </div>

              <h3 className="font-bold text-gray-900 mb-2 flex items-center">
                <CheckCircle2 size={18} className="text-green-500 mr-2" />
                {translate("recommended_treatment", "Recommended Treatment")}
              </h3>
              <p className="text-gray-700 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed">
                {translate(result.treatmentKey, result.treatment)}
              </p>

              <p className="text-xs text-gray-500">
                {translate("ai_model_info", "Model")}: {getDiseaseModelId()}
              </p>

              <p className="text-xs text-gray-500">
                {translate(
                  "ai_estimate_warning",
                  "This is an on-device AI estimate. Confirm severe symptoms with an agronomist before spraying."
                )}
              </p>

              <button
                onClick={resetScan}
                className="mt-5 w-full py-3 bg-[#d97706] hover:bg-amber-700 text-white rounded-xl font-bold transition-colors"
              >
                {translate("scan_another_crop", "Scan Another Crop")}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
