import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [backendData, setBackendData] = useState(null)

  // Use environment variable for backend URL, fallback to localhost for development
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    fetch(`${BACKEND_URL}/`)
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => setMessage('Error connecting to backend'))

    fetch(`${BACKEND_URL}/api/data`)
      .then(res => res.json())
      .then(data => setBackendData(data))
      .catch(err => console.error(err))
  }, [])

  return (
    <div className="container">
      <header>
        <h1>My Awesome App</h1>
      </header>
      <main>
        <div className="card">
          <h2>Frontend Status</h2>
          <p>Running on Vite + React</p>
        </div>
        <div className="card">
          <h2>Backend Response</h2>
          <p className="response-text">{message}</p>
          {backendData && (
            <div className="data-box">
              <p><strong>Data:</strong> {backendData.message}</p>
              <p><small>{backendData.timestamp}</small></p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
