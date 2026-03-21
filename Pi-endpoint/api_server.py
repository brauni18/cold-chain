#!/usr/bin/env python3
"""
Simple HTTP server that provides temperature data via REST API
Run this alongside your main reader.py script
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time
import paho.mqtt.client as mqtt
import threading
from urllib.parse import urlparse

# Global variable to store latest sensor data
sensor_data = {}
last_update = {}

class TemperatureAPIHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        path = parsed_path.path
        
        # Serve HTML dashboard
        if path == '/' or path == '/dashboard':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            try:
                with open('simple_dashboard.html', 'r') as f:
                    self.wfile.write(f.read().encode())
            except FileNotFoundError:
                self.wfile.write(b'<h1>Dashboard not found</h1>')
            return
        
        # Enable CORS for web browsers
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
        if path == '/api/sensors':
            # Return all sensor data
            response = {
                'sensors': sensor_data,
                'last_update': last_update,
                'timestamp': time.time()
            }
        elif path.startswith('/api/sensor/'):
            # Return specific sensor data
            sensor_id = path.split('/')[-1]
            if sensor_id in sensor_data:
                response = {
                    'sensor_id': sensor_id,
                    'data': sensor_data[sensor_id],
                    'last_update': last_update.get(sensor_id, None),
                    'timestamp': time.time()
                }
            else:
                response = {'error': 'Sensor not found'}
        else:
            response = {
                'endpoints': [
                    '/api/sensors - Get all sensor data',
                    '/api/sensor/{sensor_id} - Get specific sensor data'
                ]
            }
        
        self.wfile.write(json.dumps(response, indent=2).encode())

# MQTT client to collect data
def mqtt_listener():
    def on_connect(client, userdata, flags, rc):
        print(f"MQTT Connected with result code {rc}")
        client.subscribe("coldchain/sensor/+")

    def on_message(client, userdata, msg):
        global sensor_data, last_update
        try:
            topic_parts = msg.topic.split('/')
            sensor_id = topic_parts[-1]  # Get sensor ID from topic
            
            data = json.loads(msg.payload.decode())
            sensor_data[sensor_id] = data
            last_update[sensor_id] = time.time()
            print(f"Updated data for sensor {sensor_id}: {data['celsius']}°C")
            
        except Exception as e:
            print(f"Error processing MQTT message: {e}")

    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
    client.on_connect = on_connect
    client.on_message = on_message
    
    try:
        client.connect("broker.hivemq.com", 1883, 60)
        client.loop_forever()
    except Exception as e:
        print(f"MQTT connection error: {e}")

if __name__ == '__main__':
    # Start MQTT listener in background thread
    mqtt_thread = threading.Thread(target=mqtt_listener, daemon=True)
    mqtt_thread.start()
    
    # Start HTTP server
    server_address = ('', 8080)
    httpd = HTTPServer(server_address, TemperatureAPIHandler)
    
    print("Temperature API Server starting...")
    print("Local access: http://localhost:8080/api/sensors")
    print("Network access: http://[YOUR_PI_IP]:8080/api/sensors")
    print("Available endpoints:")
    print("  GET /api/sensors - All sensor data")
    print("  GET /api/sensor/{sensor_id} - Specific sensor data")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()
