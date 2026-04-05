import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')

  return (
    <div className="app">
      <h1>HappyWheel</h1>
      <button onClick={() => setMessage('Hello World!')}>Say Hello</button>
      {message && <p className="message">{message}</p>}
    </div>
  )
}

export default App
