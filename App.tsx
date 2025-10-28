
import React, { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent } from 'react';
import { Gesture, GESTURE_MAP } from './types';
import { recognizeGesture } from './services/geminiService';
import { CameraIcon, PlayIcon, StopIcon, ActivityIcon, HandIcon, UploadIcon } from './components/Icons';
import { BulbOnIcon, BulbOffIcon } from './components/BulbIcons';

type InputMode = 'camera' | 'image';

const App: React.FC = () => {
  const [inputMode, setInputMode] = useState<InputMode>('camera');
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPerformingAction, setIsPerformingAction] = useState<boolean>(false);
  const [detectedGesture, setDetectedGesture] = useState<Gesture | null>(null);
  const [commandLog, setCommandLog] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);
  const [cooldownTime, setCooldownTime] = useState<number>(0);
  const [isBulbOn, setIsBulbOn] = useState<boolean>(false);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cooldownIntervalRef = useRef<number | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOn(false);
  }, []);

  const handleGestureAction = useCallback(async (gesture: Gesture) => {
    setIsPerformingAction(true);
    const command = GESTURE_MAP[gesture];
    setCommandLog(prev => [`[${new Date().toLocaleTimeString()}] Action: ${command}`, ...prev.slice(0, 9)]);

    let actionTaken = false;
    switch (gesture) {
        case 'ONE_FINGER':
            setIsBulbOn(true);
            actionTaken = true;
            break;
        case 'TWO_FINGERS':
            setIsBulbOn(false);
            actionTaken = true;
            break;
        case 'THREE_FINGERS':
            setIsBulbOn(prev => !prev);
            actionTaken = true;
            break;
        default:
            setCommandLog(prev => [`[${new Date().toLocaleTimeString()}] No action for ${gesture.replace('_', ' ')}`, ...prev.slice(0, 9)]);
    }

    if (actionTaken) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setCommandLog(prev => [`[${new Date().toLocaleTimeString()}] Action finished.`, ...prev.slice(0, 9)]);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setDetectedGesture(null);
    setIsPerformingAction(false);
  }, []);

  const performRecognition = useCallback(async (base64Data: string) => {
    setIsLoading(true);
    setError(null);
    setDetectedGesture(null);

    try {
      const gesture = await recognizeGesture(base64Data);
      
      if (gesture !== 'UNKNOWN') {
        setDetectedGesture(gesture);
        const command = GESTURE_MAP[gesture];
        setCommandLog(prev => [`[${new Date().toLocaleTimeString()}] Detected: ${command}`, ...prev.slice(0, 9)]);
        handleGestureAction(gesture);
      } else {
        setDetectedGesture('UNKNOWN');
        setCommandLog(prev => [`[${new Date().toLocaleTimeString()}] No specific gesture recognized.`, ...prev.slice(0, 9)]);
      }
    } catch (err: any) {
      console.error("Caught API error:", err);
      let errorMessage = "An unknown API error occurred.";
      const errorString = JSON.stringify(err);

      if (errorString.includes("429") || errorString.includes("RESOURCE_EXHAUSTED")) {
        errorMessage = "API Quota Exhausted. You have likely used all free requests for your API key. This is an account-level limit. To fix this, please check your Google Cloud project's billing status and API quotas. Further use may require enabling billing. The app has a 3-minute cooldown to prevent further errors.";
      } else if (errorString.includes("500") || errorString.includes("Rpc failed")) {
        errorMessage = "A server error occurred with the API. Please try again later.";
      }
      
      setError(errorMessage);
      if (inputMode === 'camera') {
        stopCamera();
      }
    } finally {
      setIsLoading(false);
      // Start cooldown
      setIsOnCooldown(true);
      setCooldownTime(5); // A shorter cooldown is fine now
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = window.setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            clearInterval(cooldownIntervalRef.current!);
            setIsOnCooldown(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [handleGestureAction, stopCamera, inputMode]);

  const handleRecognizeCamera = useCallback(() => {
    if (!isCameraOn || isLoading || !videoRef.current || !canvasRef.current || isPerformingAction || isOnCooldown) {
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    if (context) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const base64Data = imageDataUrl.split(',')[1];
      performRecognition(base64Data);
    }
  }, [isCameraOn, isLoading, isPerformingAction, performRecognition, isOnCooldown]);

  const handleAnalyzeImage = useCallback(() => {
    if (!uploadedImage || isLoading || isPerformingAction || isOnCooldown) {
      return;
    }
    const base64Data = uploadedImage.split(',')[1];
    performRecognition(base64Data);
  }, [uploadedImage, isLoading, isPerformingAction, performRecognition, isOnCooldown]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play();
            setIsCameraOn(true);
          }
        };
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check permissions and try again.");
    }
  }, []);

  const toggleCamera = useCallback(() => {
    if (isCameraOn) {
      stopCamera();
    } else {
      startCamera();
    }
  }, [isCameraOn, startCamera, stopCamera]);

  useEffect(() => {
    if (inputMode === 'image') {
      stopCamera();
    }
  }, [inputMode, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, [stopCamera]);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
            setError(null);
        };
        reader.readAsDataURL(file);
    } else {
        setError("Please select a valid image file.");
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLoading || isPerformingAction) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };
  
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileSelect(file);
  };

  const ModeToggle = () => (
    <div className="flex justify-center mb-6">
      <div className="bg-gray-800 p-1 rounded-full flex items-center space-x-1">
        <button 
          onClick={() => setInputMode('camera')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${inputMode === 'camera' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
        >
          Live Camera
        </button>
        <button 
          onClick={() => setInputMode('image')}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${inputMode === 'image' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
        >
          Upload Image
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gray-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <main className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
            Smartthings & Google Gesture Commander
          </h1>
          <p className="text-gray-400 mt-2">Use your camera or an image to trigger actions with a hand gesture.</p>
        </header>
        
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <ModeToggle />
            <div className="relative aspect-video bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-gray-700">
              {inputMode === 'camera' ? (
                <>
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover transform scale-x-[-1]" 
                    playsInline 
                    muted
                  />
                  {!isCameraOn && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center">
                      <CameraIcon className="w-24 h-24 text-gray-500 mb-4"/>
                      <p className="text-gray-400">Camera is off</p>
                    </div>
                  )}
                  <div className={`absolute top-4 left-4 h-4 w-4 rounded-full transition-colors ${isCameraOn ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </>
              ) : (
                <>
                    {uploadedImage ? (
                        <>
                            <img src={uploadedImage} alt="Uploaded gesture" className="w-full h-full object-contain" />
                            <button onClick={() => setUploadedImage(null)} className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-2 hover:bg-black/80 transition-colors z-10">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            </button>
                        </>
                    ) : (
                        <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current?.click()} className="w-full h-full flex flex-col justify-center items-center border-4 border-dashed border-gray-600 hover:border-blue-500 transition-colors cursor-pointer">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            <UploadIcon className="w-16 h-16 text-gray-500 mb-4" />
                            <p className="text-gray-400 font-semibold">Drag & Drop Image</p>
                            <p className="text-gray-500 text-sm">or click to browse</p>
                        </div>
                    )}
                </>
              )}
              {isPerformingAction ? (
                <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center z-20">
                    <ActivityIcon className="w-16 h-16 text-teal-400 animate-pulse"/>
                    <p className="text-gray-300 mt-4 text-xl font-semibold">Performing Action...</p>
                </div>
               ) : isLoading && (
                <div className="absolute inset-0 bg-black/50 flex justify-center items-center z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400"></div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center gap-4">
              {inputMode === 'camera' ? (
                <>
                  <button 
                    onClick={toggleCamera}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 hover:shadow-gray-500/50 transform transition-all duration-300"
                  >
                    {isCameraOn ? <StopIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                    <span>{isCameraOn ? 'Stop Camera' : 'Start Camera'}</span>
                  </button>
                  <button 
                    onClick={handleRecognizeCamera}
                    disabled={!isCameraOn || isLoading || isPerformingAction || isOnCooldown}
                    className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 hover:shadow-blue-500/50 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <HandIcon className="w-6 h-6"/>
                    <span>{isOnCooldown ? `Wait (${cooldownTime}s)` : 'Recognize Gesture'}</span>
                  </button>
                </>
              ) : (
                <button 
                  onClick={handleAnalyzeImage}
                  disabled={!uploadedImage || isLoading || isPerformingAction || isOnCooldown}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold text-lg rounded-full shadow-lg hover:scale-105 hover:shadow-blue-500/50 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <HandIcon className="w-6 h-6"/>
                  <span>{isOnCooldown ? `Wait (${cooldownTime}s)` : 'Analyze Image'}</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-300 mb-4 flex items-center gap-3">
                    <ActivityIcon className="w-7 h-7 text-blue-400"/>
                    Live Status
                </h2>
                <div className="flex flex-col justify-center items-center bg-gray-900/70 rounded-lg p-6 min-h-[280px]">
                    <div className="flex-grow flex flex-col justify-center items-center">
                        {isBulbOn ? <BulbOnIcon className="w-24 h-24"/> : <BulbOffIcon className="w-24 h-24 text-gray-600"/>}
                        <p className={`mt-2 text-2xl font-bold transition-colors ${isBulbOn ? 'text-yellow-300' : 'text-gray-500'}`}>{isBulbOn ? 'ON' : 'OFF'}</p>
                    </div>
                    <div className="w-full pt-4 border-t border-gray-700 text-center">
                        <p className="text-gray-400 text-sm mb-1">Last Detected Gesture</p>
                        <p className="text-2xl font-bold text-teal-300">{detectedGesture ? detectedGesture.replace('_', ' ') : '---'}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-300 mb-4">Command Log</h2>
              <div className="h-64 bg-gray-900/70 rounded-lg p-4 space-y-2 overflow-y-auto">
                {commandLog.length > 0 ? (
                  commandLog.map((log, index) => (
                    <p key={index} className="text-sm text-gray-300 font-mono animate-fade-in">{log}</p>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center pt-24">No commands executed yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
       <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default App;