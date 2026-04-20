import { useState } from 'react';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  // This handles switching between local development and your deployed Vercel backend
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(''); 

    try {
      // Sends a single question to the backend
      const response = await axios.post(`${API_URL}/api/ask`, { question });
      
      // Displays the AI response from the backend
      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Error connecting to backend:", error);
      setAnswer("Error: Could not reach the AI server. Make sure your backend is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '60px auto', 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#333' 
    }}>
      <h1 style={{ color: '#4A90E2', fontSize: '2.5rem', marginBottom: '10px' }}>Cognitia AI</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Ask a single question, get a single response.
      </p>
      
      <form onSubmit={handleAsk} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        background: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
      }}>
        <input 
          type="text" 
          value={question} 
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What is on your mind?"
          style={{ 
            width: '100%', 
            padding: '14px', 
            borderRadius: '8px', 
            border: '1px solid #ddd',
            fontSize: '16px',
            outline: 'none',
            transition: 'border-color 0.3s',
            boxSizing: 'border-box'
          }}
          onFocus={(e) => e.target.style.borderColor = '#4A90E2'}
          onBlur={(e) => e.target.style.borderColor = '#ddd'}
        />

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            marginTop: '25px', 
            padding: '12px 40px', 
            backgroundColor: loading ? '#a0c4ff' : '#4A90E2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'transform 0.1s, background 0.3s',
          }}
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>

      {answer && (
        <div style={{ 
          marginTop: '40px', 
          padding: '25px', 
          borderLeft: '6px solid #4A90E2', 
          backgroundColor: '#f9fbfd', 
          textAlign: 'left',
          borderRadius: '8px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.03)' 
        }}>
          <strong style={{ color: '#4A90E2', display: 'block', marginBottom: '10px' }}>
            AI Assistant
          </strong>
          <p style={{ 
            lineHeight: '1.7', 
            color: '#444', 
            margin: 0,
            fontSize: '16px',
            whiteSpace: 'pre-wrap' 
          }}>
            {/* Logic to find **text** and convert it to bold <b> tags */}
            {answer.split(/(\*\*.*?\*\*)/g).map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <b key={i} style={{ color: '#000', fontWeight: 'bold' }}>{part.slice(2, -2)}</b>;
              }
              return part;
            })}
          </p>
        </div>
      )}
      
      <footer style={{ marginTop: '50px', fontSize: '12px', color: '#999' }}>
        Built with Bun, React, Express, and Groq
      </footer>
    </div>
  );
}

export default App;