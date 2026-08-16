import os
import time
import json
import logging
import mimetypes
from typing import Dict, Any, List, Optional

logger = logging.getLogger("meetingmate.transcriber")

SAMPLE_MEETING_TRANSCRIPT = [
    {
        "speaker": "Sarah Chen (Product Lead)",
        "timestamp": "00:00 - 01:15",
        "text": "Good morning team! Thanks for joining today's Q3 MeetingMate Roadmap & GenAI Integration Sync. Our main objective today is to finalize our GenAI architecture, review audio transcription accuracy, and align on our ChromaDB vector database strategy for semantic meeting retrieval."
    },
    {
        "speaker": "David Miller (Tech Lead)",
        "timestamp": "01:16 - 03:40",
        "text": "Thanks Sarah. On the engineering side, we've benchmarked audio transcription and integrated Google Gemini 2.0 Flash for structured JSON extraction. The latency for transcribing a 30-minute meeting is under 12 seconds, and Gemini is consistently generating clean structured summaries, key decisions, and python-pptx slide decks."
    },
    {
        "speaker": "Elena Rostova (AI Researcher)",
        "timestamp": "03:41 - 06:10",
        "text": "I'd like to highlight our RAG implementation. We are using ChromaDB to store chunked meeting transcripts along with cosine similarity embeddings. This allows users to query past meetings like 'What was agreed regarding database migration?' and get precise timestamps and exact speaker quotes."
    },
    {
        "speaker": "Marcus Vance (UX Designer)",
        "timestamp": "06:11 - 08:30",
        "text": "From a user experience standpoint, the slide deck generation feature is huge. Project managers used to spend 2 hours after every meeting building PowerPoint decks. Now, with python-pptx automated slide generation, they can export a presentation-ready summary deck with 1 click."
    },
    {
        "speaker": "Sarah Chen (Product Lead)",
        "timestamp": "08:31 - 11:00",
        "text": "Fantastic! Let's lock in our key action items. David will finish setting up the FastAPI backend and ChromaDB indexes by Friday. Elena will refine the GenAI rubric evaluation metrics for meeting summary accuracy. Marcus will complete the React dashboard UI. Let's aim to ship the full-stack MeetingMate capstone release by next week."
    }
]

GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]

class AudioTranscriber:
    def __init__(self):
        pass

    def get_effective_gemini_key(self, api_key: str = None) -> str:
        if api_key and api_key.strip():
            return api_key.strip()
        return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""

    def transcribe_with_gemini_free(self, file_path: str, filename: str, gemini_key: str = None) -> Optional[List[Dict[str, str]]]:
        """
        Transcribes audio using Google Gemini Multimodal Audio API (100% Free Tier, 0 C++ dependencies).
        """
        key = self.get_effective_gemini_key(gemini_key)
        if not key:
            logger.warning("No Gemini API key supplied. To transcribe custom audio, paste your free Gemini API key in the UI.")
            return None

        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=key)

            mime_type, _ = mimetypes.guess_type(file_path)
            if not mime_type:
                if filename.endswith(".webm"): mime_type = "audio/webm"
                elif filename.endswith(".wav"): mime_type = "audio/wav"
                elif filename.endswith(".mp3"): mime_type = "audio/mp3"
                elif filename.endswith(".m4a"): mime_type = "audio/m4a"
                else: mime_type = "audio/webm"

            with open(file_path, "rb") as audio_file:
                audio_bytes = audio_file.read()

            audio_part = types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)

            prompt = """
            Listen carefully to the attached voice recording and transcribe every word spoken.
            
            Return the transcription strictly as a JSON array of objects with the following keys:
            - "speaker": string (e.g. "Speaker 1" or identified speaker name)
            - "timestamp": string (e.g. "00:00 - 00:15")
            - "text": string (the exact spoken sentences)
            
            Return ONLY valid JSON array without markdown wrapping.
            """

            for model_name in GEMINI_MODELS:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=[audio_part, prompt]
                    )
                    raw_text = response.text.strip()
                    if raw_text.startswith("```json"):
                        raw_text = raw_text.split("```json")[1].split("```")[0].strip()
                    elif raw_text.startswith("```"):
                        raw_text = raw_text.split("```")[1].split("```")[0].strip()

                    parsed = json.loads(raw_text)
                    if isinstance(parsed, list) and len(parsed) > 0:
                        logger.info(f"Transcribed audio using Free Gemini model {model_name}! Segments: {len(parsed)}")
                        return parsed
                except Exception as m_err:
                    logger.warning(f"Free Gemini Model {model_name} error: {m_err}")
                    continue
        except Exception as e:
            logger.error(f"Free Gemini transcription error: {e}")

        return None

    def transcribe_file(self, file_path: str, filename: str, api_key: str = None, **kwargs) -> List[Dict[str, str]]:
        """
        100% Free Audio Transcriber via Google Gemini Multimodal Audio API.
        """
        if not file_path or not os.path.exists(file_path):
            return SAMPLE_MEETING_TRANSCRIPT

        # Text/JSON transcript upload directly
        if filename.endswith(".json") or filename.endswith(".txt"):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if filename.endswith(".json"):
                        return json.loads(content)
                    else:
                        lines = content.split("\n")
                        transcript = []
                        for idx, line in enumerate(lines):
                            if line.strip():
                                transcript.append({
                                    "speaker": f"Speaker {(idx % 2) + 1}",
                                    "timestamp": f"00:{idx*15:02d} - 00:{(idx+1)*15:02d}",
                                    "text": line.strip()
                                })
                        return transcript
            except Exception as e:
                logger.error(f"Error reading transcript text file: {e}")

        # Primary 100% Free Multimodal Audio Transcription via Gemini
        gemini_result = self.transcribe_with_gemini_free(file_path, filename=filename, gemini_key=api_key)
        if gemini_result:
            return gemini_result

        # Recorded audio fallback
        return [
            {
                "speaker": "Speaker 1 (Recorded Speech)",
                "timestamp": "00:00 - 00:30",
                "text": f"Voice recording audio received ({filename}). Enter your free Gemini API key in the top banner for instant automated speech-to-text."
            }
        ]

    def get_sample_transcript(self) -> List[Dict[str, str]]:
        return SAMPLE_MEETING_TRANSCRIPT
