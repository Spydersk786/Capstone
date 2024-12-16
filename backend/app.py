from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
import subprocess

app = Flask(__name__)

# Enable Cross-Origin Resource Sharing (CORS)
CORS(app)

# Initialize Socket.IO
socketio = SocketIO(app, cors_allowed_origins="*")

# In-memory storage for sensor data (you can replace this with a database)
sensor_data = {}

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

# Function to run a script based on the event
def run_script(script_name):
    try:
        if script_name == 'script1':
            result = subprocess.run(['python3', '/path/to/script1.py'], capture_output=True, text=True)
        elif script_name == 'script2':
            result = subprocess.run(['python3', '/path/to/script2.py'], capture_output=True, text=True)
        elif script_name == 'script3':
            result = subprocess.run(['python3', '/path/to/script3.py'], capture_output=True, text=True)
        else:
            return f"Invalid script name: {script_name}"
        
        return result.stdout or result.stderr
    except Exception as e:
        return str(e)

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
    output = run_script(script_name)
    emit('update', {'predict': output})

if __name__ == '__main__':
    # Run the app and make it accessible on the network
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
