# Voice-to-Text

A full-stack audio transcription app. Upload an audio file in the browser and get the transcribed text back, powered by [OpenAI Whisper](https://github.com/openai/whisper) running locally on a FastAPI backend.

## Features

- 🎤 Upload an audio file and transcribe it to text
- ⚙️ Background transcription with a polling-based progress bar
- 🧠 Local Whisper (`base`) model — no external API keys required

## Architecture

```
voice-to-text/
├── backend/          # FastAPI server + Whisper transcription
│   └── main.py
└── frontend/         # React (Vite) UI
    └── src/App.jsx
```

**Data flow**

1. The user selects an audio file and clicks **Transcribe**.
2. The frontend sends `multipart/form-data` to `POST /transcribe`.
3. The backend saves the file to a temp path, creates a task (`status = PENDING`), and schedules transcription as a background task.
4. The frontend polls `GET /status/{task_id}` every 2s for `progress`, `status`, and `result`.
5. On `COMPLETED`, the transcript is displayed and the temp audio file is deleted server-side.

## Prerequisites

- **Python**
- **Node.js**

## Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install fastapi uvicorn python-multipart openai-whisper
```

`openai-whisper` pulls in PyTorch and downloads the model weights on first run, so the initial start may take a while.

Run the server:

```bash
uvicorn main:app --reload --port 8000
```

The API is then available at `http://127.0.0.1:8000`.

### API endpoints

| Method | Path                | Description                                            |
| ------ | ------------------- | ------------------------------------------------------ |
| `POST` | `/transcribe`       | Upload an audio file; returns `{ "task_id": "<uuid>" }` |
| `GET`  | `/status/{task_id}` | Returns `{ status, progress, result, error }`          |

`status` is one of `PENDING`, `IN_PROGRESS`, `COMPLETED`, or `FAILED`.

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:5173`). The app expects the backend to be running at `http://127.0.0.1:8000`.

Other scripts:

```bash
npm run build     # production build
npm run preview   # preview the production build
```
