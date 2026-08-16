import os
import uuid
import logging
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.transcriber import AudioTranscriber
from services.analyzer import MeetingAnalyzer
from services.ppt_generator import PPTGenerator
from services.pdf_generator import PDFGenerator
from services.vector_store import VectorStoreService
from services.evaluator import GenAIEvaluator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("meetingmate.main")

app = FastAPI(
    title="MeetingMate Automated GenAI API",
    description="Automated Gemini Backend & Vector Store Services",
    version="1.3.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
transcriber = AudioTranscriber()
analyzer = MeetingAnalyzer()
ppt_engine = PPTGenerator()
pdf_engine = PDFGenerator()
vector_store = VectorStoreService()
evaluator = GenAIEvaluator()

# Session Cache
MEETING_STORE: Dict[str, Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    query: str
    meeting_id: Optional[str] = None
    api_key: Optional[str] = None

class EvaluateRequest(BaseModel):
    meeting_id: Optional[str] = None
    api_key: Optional[str] = None

class SlideRequest(BaseModel):
    analysis_data: Dict[str, Any]

class AutomatedEmailRequest(BaseModel):
    analysis_data: Dict[str, Any]
    api_key: Optional[str] = None

@app.get("/")
def root():
    return {"message": "MeetingMate Automated Gemini Backend Service Running", "status": "online"}

@app.get("/api/health")
def health():
    return {"status": "healthy", "service": "MeetingMate Backend", "genai": "Automated Gemini Active"}

@app.get("/api/sample")
def get_sample():
    """
    Returns pre-computed sample meeting data and indexes it in ChromaDB.
    """
    sample_transcript = transcriber.get_sample_transcript()
    sample_analysis = analyzer.analyze_transcript(sample_transcript)
    sample_eval = evaluator.evaluate_meeting_output("", sample_analysis)
    
    meeting_id = "sample_meeting_q3_sync"
    MEETING_STORE[meeting_id] = {
        "meeting_id": meeting_id,
        "transcript": sample_transcript,
        "analysis": sample_analysis,
        "evaluation": sample_eval
    }
    
    # Index in ChromaDB
    vector_store.index_transcript(
        meeting_id=meeting_id,
        title=sample_analysis.get("title", "Q3 Sync"),
        transcript_items=sample_transcript,
        date=sample_analysis.get("date", "2026-08-16")
    )

    return {
        "meeting_id": meeting_id,
        "transcript": sample_transcript,
        "analysis": sample_analysis,
        "evaluation": sample_eval
    }

@app.post("/api/process")
async def process_audio(
    file: Optional[UploadFile] = File(None),
    use_sample: Optional[str] = Form(None),
    api_key: Optional[str] = Form(None),
    hf_token: Optional[str] = Form(None)
):
    """
    Processes audio upload or sample meeting audio via Hugging Face Whisper & Gemini pipeline.
    """
    try:
        meeting_id = f"meeting_{uuid.uuid4().hex[:8]}"
        is_sample_requested = (str(use_sample).lower() in ["true", "1"]) if use_sample else False
        
        if is_sample_requested or file is None:
            transcript = transcriber.get_sample_transcript()
            filename = "sample_audio.mp3"
        else:
            temp_dir = "/tmp/temp_uploads" if os.environ.get("VERCEL") else "./temp_uploads"
            os.makedirs(temp_dir, exist_ok=True)
            temp_path = os.path.join(temp_dir, file.filename)
            
            with open(temp_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
                
            transcript = transcriber.transcribe_file(
                file_path=temp_path,
                filename=file.filename,
                api_key=api_key,
                hf_token=hf_token
            )
            filename = file.filename

        analysis = analyzer.analyze_transcript(transcript, api_key=api_key)
        full_text = "\n".join([f"{t.get('speaker')}: {t.get('text')}" for t in transcript])
        evaluation = evaluator.evaluate_meeting_output(full_text, analysis, api_key=api_key)

        MEETING_STORE[meeting_id] = {
            "meeting_id": meeting_id,
            "transcript": transcript,
            "analysis": analysis,
            "evaluation": evaluation,
            "filename": filename
        }

        vector_store.index_transcript(
            meeting_id=meeting_id,
            title=analysis.get("title", filename),
            transcript_items=transcript,
            date=analysis.get("date", "2026-08-16")
        )

        return {
            "meeting_id": meeting_id,
            "transcript": transcript,
            "analysis": analysis,
            "evaluation": evaluation
        }
    except Exception as e:
        logger.error(f"Processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/automated-email")
def generate_automated_email(req: AutomatedEmailRequest):
    """
    Generates an automated follow-up email draft using Gemini.
    """
    try:
        email_data = analyzer.generate_automated_email(req.analysis_data, api_key=req.api_key)
        return email_data
    except Exception as e:
        logger.error(f"Automated email error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-slides")
def generate_slides(req: SlideRequest):
    try:
        ppt_bytes = ppt_engine.create_presentation(req.analysis_data)
        filename = f"MeetingMate_Summary_{req.analysis_data.get('date', '2026')}.pptx"
        
        return Response(
            content=ppt_bytes,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        logger.error(f"Slide generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-pdf")
def generate_pdf(req: SlideRequest):
    try:
        pdf_bytes = pdf_engine.create_pdf_report(req.analysis_data)
        filename = f"MeetingMate_Summary_{req.analysis_data.get('date', '2026')}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export-pdf/{meeting_id}")
def export_pdf_report(meeting_id: str):
    meeting_data = MEETING_STORE.get(meeting_id)
    if not meeting_data:
        sample_transcript = transcriber.get_sample_transcript()
        sample_analysis = analyzer.analyze_transcript(sample_transcript)
        meeting_data = {"analysis": sample_analysis, "transcript": sample_transcript}

    analysis = meeting_data.get("analysis", {})
    transcript = meeting_data.get("transcript", [])
    
    pdf_bytes = pdf_engine.create_pdf_report(analysis, transcript)
    filename = f"MeetingMate_Report_{meeting_id}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@app.post("/api/chat")
def rag_chat(req: ChatRequest):
    try:
        result = vector_store.answer_query_with_rag(
            query=req.query,
            meeting_id=req.meeting_id,
            api_key=req.api_key
        )
        return result
    except Exception as e:
        logger.error(f"RAG chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/vector/stats")
def get_vector_stats():
    return vector_store.get_collection_stats()

@app.get("/api/vector/meetings")
def get_vector_meetings():
    return vector_store.get_indexed_meetings()

@app.delete("/api/vector/meetings/{meeting_id}")
def delete_vector_meeting(meeting_id: str):
    success = vector_store.delete_meeting(meeting_id)
    if meeting_id in MEETING_STORE:
        del MEETING_STORE[meeting_id]
    return {"meeting_id": meeting_id, "deleted": success}

@app.get("/api/export-report/{meeting_id}")
def export_markdown_report(meeting_id: str):
    meeting_data = MEETING_STORE.get(meeting_id)
    if not meeting_data:
        sample_transcript = transcriber.get_sample_transcript()
        sample_analysis = analyzer.analyze_transcript(sample_transcript)
        meeting_data = {"analysis": sample_analysis, "transcript": sample_transcript}

    analysis = meeting_data.get("analysis", {})
    transcript = meeting_data.get("transcript", [])

    md_lines = [
        f"# {analysis.get('title', 'Meeting Summary Report')}",
        f"**Date**: {analysis.get('date', '2026-08-16')} | **Duration**: {analysis.get('duration', 'N/A')}",
        f"**Participants**: {', '.join(analysis.get('participants', []))}",
        "",
        "## Executive Summary",
        analysis.get("executive_summary", ""),
        "",
        "## Key Decisions",
    ]

    for dec in analysis.get("key_decisions", []):
        md_lines.append(f"- {dec}")

    md_lines.extend(["", "## Action Items Matrix", "| Task | Assignee | Priority | Deadline |", "| --- | --- | --- | --- |"])
    for item in analysis.get("action_items", []):
        md_lines.append(f"| {item.get('task')} | {item.get('assignee')} | {item.get('priority')} | {item.get('deadline')} |")

    md_lines.extend(["", "## Timestamped Transcript"])
    for t in transcript:
        md_lines.append(f"- **[{t.get('timestamp')}] {t.get('speaker')}**: {t.get('text')}")

    md_content = "\n".join(md_lines)
    filename = f"MeetingMate_Report_{meeting_id}.md"

    return Response(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

# Mount compiled React frontend static files for local/standalone execution
if not os.environ.get("VERCEL") and not os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    from fastapi.staticfiles import StaticFiles
    dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
    if os.path.exists(dist_path):
        app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
