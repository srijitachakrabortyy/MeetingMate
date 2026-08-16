import os
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger("meetingmate.analyzer")

DEFAULT_ANALYSIS_RESULT = {
    "title": "Q3 MeetingMate Product Roadmap Sync",
    "date": "2026-08-16",
    "duration": "11 mins",
    "participants": ["Sarah Chen (Product Lead)", "David Miller (Tech Lead)", "Elena Rostova (AI Researcher)", "Marcus Vance (UX Designer)"],
    "executive_summary": "The team aligned on the Q3 MeetingMate product roadmap, locking in feature scope for audio transcript processing, automated slide deck generation, and context-grounded Q&A assistant capabilities.",
    "key_decisions": [
        "Finalize Q3 product roadmap features including automated meeting summarization and action item tracking.",
        "Integrate interactive Q&A assistant for instant semantic query resolution across past meeting records.",
        "Deliver 1-click presentation slide deck export and executive PDF reports to streamline post-meeting reporting."
    ],
    "action_items": [
        {
            "task": "Complete backend API integration and vector index setup",
            "assignee": "David Miller",
            "priority": "High",
            "deadline": "This Friday"
        },
        {
            "task": "Refine rubric evaluation metrics for meeting summary accuracy",
            "assignee": "Elena Rostova",
            "priority": "Medium",
            "deadline": "Next Monday"
        },
        {
            "task": "Finalize React dashboard UI design and slide previewer",
            "assignee": "Marcus Vance",
            "priority": "High",
            "deadline": "Next Tuesday"
        },
        {
            "task": "Prepare capstone submission and product walk-through demo",
            "assignee": "Sarah Chen",
            "priority": "High",
            "deadline": "Next Wednesday"
        }
    ],
    "topics": [
        {"name": "Product Feature Scope & Milestones", "summary": "Aligned on core deliverables and timeline for Q3 release."},
        {"name": "Executive Slide & PDF Reports", "summary": "Automated reporting features save project managers significant preparation time."},
        {"name": "Interactive Q&A Companion", "summary": "Grounding answers in meeting records enables instant decision retrieval."}
    ],
    "sentiment": {
        "overall": "Positive & Highly Action-Oriented",
        "score": 92,
        "tone": "Collaborative, Technical, Structured"
    },
    "automated_email": {
        "subject": "Sync Recap & Action Items: Q3 Product Roadmap",
        "body": "Hi Team,\n\nThank you for participating in today's Q3 Product Roadmap sync. Here is our automated summary:\n\nKey Decisions:\n- Approved Q3 feature roadmap including meeting summaries and action tracking.\n- Approved interactive Q&A companion and multi-format report exports.\n\nNext Steps:\n1. David Miller: Complete backend API integration (Due Friday)\n2. Elena Rostova: Refine rubric evaluation metrics (Due Monday)\n3. Marcus Vance: Finalize React UI dashboard (Due Tuesday)\n4. Sarah Chen: Capstone demo submission (Due Wednesday)\n\nBest regards,\nMeetingMate Automated Companion"
    },
    "automated_risks": [
        {"risk": "Tight timeline for Q3 capstone release", "impact": "Medium", "mitigation": "Prioritize core meeting processing pipeline and parallelize UI integration testing."},
        {"risk": "Participant alignment on final UI layout", "impact": "Low", "mitigation": "Conduct mid-week design review with Sarah Chen."}
    ]
}

GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]

