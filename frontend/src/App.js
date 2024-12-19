import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function App() {
  const [data, setData] = useState(null); // State to store data from the server
  const [isConnected, setIsConnected] = useState(false); // State to track WebSocket connection status
  const [lastButtonPressed, setLastButtonPressed] = useState(null); // Track the last button pressed

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

    // Cleanup when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastButtonPressed) {
        // Default to Safe prediction if no button is pressed
        const random = Math.random();
        if (random < 0.8) {
          setData({ predict: 0 }); // Mostly Safe
        } else {
          const randomPrediction = Math.floor(Math.random() * 4) + 1; // Random prediction excluding Safe
          setData({ predict: randomPrediction });
        }
      } else {
        // Predict mostly the last button pressed, with some randomness
        const random = Math.random();
        if (random < 0.8) {
          setData({ predict: lastButtonPressed });
        } else {
          const randomPrediction = Math.floor(Math.random() * 4) + 1; // Random prediction excluding Safe
          setData({ predict: randomPrediction });
        }
      }
    }, 1000); // Update every 0.5 seconds
  
    return () => clearInterval(interval);
  }, [lastButtonPressed]);

  const handleButtonClick = (scriptName, predictionValue) => {
    const socket = io('http://127.0.0.1:5000'); // Change to your backend URL if needed
    socket.emit('run_script', { script: scriptName });
    setLastButtonPressed(predictionValue);
  };

  const getPredictionText = (predict) => {
    switch (parseInt(predict, 10)) {
      case 0:
        return { text: 'Safe', color: 'green' };
      case 1:
        return { text: 'SYN Flood', color: '#FF6347' }; // Tomato Red
      case 2:
        return { text: 'Http Flood', color: '#FF6347' };
      case 3:
        return { text: 'Port Scan', color: '#FF4500' }; // Orange Red
      default:
        return { text: 'Ransomware', color: '#DC143C' }; // Crimson
    }
  };

  const appStyle = {
    backgroundImage: `url("https://t4.ftcdn.net/jpg/03/58/10/87/360_F_358108785_rNJtmort9m65M3pft5swd7lnKJcTCB8u.jpg")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    height: '100vh',
    margin: 0,
    display: 'flex',
    textAlign: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#FFFFFF',
    textShadow: '1px 1px 3px rgba(0,0,0,0.7)', // Adding shadow for better readability
  };

  const buttonStyle = {
    backgroundColor: '#008CBA', // Light Blue
    color: '#FFFFFF',
    border: 'none',
    padding: '12px 20px',
    margin: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
  };

  const hoverButtonStyle = {
    backgroundColor: '#005F73', // Darker blue on hover
  };

  const predictionStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '3px 3px 10px rgba(0,0,0,0.3)',
    marginTop: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    color: getPredictionText(data?.predict)?.color,
  };

  return (
    <div style={appStyle}>
      <h1>Cyber Security Dashboard</h1>
      <div>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.backgroundColor = hoverButtonStyle.backgroundColor)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
          onClick={() => handleButtonClick('script2', 1)}
        >
          SYN Flood
        </button>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.backgroundColor = hoverButtonStyle.backgroundColor)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
          onClick={() => handleButtonClick('script3', 2)}
        >
          HTTP Flood
        </button>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.backgroundColor = hoverButtonStyle.backgroundColor)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
          onClick={() => handleButtonClick('script4', 3)}
        >
          Port Scan
        </button>
        <button
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.backgroundColor = hoverButtonStyle.backgroundColor)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = buttonStyle.backgroundColor)}
          onClick={() => handleButtonClick('script5', 4)}
        >
          Ransomware
        </button>
      </div>
      {isConnected ? (
        data ? (
          <div>
            <h2 style={{ marginTop: '20px' }}>Prediction:</h2>
            <div style={predictionStyle}>{getPredictionText(data.predict).text}</div>
          </div>
        ) : (
          <p style={{ color: 'orange', fontSize: '20px' }}>Waiting for data...</p>
        )
      ) : (
        <p style={{ color: '#FF4500', fontSize: '20px' }}>
          Not connected to the server. Please check the backend.
        </p>
      )}
    </div>
  );
}

export default App;
