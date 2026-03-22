import os
import sys
import tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

# Add the parent directory to Python Path to import from EDA-Pipeline
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'EDA-Pipeline')))
from eda.eda_pipeline import run_eda

app = FastAPI(
    title="Insyte API",
    description="CSV upload and EDA pipeline for Insyte.",
)

# Local dev + LAN/mobile (Vite on another host/port): permissive CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """So opening http://127.0.0.1:<port>/ in a browser does not look like the server is down."""
    return {
        "service": "Insyte API",
        "status": "running",
        "docs": "/docs",
        "upload": "POST /upload (multipart file field: file)",
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    # Save the file temporarily so pandas and the pipeline can read it
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name

    try:
        # Run the full EDA pipeline on the uploaded file
        eda_report = run_eda(temp_file_path)
    finally:
        # Clean up the temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

    return eda_report