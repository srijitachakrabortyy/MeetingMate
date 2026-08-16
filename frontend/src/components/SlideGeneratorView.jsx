import React, { useState } from 'react';
import { Presentation, Download, ChevronLeft, ChevronRight, Sparkles, Check, Table, FileText, FileDown } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SlideGeneratorView({ meetingData }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  if (!meetingData || !meetingData.analysis) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
        No meeting analysis available to generate slides.
      </div>
    );
  }

  const { analysis } = meetingData;

  const downloadPptx = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/generate-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_data: analysis })
      });

      if (!response.ok) throw new Error("Failed to generate presentation");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MeetingMate_Summary_${analysis.date || '2026'}.pptx`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error("Error downloading PowerPoint:", err);
    } finally {
      setDownloading(false);
    }
  };

  const downloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_data: analysis })
      });

      if (!response.ok) throw new Error("Failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MeetingMate_Summary_${analysis.date || '2026'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error("Error downloading PDF:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const totalSlides = 3;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Presentation Engine (python-pptx & reportlab)
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Executive Presentation Deck & PDF Generator</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '2px' }}>
            Export presentation-ready PowerPoint slides or executive PDF summary documentation
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={downloadPptx}
            disabled={downloading}
            style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', boxShadow: '0 4px 20px rgba(236,72,153,0.4)' }}
          >
            <Download size={18} />
            {downloading ? 'Building Deck...' : 'Download .PPTX Deck'}
          </button>

          <button 
            className="btn-secondary" 
            onClick={downloadPdf}
            disabled={downloadingPdf}
            style={{ borderColor: 'rgba(6, 182, 212, 0.4)', background: 'rgba(6, 182, 212, 0.1)', color: '#38bdf8' }}
          >
            <FileDown size={18} />
            {downloadingPdf ? 'Building PDF...' : 'Download .PDF Report'}
          </button>
        </div>
      </div>

      {/* Slide Visualizer Container */}
      <div className="glass-panel" style={{ padding: '20px', borderRadius: '20px' }}>
        
        {/* Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 8px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#a5b4fc' }}>
            Slide {currentSlide + 1} of {totalSlides}
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn-secondary" 
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(prev => prev - 1)}
              style={{ padding: '6px 12px' }}
            >
              <ChevronLeft size={18} /> Prev
            </button>
            <button 
              className="btn-secondary" 
              disabled={currentSlide === totalSlides - 1}
              onClick={() => setCurrentSlide(prev => prev + 1)}
              style={{ padding: '6px 12px' }}
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Live Widescreen Slide Canvas */}
        <div style={{
          width: '100%',
          aspectRatio: '16/9',
          background: currentSlide === 0 ? '#0f172a' : '#ffffff',
          color: currentSlide === 0 ? '#ffffff' : '#0f172a',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          position: 'relative',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.3s ease'
        }}>

          {/* SLIDE 0: Title Slide */}
          {currentSlide === 0 && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-40px', top: '10%', bottom: '10%', width: '10px', background: '#7c3aed', borderRadius: '0 4px 4px 0' }} />
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.2, marginBottom: '20px', paddingLeft: '20px' }}>
                {analysis.title}
              </h1>
              <div style={{ fontSize: '1.1rem', color: '#38bdf8', fontWeight: 600, paddingLeft: '20px', lineHeight: 1.6 }}>
                Generated by MeetingMate GenAI  |  Date: {analysis.date}<br/>
                <span style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                  Participants: {(analysis.participants || []).join(', ')}
                </span>
              </div>
            </div>
          )}

          {/* SLIDE 1: Executive Summary & Key Decisions */}
          {currentSlide === 1 && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
                Executive Summary & Key Decisions
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', flex: 1 }}>
                <div style={{ background: '#f8fafc', border: '2px solid #7c3aed', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ color: '#7c3aed', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} /> Executive Summary
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>
                    {analysis.executive_summary}
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '2px solid #0ea5e9', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ color: '#0ea5e9', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={18} /> Key Decisions Agreed
                  </h3>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.88rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(analysis.key_decisions || []).map((dec, idx) => (
                      <li key={idx} style={{ lineHeight: 1.5 }}>{dec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: Action Items Table */}
          {currentSlide === 2 && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
                Action Items & Accountabilities
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#1e293b', color: '#ffffff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Action Item / Task</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Assignee</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Priority</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {(analysis.action_items || []).map((item, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#f1f5f9' : '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>{item.task}</td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{item.assignee}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: item.priority === 'High' ? '#dc2626' : '#d97706' }}>{item.priority}</td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>{item.deadline}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Slide Footer */}
          <div style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            fontSize: '0.75rem',
            color: currentSlide === 0 ? '#64748b' : '#94a3b8'
          }}>
            <span>MeetingMate GenAI Presentation</span>
            <span>Slide {currentSlide + 1}</span>
          </div>

        </div>

      </div>

    </div>
  );
}
