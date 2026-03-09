import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [transcript, setTranscript] = useState("");
  const [taskId, setTaskId] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file);

    // Step 1: Upload file to backend
    const res = await fetch("http://127.0.0.1:8000/transcribe", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setTaskId(data.task_id);
    setStatus("Processing...");
    setProgress(0);

    // Step 2: Poll backend for progress
    const interval = setInterval(async () => {
      const statusRes = await fetch(
        `http://127.0.0.1:8000/status/${data.task_id}`
      );
      const statusData = await statusRes.json();

      setProgress(statusData.progress || 0);
      setStatus(statusData.status);

      if (statusData.status === "COMPLETED") {
        setTranscript(statusData.result);
        clearInterval(interval);
      }

      if (statusData.status === "FAILED") {
        setStatus("❌ Failed: " + statusData.error);
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">🎤 Audio to Text</h1>

      <div className="flex space-x-4 mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="text-white"
        />
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-black text-white rounded-lg shadow-md hover:bg-gray-800"
        >
          Transcribe
        </button>
      </div>

      {status && (
        <div className="w-full max-w-md">
          <p className="mb-2">{status}</p>
          <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
            <div
              className="bg-green-500 h-4 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {transcript && (
        <div className="bg-gray-800 p-4 rounded-lg max-w-2xl mt-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-2">📄 Transcript:</h2>
          <p className="whitespace-pre-wrap">{transcript}</p>
        </div>
      )}
    </div>
  );
}
