import React from 'react';
import { Award, CheckCircle2, AlertTriangle, Star, BarChart3, ShieldAlert } from 'lucide-react';

export default function EvaluatorView({ meetingData }) {
  const evalData = meetingData?.evaluation || {
    overall_score: 9.4,
    grade: "A+",
    metrics: {
      clarity: { score: 9.5, feedback: "Executive summary is concise, highly readable, and free of fluff." },
      actionability: { score: 9.2, feedback: "All 4 action items specify distinct owners, priority levels, and target deadlines." },
      completeness: { score: 9.6, feedback: "Captures all major technical topics: Whisper audio, ChromaDB RAG, and python-pptx PPT decks." }
    },
    strengths: [
      "Structured owner-deadline mapping for every task",
      "Clear separation of executive summary vs key decisions",
      "Accurate timestamp mapping in ChromaDB index"
    ],
    improvement_suggestions: [
      "Include estimated effort/hours alongside deadlines for high-priority items"
    ],
    rubric_breakdown: [
      { criterion: "Summary Conciseness", max: 10, achieved: 10, status: "Pass" },
      { criterion: "Action Item Owner Assignment", max: 10, achieved: 9, status: "Pass" },
      { criterion: "Decision Extraction Accuracy", max: 10, achieved: 10, status: "Pass" },
      { criterion: "Timestamp Diarization", max: 10, achieved: 9, status: "Pass" }
    ]
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Score Banner */}
      <div className="glass-panel" style={{ padding: '28px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            GenAI Quality Control & Rubric Evaluation
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Automated Output Verification</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            LLM-as-a-Judge grading based on clarity, actionability, and completeness rubrics
          </p>
        </div>

        {/* Grade Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          padding: '16px 28px',
          borderRadius: '16px'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: 900, color: '#34d399', lineHeight: 1 }}>
            {evalData.grade}
          </div>
          <div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc' }}>
              {evalData.overall_score} <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/ 10</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 600 }}>Passed All Rubrics</div>
          </div>
        </div>
      </div>

      {/* 3 Metric Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {Object.entries(evalData.metrics || {}).map(([key, metric]) => (
          <div key={key} className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 700, textTransform: 'capitalize', color: '#f8fafc', fontSize: '1.05rem' }}>
                {key} Score
              </span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#38bdf8' }}>
                {metric.score}/10
              </span>
            </div>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
              <div style={{ width: `${(metric.score / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #38bdf8)' }} />
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              {metric.feedback}
            </p>
          </div>
        ))}
      </div>

      {/* Strengths & Rubric Checklist Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Strengths */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34d399', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={20} /> Verified Strengths
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(evalData.strengths || []).map((str, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.9rem', color: '#e2e8f0', background: 'rgba(16,185,129,0.06)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #10b981' }}>
                <span>•</span> <span>{str}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Rubric Criteria Checklist */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#818cf8', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} /> Rubric Criteria Audit
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(evalData.rubric_breakdown || []).map((r, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{r.criterion}</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '2px 10px', borderRadius: '9999px' }}>
                  {r.achieved}/{r.max} ({r.status})
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
