import time
import os
import glob
import json
import boto3
from decimal import Decimal
from datetime import datetime, timezone
import influxdb_client
from influxdb_client import Point
from influxdb_client.client.write_api import SYNCHRONOUS

# -- cloud config --
token = "INUsA-pnf0CbGCgLlyRokVQVvfJ9z33meMlK2SmOrLLVNS10L4S7kLitcbLIpnX9wtFLybDb1iPNb0ewBjlXHQ=="
org = "CoolMonitor org"
url = "https://eu-central-1-1.aws.cloud2.influxdata.com"
bucket = "refrigerator-sensor-bucket"

cloud_client = influxdb_client.InfluxDBClient(url=url, token=token, org=org)
write_api = cloud_client.write_api(write_options=SYNCHRONOUS)

# -- DynamoDB config --
DYNAMO_TABLE_NAME = "cold-chain-sensors"
DYNAMO_REGION = "eu-north-1"

dynamodb = boto3.resource('dynamodb', region_name=DYNAMO_REGION)
dynamo_table = dynamodb.Table(DYNAMO_TABLE_NAME)

base_dir = '/sys/bus/w1/devices/'
sensor_prefix = '28-'

def get_sensors_ids():
    print(f"in 'get_sensors_ids'")
    sensor_paths = glob.glob(base_dir + sensor_prefix + '*')
    print(f"sensor_paths: {sensor_paths}")
    sensor_ids = [os.path.basename(path) for path in sensor_paths if 
                  sensor_prefix in os.path.basename(path)]
    return sensor_ids

def read_sensor_file(device_file):
    """Reads the raw content of the w1_slave file."""
    try:
        with open(device_file, 'r') as f:
            lines = f.readlines()
        return lines
    except FileNotFoundError:
        return None

def get_temp():
    """Reads temperature from all detected sensors and returns a dictionary of results."""

    sensor_ids = get_sensors_ids()
    temperatures = {}

    for sensor_id in sensor_ids:
        device_file = os.path.join(base_dir, sensor_id, 'w1_slave')
        lines = read_sensor_file(device_file)

        # Handle file read failure or CRC failure (lines[0] not ending with 'YES')
        if lines is None or lines[0].strip()[-3:] != 'YES':
            temperatures[sensor_id] = {'C': None, 'F': None, 'Status': 'Error'}
            continue

        # Find the temperature in the second line
        equals_pos = lines[1].find('t=')
        if equals_pos != -1:
            temp_string = lines[1][equals_pos + 2:]
            temp_c = float(temp_string) / 1000.0
            temp_f = temp_c * 9.0 / 5.0 + 32.0 # Calculate Fahrenheit
            
            # SUCCESS: Return the full data dictionary
            temperatures[sensor_id] = {
                'C': round(temp_c, 2),
                'F': round(temp_f, 2),
                'Status': 'OK'
            }
        else:
            # Handle T= not found error
            temperatures[sensor_id] = {'C': None, 'F': None, 'Status': 'Bad Data'}
            
    return temperatures

def send_to_influx(sensor_id, temp_data):
    """
    Sends temperature data to InfluxDB Cloud
    """
    try:
        # Create a data point
        point = Point("temperature") \
            .tag("sensor_id", sensor_id) \
            .tag("location", "refrigerator") \
            .field("celsius", temp_data['C']) \
            .field("fahrenheit", temp_data['F']) \
            .field("status", temp_data['Status']) \
            .time(time.time_ns())
        
        # Write to InfluxDB
        write_api.write(bucket=bucket, org=org, record=point)
        print(f"InfluxDB: Sent data for sensor {sensor_id}: {temp_data['C']:.2f}°C")
        
    except Exception as e:
        print(f"InfluxDB ERROR: Could not send data for {sensor_id}. {e}")

def send_to_dynamodb(sensor_id, temp_data):
    """
    Sends temperature data to DynamoDB
    """
    try:
        now = datetime.now(timezone.utc)
        item = {
            'sensor_id': sensor_id,
            'timestamp': now.isoformat(),
            'celsius': Decimal(str(temp_data['C'])),
            'fahrenheit': Decimal(str(temp_data['F'])),
            'status': temp_data['Status'],
            'location': 'refrigerator',
            'ttl': int(now.timestamp()) + 7776000  # 90-day TTL
        }

        dynamo_table.put_item(Item=item)
        print(f"DynamoDB: Sent data for sensor {sensor_id}: {temp_data['C']:.2f}°C")

    except Exception as e:
        print(f"DynamoDB ERROR: Could not send data for {sensor_id}. {e}")

if __name__ == '__main__':
    print("Starting temperature monitoring and InfluxDB + DynamoDB cloud storage...")
    
    while True:
        current_readings = get_temp()
        
        # Check if any sensors were found
        if current_readings:
            for sensor_id, data in current_readings.items():
                if data['Status'] == 'OK':
                    # Send the valid data to InfluxDB
                    send_to_influx(sensor_id, data)
                    # Send the valid data to DynamoDB
                    send_to_dynamodb(sensor_id, data)
                else:
                    print(f"Sensor {sensor_id} skipped due to {data['Status']} error.")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] No sensors found.")
            
        time.sleep(1800) # Send data every 30 sec
