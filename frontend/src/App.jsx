import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoMdPlay,IoIosPause  } from "react-icons/io";
import axios from "./api/axiosConfig";
import * as faceapi from "face-api.js";

export default function App() {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [mood, setMood] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Start camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();
  }, []);

  // Load models
  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");
      setLoading(false);
    }
    loadModels();
  }, []);

  const detectMood = async () => {
    if (!videoRef.current) return;

    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections && detections.expressions) {
      const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
      const topMood = sorted[0][0];
      setMood(topMood);
      const { data } = await axios.get(`/songs?mood=${topMood}`);
      setTracks(data.songs || []);
    } else {
      setMood("No face detected");
      setTracks([]);
    }
  };

const handlePlayPause = (track) => {
  if (!audioRef.current) return;

  if (currentTrack === track.audio) {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  } else {
    audioRef.current.src = track.audio;
    audioRef.current.currentTime = 0; // start from beginning
    setProgress(0); // reset progress bar
    audioRef.current.play();
    setCurrentTrack(track.audio);
    setIsPlaying(true);
  }
};


  // Update progress as song plays
  useEffect(() => {
    if (!audioRef.current) return;

    const updateProgress = () => {
      const percentage = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(percentage || 0);
    };

    audioRef.current.addEventListener("timeupdate", updateProgress);
    return () => {
      audioRef.current.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  const handleSeek = (e) => {
    if (!audioRef.current) return;
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    const newTime = (newProgress / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex items-center justify-center px-4 py-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-4xl flex flex-col md:flex-row md:gap-8"
      >
        {/* Left: Camera */}
        <div className="flex-1 flex flex-col items-center text-center md:items-start md:text-left">
          <h1 className="text-3xl font-bold mb-4 text-blue-400">Live Mood Detection</h1>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-w-xs aspect-square object-cover rounded-lg shadow-lg border border-white/30"
          ></video>
          <p className="mt-4 text-sm text-gray-300">
            Click the button to detect your current mood using AI.
          </p>
          <motion.button
            onClick={detectMood}
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px #3b82f6" }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className={`mt-5 px-6 py-2 rounded-lg font-semibold text-white transition ${loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Loading AI..." : "Detect Mood"}
          </motion.button>
        </div>

        {/* Right: Recommended Tracks */}
        <div className="flex-1 mt-6 md:mt-0">
          <h2 className="text-lg font-semibold mb-4 text-blue-400">Recommended Tracks</h2>
          <AnimatePresence>
            {mood && mood !== "No face detected" ? (
              <motion.div
                key={mood}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="mb-4 text-sm text-gray-300">
                  Detected Mood: <span className="font-semibold text-blue-400">{mood}</span>
                </p>
                <ul className="space-y-4">
                  {tracks.map((track, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg p-4 flex items-center justify-between gap-4 shadow-md hover:scale-[1.02] transition-all duration-300"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{track.title}</p>
                        <p className="text-sm text-gray-400">{track.artist}</p>
                        {currentTrack === track.audio && (
                          <motion.input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleSeek}
                            className="w-full mt-2 accent-blue-500 cursor-pointer h-[4px]"
                            animate={{ backgroundSize: `${progress}% 100%` }}
                            style={{
                              background: `linear-gradient(to right, #3b82f6 ${progress}%, #555 ${progress}%)`
                            }}
                          />
                        )}
                      </div>

                      <audio
                        ref={audioRef}
                        className="hidden"
                        onEnded={() => setIsPlaying(false)}
                      />

                      <motion.button
                        onClick={() => handlePlayPause(track)}
                        whileTap={{ scale: 0.9 }}
                        animate={currentTrack === track.audio && isPlaying ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: currentTrack === track.audio && isPlaying ? Infinity : 0, duration: 0.6 }}
                        className="text-gray-300 hover:text-blue-400 text-xl cursor-pointer"
                      >
                        {currentTrack === track.audio && isPlaying ? <IoIosPause /> : <IoMdPlay />}
                      </motion.button>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : mood === "No face detected" ? (
              <p className="text-sm text-red-400">No face detected. Try again.</p>
            ) : (
              <p className="text-sm text-gray-500">No mood detected yet.</p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
