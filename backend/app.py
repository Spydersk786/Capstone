from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import requests

app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage for sensor data (you can replace this with a database)
sensor_data = {}

# Raspberry Pi details (ensure it's on the same network)
raspberry_ip = "192.168.80.19"  # Replace with your Raspberry Pi's IP address

# Function to run a script on the Raspberry Pi by making an HTTP request
def run_script_on_raspberry(script_name):
    url = f"http://{raspberry_ip}:5001/run-script"
    response = requests.post(url, json={"script": script_name})

    if response.status_code == 200:
        return response.json().get("output", "")
    else:
        return response.json().get("error", "Failed to run script")

# Route to receive data from Raspberry Pi
@app.route('/api/send-data', methods=['POST'])
def receive_data():
    global sensor_data
    try:
        # Parse incoming JSON data
        data = request.get_json()

        if not data or "predict" not in data:
            return jsonify({"status": "error", "message": "Invalid data format"}), 400

        prediction = data.get("predict")

        # Store the received data
        sensor_data = {"predict": prediction}

        # Notify the frontend about the new data using Socket.IO
        socketio.emit('update', sensor_data)

        return jsonify({"status": "success", "message": "Data received successfully"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Route to send the latest data to frontend
@app.route('/api/get-data', methods=['GET'])
def get_data():
    try:
        return jsonify(sensor_data), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# Socket.IO event for testing real-time connection
@socketio.on('connect')
def handle_connect():
    print("Frontend connected")
    socketio.emit('update', sensor_data)

@socketio.on('disconnect')
def handle_disconnect():
    print("Frontend disconnected")

# Event listener for script execution requests from frontend
@socketio.on('run_script')
def handle_run_script(data):
    script_name = data.get('script')
    print(f"Received request to run: {script_name}")
    output = run_script_on_raspberry(script_name)
    emit('update', {'predict': output})

if __name__ == '__main__':
    # Run the app and make it accessible on the network
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
