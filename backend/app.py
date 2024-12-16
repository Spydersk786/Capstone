from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS

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

# Socket.IO event for testing real-time connection
@socketio.on('connect')
def handle_connect():
    print("Frontend connected")
    socketio.emit('update', sensor_data)

@socketio.on('disconnect')
def handle_disconnect():
    print("Frontend disconnected")

if __name__ == '__main__':
    # Run the app and make it accessible on the network
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
