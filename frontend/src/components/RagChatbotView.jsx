import React, { useState, useEffect } from 'react';
import { Bot, User, Send, Database, Sparkles, Quote, HelpCircle, Loader2, Layers, Filter } from 'lucide-react';

export default function RagChatbotView({ meetingData, apiKey }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your MeetingMate RAG Assistant. I am grounded on your meeting transcripts stored in ChromaDB. Ask me anything about project decisions, owners, or technical topics!',
      citations: []
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchScope, setSearchScope] = useState('ALL'); // 'ALL' or 'CURRENT'
  const [vectorStats, setVectorStats] = useState({ total_chunks: 5, indexed_meetings_count: 1 });

  const currentMeetingId = meetingData?.meeting_id || 'sample_meeting_q3_sync';

  // Fetch Vector Stats on mount
  useEffect(() => {
    fetch('/api/vector/stats')
      .then(res => res.json())
      .then(data => {
        if (data.total_chunks !== undefined) {
          setVectorStats(data);
        }
      })
      .catch(err => console.log('Vector stats load:', err));
  }, [meetingData]);

  const suggestedQueries = [
    "What was benchmarked for OpenAI Whisper latency?",
    "What action items are assigned to David Miller?",
    "How does ChromaDB ground the RAG chatbot answers?",
    "When is the full-stack capstone release planned?"
  ];

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg = { sender: 'user', text: q, citations: [] };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          meeting_id: searchScope === 'CURRENT' ? currentMeetingId : null,
          api_key: apiKey
        })
      });

      const data = await response.json();

      const botMsg = {
        sender: 'bot',
        text: data.answer || "I checked ChromaDB vector embeddings for your query.",
        citations: data.citations || [],
        scope: data.scope || "ChromaDB Retrieval"
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("RAG Chat error:", err);
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: "I encountered an error querying ChromaDB. Please try again.",
        citations: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
            Semantic Vector Search Engine (ChromaDB)
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Context-Grounded RAG Q&A Assistant</h2>
        </div>

        {/* Live Vector Stats Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(56, 189, 248, 0.12)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '6px 14px',
            borderRadius: '9999px',
            color: '#38bdf8',
            fontSize: '0.82rem',
            fontWeight: 700
          }}>
            <Database size={15} /> {vectorStats.total_chunks} Chunks Indexed ({vectorStats.indexed_meetings_count} Meeting)
          </div>
        </div>
      </div>

      {/* Scope Selector Bar */}
      <div className="glass-panel" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
          <Filter size={16} color="#818cf8" /> Search Scope:
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSearchScope('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: searchScope === 'ALL' ? '#6366f1' : 'rgba(255,255,255,0.06)',
              color: searchScope === 'ALL' ? 'white' : '#94a3b8'
            }}
          >
            Search All Meetings in ChromaDB
          </button>
          
          <button
            onClick={() => setSearchScope('CURRENT')}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              background: searchScope === 'CURRENT' ? '#06b6d4' : 'rgba(255,255,255,0.06)',
              color: searchScope === 'CURRENT' ? 'white' : '#94a3b8'
            }}
          >
            Target Current Meeting Only
          </button>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
        {suggestedQueries.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq)}
            className="btn-secondary"
            style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', borderRadius: '20px', padding: '6px 14px' }}
          >
            <HelpCircle size={14} color="#818cf8" /> {sq}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="glass-panel" style={{ padding: '24px', minHeight: '420px', maxHeight: '540px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: 'flex',
            gap: '14px',
            alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: msg.sender === 'user' ? '80%' : '90%'
          }}>
            {msg.sender === 'bot' && (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: 'white'
              }}>
                <Bot size={20} />
              </div>
            )}

            <div style={{
              background: msg.sender === 'user' ? '#6366f1' : 'rgba(15, 23, 42, 0.85)',
              color: 'white',
              border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              padding: '14px 18px',
              fontSize: '0.95rem',
              lineHeight: 1.6,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
            }}>
              <div>{msg.text}</div>

              {msg.scope && (
                <div style={{ fontSize: '0.72rem', color: '#818cf8', marginTop: '6px', fontWeight: 600 }}>
                  ⚡ Scope: {msg.scope}
                </div>
              )}

              {/* Grounded Citations Box */}
              {msg.citations && msg.citations.length > 0 && (
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Quote size={14} /> Retrieved ChromaDB Grounding Citations:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {msg.citations.map((c, cIdx) => (
                      <div key={cIdx} style={{
                        background: 'rgba(0,0,0,0.3)',
                        borderLeft: '3px solid #38bdf8',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: '#cbd5e1'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#818cf8', fontWeight: 600, fontSize: '0.78rem', marginBottom: '2px' }}>
                          <span>{c.speaker} ({c.timestamp}) in {c.title}</span>
                          <span>Similarity: {c.similarity}%</span>
                        </div>
                        <div>"{c.content}"</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#94a3b8'
              }}>
                <User size={20} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', fontSize: '0.9rem' }}>
            <Loader2 size={20} className="spin" /> Searching ChromaDB vector index...
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <input
          type="text"
          placeholder={`Ask a question (${searchScope === 'CURRENT' ? 'Current Meeting Scope' : 'All Meetings Scope'})...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          style={{
            flex: 1,
            background: 'rgba(18, 24, 38, 0.8)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '14px 20px',
            borderRadius: '12px',
            color: 'white',
            fontSize: '0.95rem',
            outline: 'none'
          }}
        />
        <button 
          className="btn-primary" 
          onClick={() => handleSend()}
          disabled={loading || !inputQuery.trim()}
          style={{ borderRadius: '12px', padding: '0 24px' }}
        >
          <Send size={18} />
        </button>
      </div>

    </div>
  );
}
