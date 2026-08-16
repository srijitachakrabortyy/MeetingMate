# 🎙️ MeetingMate - A GenAI Powered Smart Meeting Companion

> **Capstone Project for the Generative AI Intensive Course**

MeetingMate transforms chaotic, unstructured meetings into clear, actionable executive insights automatically. Upload meeting audio or record live speech via your microphone to instantly generate structured summaries, filterable action items, PowerPoint slide decks (`.pptx`), executive PDF reports, follow-up emails, and ChromaDB vector-grounded Q&A.

---

## 🎯 Problem & Solution

### ❌ The Problem
We've all experienced long, unstructured meetings where key decisions get lost, action items lack clear owners, and project managers spend 2+ hours manually summarizing notes and creating slide presentations after every call.

### ✅ The Solution: MeetingMate
Just speak into your microphone or upload your meeting audio. **MeetingMate** takes care of the rest:
- **Speech-to-Text**: Multimodal audio transcription powered by Google Gemini 2.5/2.0 Flash.
- **Structured Analysis**: Executive Summary, Key Decisions, Action Item Matrix, and Sentiment Analysis.
- **Automated Workflows**: 1-Click Automated Follow-up Email Drafts & Automated Risk Audits.
- **RAG Chatbot**: ChromaDB vector search for instant Q&A grounded in transcript timestamps.
- **Slide Deck Generation**: Presentation-ready 16:9 PowerPoint decks (`.pptx`) generated automatically via `python-pptx`.
- **Multi-Format Exports**: 1-Click PDF Executive Reports (`reportlab`) & Markdown files.
- **GenAI Quality Rubrics**: Automated LLM-as-a-Judge rubric evaluator for output quality verification.

---

## 🛠️ Architecture & Technology Stack

### Backend Stack
- **Framework**: FastAPI (Python 3.12) + Uvicorn ASGI Server
- **GenAI SDK**: Official `google-genai` SDK (`gemini-2.5-flash`, `gemini-2.0-flash`)
- **Vector Store**: ChromaDB `PersistentClient` with cosine similarity search
- **Presentation Engine**: `python-pptx` (Widescreen 16:9 layout generator)
- **PDF Engine**: `reportlab` (Custom executive document layout engine)
- **Data Validation**: Pydantic v2

### Frontend Stack
- **Framework**: React 18 + Vite
- **Styling**: Modern Vanilla CSS Glassmorphism + Dynamic Micro-animations
- **Icons**: Lucide React
- **Visuals**: Canvas Confetti for celebratory downloads
- **Audio Capture**: Browser `MediaRecorder` API with timer and visualizer

---

## 📂 Project Structure

```
MeetingMate/
├── backend/
│   ├── main.py                     # FastAPI application & REST endpoints
│   ├── chroma_db/                  # ChromaDB persistent vector database
│   ├── services/
│   │   ├── transcriber.py          # Multimodal audio transcription service
│   │   ├── analyzer.py             # Structured summary & risk audit service
│   │   ├── vector_store.py         # ChromaDB RAG & collection manager
│   │   ├── ppt_generator.py        # python-pptx 16:9 slide deck builder
│   │   ├── pdf_generator.py        # reportlab Executive PDF generator
│   │   └── evaluator.py            # LLM-as-a-Judge rubric evaluator
│   └── venv/                       # Python virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx                 # Layout, navigation header, global state
│   │   ├── index.css               # Design system, glassmorphism, animations
│   │   └── components/
│   │       ├── AudioUploader.jsx       # Live Speaker Mic & File Uploader
│   │       ├── MeetingSummaryView.jsx  # Executive Summary & Action Items
│   │       ├── SlideGeneratorView.jsx  # Glassmorphic Slide Preview & PPTX Export
│   │       ├── RagChatbotView.jsx      # ChromaDB RAG Q&A Chatbot
│   │       └── EvaluatorView.jsx       # GenAI Quality Rubric Scorecards
│   └── package.json
└── README.md
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ and npm
- Free Google Gemini API Key (from [Google AI Studio](https://aistudio.google.com/))

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn chromadb python-pptx reportlab pydantic google-genai requests python-multipart
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```
Backend will start on `http://127.0.0.1:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend dashboard will be live at `http://localhost:5173/`.

---

## 🔑 100% Free Tier Operation

MeetingMate operates **100% free of charge** using Google Gemini's Free Tier:
- **Rate Limits**: 15 requests/minute, 1,500 requests/day for Gemini 2.0 Flash / 2.5 Flash.
- **No Credit Card Required**: Simply obtain a free API key at [Google AI Studio](https://aistudio.google.com/) and paste it into the top dashboard header.

---

## 📜 Capstone Project Features Overview

| Feature | Description |
| :--- | :--- |
| **🎙️ Live Speaker Mic** | Browser audio recording with pulse animation, timer, and auto-submission |
| **📄 Executive Summary** | Structured 2-sentence overview with participants and duration breakdown |
| **📌 Action Item Matrix** | Filterable grid with assignee names, priority levels (High/Medium/Low), and target deadlines |
| **📧 Automated Email** | 1-Click follow-up email draft modal with instant clipboard copy |
| **🔍 ChromaDB RAG Q&A** | Grounded question answering with scope toggles ("Current Meeting" vs "Global Vector Search") and citations |
| **📊 Widescreen PPTX Deck** | Automated PowerPoint presentation generation using `python-pptx` with 1-click confetti download |
| **📑 PDF Executive Report** | Downloadable PDF document built with `reportlab` |
| **⭐ GenAI Rubric Evaluator** | LLM-as-a-Judge grading output clarity, actionability, and completeness |

---

## 📄 License
This project is created as part of the **Generative AI Intensive Course Capstone**.
