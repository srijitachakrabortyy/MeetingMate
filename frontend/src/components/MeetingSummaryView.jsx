import React, { useState } from 'react';
import { FileText, CheckCircle2, User, Clock, Search, Filter, ShieldCheck, ListOrdered, Sparkles, MessageSquare, Download, FileCode, Mail, AlertTriangle, Copy, Check } from 'lucide-react';

export default function MeetingSummaryView({ meetingData, apiKey }) {
  if (!meetingData || !meetingData.analysis) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
        No meeting data available. Please record audio with Speaker Mic or load a sample meeting first.
      </div>
    );
  }

  const { analysis, transcript, meeting_id } = meetingData;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Automated Email State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState(analysis.automated_email || null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredActionItems = (analysis.action_items || []).filter(item => {
    if (selectedPriority !== 'ALL' && item.priority.toUpperCase() !== selectedPriority) return false;
    return true;
  });

  const filteredTranscript = (transcript || []).filter(t => 
    t.speaker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadReport = async () => {
    setDownloadingReport(true);
    try {
      const mId = meeting_id || 'sample_meeting_q3_sync';
      const res = await fetch(`/api/export-report/${mId}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MeetingMate_Report_${analysis.date || '2026'}.md`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Error downloading Markdown report:", err);
    } finally {
      setDownloadingReport(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_data: analysis })
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MeetingMate_Report_${analysis.date || '2026'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Error downloading PDF:", err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleGenerateAutomatedEmail = async () => {
    setShowEmailModal(true);
    if (!emailData) {
      setLoadingEmail(true);
      try {
        const res = await fetch('/api/automated-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysis_data: analysis, api_key: apiKey })
        });
        const data = await res.json();
        setEmailData(data);
      } catch (err) {
        console.error("Error generating automated email:", err);
      } finally {
        setLoadingEmail(false);
      }
    }
  };

  const handleCopyEmail = () => {
    if (!emailData) return;
    const fullText = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Overview Metadata Header */}
      <div className="glass-panel" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Meeting Intelligence Overview
            </span>
            <span style={{ background: 'rgba(99, 102, 241, 0.2)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#a5b4fc', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> Automated Gemini 2.0
            </span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{analysis.title}</h2>
          <div style={{ display: 'flex', gap: '18px', marginTop: '10px', color: '#94a3b8', fontSize: '0.9rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} color="#818cf8"/> Date: {analysis.date}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} color="#38bdf8"/> Duration: {analysis.duration}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={16} color="#f472b6"/> {analysis.participants?.length || 0} Attendees</span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary"
            onClick={handleGenerateAutomatedEmail}
            style={{ borderColor: 'rgba(236, 72, 153, 0.4)', background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6' }}
          >
            <Mail size={16} /> Automated Email Draft
          </button>

          <button 
            className="btn-primary" 
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', boxShadow: '0 4px 14px rgba(6,182,212,0.3)' }}
          >
            <Download size={16} /> {downloadingPdf ? 'Generating PDF...' : 'Download PDF Report'}
          </button>

          <button 
            className="btn-secondary" 
            onClick={handleDownloadReport}
            disabled={downloadingReport}
          >
            <FileCode size={16} /> Markdown (.md)
          </button>
        </div>
      </div>

      {/* Automated Email Modal */}
      {showEmailModal && (
        <div className="glass-panel" style={{ padding: '24px 28px', border: '1px solid rgba(236, 72, 153, 0.4)', background: 'rgba(15, 23, 42, 0.95)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f472b6', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={20} /> Automated Gemini Follow-up Email Draft
            </h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-secondary" onClick={handleCopyEmail} style={{ padding: '6px 14px', fontSize: '0.82rem' }}>
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Email Text'}
              </button>
              <button className="btn-secondary" onClick={() => setShowEmailModal(false)} style={{ padding: '6px 12px', fontSize: '0.82rem' }}>
                Close
              </button>
            </div>
          </div>

          {loadingEmail ? (
            <div style={{ color: '#38bdf8', padding: '20px 0' }}>Generating automated email draft...</div>
          ) : emailData ? (
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '18px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '10px', fontSize: '0.95rem' }}>
                Subject: {emailData.subject}
              </div>
              <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {emailData.body}
              </pre>
            </div>
          ) : null}
        </div>
      )}

      {/* Executive Summary & Key Decisions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Executive Summary */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#818cf8' }}>
            <FileText size={22} /> Executive Summary
          </h3>
          <p style={{ lineHeight: 1.7, color: '#e2e8f0', fontSize: '0.98rem' }}>
            {analysis.executive_summary}
          </p>
          
          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#38bdf8' }}>Main Discussion Topics</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(analysis.topics || []).map((t, idx) => (
                <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '8px', borderLeft: '3px solid #6366f1' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{t.name}</div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>{t.summary}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Key Decisions & Automated Risks */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8' }}>
            <ShieldCheck size={22} /> Key Decisions Agreed
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {(analysis.key_decisions || []).map((dec, idx) => (
              <div key={idx} style={{
                display: 'flex',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)'
              }}>
                <CheckCircle2 size={20} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ color: '#f1f5f9', fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>
                  {dec}
                </span>
              </div>
            ))}
          </div>

          {/* Automated Risks */}
          {analysis.automated_risks && (
            <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} /> Automated Gemini Risk & Mitigation Audit
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysis.automated_risks.map((r, idx) => (
                  <div key={idx} style={{ background: 'rgba(245, 158, 11, 0.06)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '10px 14px', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fbbf24' }}>
                      Risk: {r.risk} ({r.impact} Impact)
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '2px' }}>
                      Mitigation: {r.mitigation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Action Items Matrix */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ListOrdered size={24} color="#f472b6" /> Action Items & Accountability Matrix
          </h3>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedPriority === p ? '#6366f1' : 'rgba(255,255,255,0.05)',
                  color: selectedPriority === p ? 'white' : '#94a3b8'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '650px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.85rem' }}>
                <th style={{ padding: '12px 16px' }}>TASK / ACTION ITEM</th>
                <th style={{ padding: '12px 16px' }}>OWNER / ASSIGNEE</th>
                <th style={{ padding: '12px 16px' }}>PRIORITY</th>
                <th style={{ padding: '12px 16px' }}>DEADLINE</th>
              </tr>
            </thead>
            <tbody>
              {filteredActionItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.95rem' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#f8fafc' }}>
                    {item.task}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <User size={14} color="#38bdf8" /> {item.assignee}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span className={`badge badge-${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#cbd5e1', fontSize: '0.9rem' }}>
                    {item.deadline}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Speaker Script */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MessageSquare size={24} color="#38bdf8" /> Timestamped Speaker Script
          </h3>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search in transcript..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '420px', overflowY: 'auto', paddingRight: '8px' }}>
          {filteredTranscript.map((t, idx) => (
            <div key={idx} style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '12px',
              padding: '14px 18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.92rem' }}>
                  {t.speaker}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                  {t.timestamp}
                </span>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {t.text}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
