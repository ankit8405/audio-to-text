from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import whisper
import os
import uuid
import asyncio

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model (can change to "tiny", "small", "medium", "large")
model = whisper.load_model("base")

# In-memory task store
tasks = {}

async def transcribe_file(task_id: str, file_path: str):
    try:
        tasks[task_id]["status"] = "IN_PROGRESS"
        tasks[task_id]["progress"] = 10

        # Fake progress updates while Whisper works
        for i in range(20, 90, 10):
            await asyncio.sleep(1)  # simulate step updates
            tasks[task_id]["progress"] = i

        # Run Whisper transcription
        result = model.transcribe(file_path)

        # Save transcript
        tasks[task_id]["result"] = result["text"]
        tasks[task_id]["status"] = "COMPLETED"
        tasks[task_id]["progress"] = 100

    except Exception as e:
        tasks[task_id]["status"] = "FAILED"
        tasks[task_id]["error"] = str(e)
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


@app.post("/transcribe")
async def transcribe(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    task_id = str(uuid.uuid4())
    file_path = f"temp_{task_id}_{file.filename}"

    with open(file_path, "wb") as f:
        f.write(await file.read())

    tasks[task_id] = {
        "status": "PENDING",
        "progress": 0,
        "result": None,
        "error": None,
    }

    background_tasks.add_task(transcribe_file, task_id, file_path)

    return {"task_id": task_id}


@app.get("/status/{task_id}")
async def get_status(task_id: str):
    if task_id not in tasks:
        return {"error": "Invalid task ID"}

    return tasks[task_id]