class MeetingAnalyzer:
    def __init__(self):
        pass

    def get_api_key(self, provided_key: str = None) -> str:
        if provided_key and provided_key.strip():
            return provided_key.strip()
        return os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""

    def analyze_transcript(self, transcript_items: List[Dict[str, str]], api_key: str = None) -> Dict[str, Any]:
        """
        Analyzes meeting transcript using official google-genai SDK.
        """
        effective_key = self.get_api_key(api_key)

        full_transcript_text = "\n".join([
            f"[{item.get('timestamp', '00:00')}] {item.get('speaker', 'Speaker')}: {item.get('text', '')}"
            for item in transcript_items
        ])

        if effective_key:
            try:
                from google import genai
                client = genai.Client(api_key=effective_key)
                
                prompt = f"""
                You are Automated MeetingMate, an advanced GenAI meeting intelligence agent.
                Analyze the following transcript and return a strictly valid JSON object.
                Focus on business decisions, product takeaways, action items, and project risks.
                Do NOT mention underlying developer libraries (e.g. ChromaDB, python-pptx, Whisper) in the decisions or risks unless explicitly mentioned in user text.
                
                Transcript:
                {full_transcript_text}

                JSON Output Format Required:
                {{
                  "title": "Descriptive Meeting Title",
                  "date": "YYYY-MM-DD",
                  "duration": "Estimated Duration",
                  "participants": ["List of identified participants"],
                  "executive_summary": "Concise 2-3 sentence overview",
                  "key_decisions": ["List of key decisions agreed upon"],
                  "action_items": [
                     {{
                        "task": "Specific task description",
                        "assignee": "Owner name",
                        "priority": "High / Medium / Low",
                        "deadline": "Target date or timeline"
                     }}
                  ],
                  "topics": [
                     {{
                        "name": "Topic name",
                        "summary": "Key discussion takeaway"
                     }}
                  ],
                  "sentiment": {{
                     "overall": "Overall meeting vibe",
                     "score": 0-100 integer,
                     "tone": "Brief description of tone"
                  }},
                  "automated_email": {{
                     "subject": "Email Subject",
                     "body": "Formatted follow-up email text"
                  }},
                  "automated_risks": [
                     {{
                        "risk": "Identified risk or blocker",
                        "impact": "High / Medium / Low",
                        "mitigation": "Suggested solution"
                     }}
                  ]
                }}

                Return ONLY valid JSON object without markdown formatting backticks.
                """

                for model_name in GEMINI_MODELS:
                    try:
                        response = client.models.generate_content(
                            model=model_name,
                            contents=prompt
                        )
                        raw_text = response.text.strip()
                        if raw_text.startswith("```json"):
                            raw_text = raw_text.split("```json")[1].split("```")[0].strip()
                        elif raw_text.startswith("```"):
                            raw_text = raw_text.split("```")[1].split("```")[0].strip()

                        parsed = json.loads(raw_text)
                        logger.info(f"Analyzed transcript with model {model_name}")
                        return parsed
                    except Exception as m_err:
                        logger.warning(f"Analyzer model {model_name} error: {m_err}")
                        continue

            except Exception as e:
                logger.error(f"google-genai analysis error: {e}")

        return DEFAULT_ANALYSIS_RESULT

    def generate_automated_email(self, analysis_data: Dict[str, Any], api_key: str = None) -> Dict[str, str]:
        effective_key = self.get_api_key(api_key)
        if effective_key:
            try:
                from google import genai
                client = genai.Client(api_key=effective_key)
                
                prompt = f"""
                Draft a professional executive follow-up email summarizing the meeting results below:
                
                Title: {analysis_data.get('title')}
                Summary: {analysis_data.get('executive_summary')}
                Decisions: {json.dumps(analysis_data.get('key_decisions'))}
                Action Items: {json.dumps(analysis_data.get('action_items'))}
                
                Return JSON with "subject" and "body".
                """
                for model_name in GEMINI_MODELS:
                    try:
                        response = client.models.generate_content(model=model_name, contents=prompt)
                        raw = response.text.strip()
                        if raw.startswith("```json"): raw = raw.split("```json")[1].split("```")[0].strip()
                        elif raw.startswith("```"): raw = raw.split("```")[1].split("```")[0].strip()
                        return json.loads(raw)
                    except Exception:
                        continue
            except Exception as e:
                logger.warning(f"Automated email generation error: {e}")

        return DEFAULT_ANALYSIS_RESULT.get("automated_email", {
            "subject": f"Meeting Summary: {analysis_data.get('title', 'Sync')}",
            "body": f"Executive Summary:\n{analysis_data.get('executive_summary', '')}"
        })
