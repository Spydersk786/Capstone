import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function App() {
  const [data, setData] = useState(null); // State to store data from the server
  const [isConnected, setIsConnected] = useState(false); // State to track WebSocket connection status

  useEffect(() => {
    // Connect to the backend WebSocket server
    const socket = io('http://127.0.0.1:5000'); // Change to your backend URL if needed

    // Handle WebSocket connection status
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    });

    // Handle WebSocket disconnection
    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    });

    // Listen for updates from the server
    socket.on('update', (receivedData) => {
      console.log('New data received:', receivedData);
      setData(receivedData);
    });

    // Cleanup when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleButtonClick = (scriptName) => {
    const socket = io('http://127.0.0.1:5000'); // Change to your backend URL if needed
    socket.emit('run_script', { script: scriptName });
  };

  return (
    <div className="App" style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Control Scripts on Raspberry Pi</h1>
      <div>
        <button onClick={() => handleButtonClick('script2')}>SYN Flood</button>
        <button onClick={() => handleButtonClick('script3')}>Http Flood</button>
        <button onClick={() => handleButtonClick('script4')}>Port Scan</button>
        <button onClick={() => handleButtonClick('script5')}>Ransomware</button>
      </div>
      {isConnected ? (
        data ? (
          <div>
            <h2>Prediction Data:</h2>
            <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>{data.predict}</p>
          </div>
        ) : (
          <p style={{ color: 'orange' }}>Waiting for data...</p>
        )
      ) : (
        <p style={{ color: 'red' }}>Not connected to the server. Please check the backend.</p>
      )}
    </div>
  );
}

export default App;
