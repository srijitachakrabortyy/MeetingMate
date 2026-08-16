import React, { useState, useEffect } from 'react';
import { Mic, FileText, Presentation, MessageSquare, Award, Sparkles, RefreshCw, Key } from 'lucide-react';
import AudioUploader from './components/AudioUploader';
import MeetingSummaryView from './components/MeetingSummaryView';
import SlideGeneratorView from './components/SlideGeneratorView';
import RagChatbotView from './components/RagChatbotView';
import EvaluatorView from './components/EvaluatorView';

export default function App() {
  const [activeTab, setActiveTab] = useState('uploader'); // 'uploader', 'summary', 'slides', 'chat', 'eval'
  const [meetingData, setMeetingData] = useState(null);
  const [apiKey, setApiKey] = useState('');

  // Auto-fetch sample meeting data on initial load
  useEffect(() => {
    fetch('/api/sample')
      .then(res => {
        if (!res.ok) throw new Error("API not ready");
        return res.json();
      })
      .then(data => {
        if (data && data.analysis && data.transcript) {
          setMeetingData(data);
        }
      })
      .catch(err => console.log('Sample load API check:', err));
  }, []);

  const handleProcessComplete = (data) => {
    setMeetingData(data);
    setActiveTab('summary');
  };

  const navItems = [
    { id: 'uploader', label: 'Upload & Process', icon: Mic },
    { id: 'summary', label: 'Executive Summary', icon: FileText },
    { id: 'slides', label: 'Slide Deck (.PPTX)', icon: Presentation },
    { id: 'chat', label: 'RAG Q&A Chatbot', icon: MessageSquare },
    { id: 'eval', label: 'GenAI Rubric Grading', icon: Award }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Global Top Navbar */}
      <header className="glass-panel" style={{
        borderRadius: 0,
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        padding: '14px 32px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab('uploader')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
              color: 'white'
            }}>
              <Mic size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }} className="gradient-text">
                MeetingMate
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginTop: '-2px' }}>
                GenAI Smart Meeting Companion
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav style={{ display: 'flex', gap: '6px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'transparent',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: isActive ? '0 4px 14px rgba(99,102,241,0.3)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} /> {item.label}
                </button>
              );
            })}
          </nav>

          {/* Active Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981'
            }} />
            <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 600 }}>
              {meetingData ? 'Meeting Loaded' : 'Ready'}
            </span>
          </div>

        </div>
      </header>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, padding: '32px 20px', maxWidth: '1300px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'uploader' && (
          <AudioUploader
            onProcessComplete={handleProcessComplete}
            apiKey={apiKey}
            setApiKey={setApiKey}
          />
        )}

        {activeTab === 'summary' && (
          <MeetingSummaryView meetingData={meetingData} />
        )}

        {activeTab === 'slides' && (
          <SlideGeneratorView meetingData={meetingData} />
        )}

        {activeTab === 'chat' && (
          <RagChatbotView apiKey={apiKey} />
        )}

        {activeTab === 'eval' && (
          <EvaluatorView meetingData={meetingData} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: '#64748b',
        fontSize: '0.85rem',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(11, 15, 23, 0.8)'
      }}>
        MeetingMate • Built with OpenAI Whisper, Google Gemini, ChromaDB & python-pptx
      </footer>

    </div>
  );
}
