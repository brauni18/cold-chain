#!/usr/bin/env python3
"""
Cold-Chain Sensor Reader
Reads sensors via 1-Wire and writes to DynamoDB.
"""

import time
import os
import glob
import socket
import boto3
from decimal import Decimal
from datetime import datetime, timezone
from dotenv import load_dotenv

# ── Config ──────────────────────────────────────────────

load_dotenv()

TENANT_ID = os.getenv('TENANT_ID', socket.gethostname())
DYNAMO_TABLE = os.getenv('DYNAMODB_TABLE', 'cold-chain-sensors')
DYNAMO_REGION = os.getenv('AWS_REGION', 'eu-north-1')
READ_INTERVAL = int(os.getenv('READ_INTERVAL', '1800'))  # seconds

W1_BASE_DIR = '/sys/bus/w1/devices/'
W1_SENSOR_PREFIX = '28-'

# ── DynamoDB ────────────────────────────────────────────

dynamodb = boto3.resource('dynamodb', region_name=DYNAMO_REGION)
table = dynamodb.Table(DYNAMO_TABLE)

# ── Sensor discovery & reading ──────────────────────────

def discover_sensors():
    """Find all DS18B20 sensors on the 1-Wire bus."""
    paths = glob.glob(W1_BASE_DIR + W1_SENSOR_PREFIX + '*')
    return [os.path.basename(p) for p in paths]


def read_w1_sensor(sensor_id):
    """
    Read a DS18B20 sensor's w1_slave file.
    Returns (celsius, fahrenheit, status) tuple.
    """
    device_file = os.path.join(W1_BASE_DIR, sensor_id, 'w1_slave')
    try:
        with open(device_file, 'r') as f:
            lines = f.readlines()
    except FileNotFoundError:
        return None, None, 'Error'

    # Line 1 must end with YES (valid CRC)
    if not lines or lines[0].strip()[-3:] != 'YES':
        return None, None, 'Error'

    # Line 2 has t=<millidegrees>
    equals_pos = lines[1].find('t=')
    if equals_pos == -1:
        return None, None, 'Bad Data'

    temp_c = float(lines[1][equals_pos + 2:]) / 1000.0
    temp_f = temp_c * 9.0 / 5.0 + 32.0
    return round(temp_c, 2), round(temp_f, 2), 'OK'


# ── DynamoDB write ──────────────────────────────────────

def send_reading(sensor_id, celsius, fahrenheit, status):
    """
    Write a single sensor reading to DynamoDB.
    Generic schema — works for any sensor type.
    """
    now = datetime.now(timezone.utc)
    ttl_seconds = int(now.timestamp()) + 7776000  # 90 days

    # Primary reading (celsius)
    item = {
        'sensorId': sensor_id,
        'timestamp': now.isoformat(),
        'tenantId': TENANT_ID,
        'sensorType': 'temperature',
        'measure': 'celsius',
        'value': Decimal(str(celsius)),
        'status': status,
        'ttl': ttl_seconds,
        # Keep fahrenheit as a convenience field
        'fahrenheit': Decimal(str(fahrenheit)),
    }

    try:
        table.put_item(Item=item)
        print(f"  ✅ DynamoDB: {sensor_id} → {celsius}°C (tenant: {TENANT_ID})")
    except Exception as e:
        print(f"  ❌ DynamoDB ERROR [{sensor_id}]: {e}")


# ── Main loop ───────────────────────────────────────────

def main():
    print("=" * 60)
    print(f"  Cold-Chain Reader")
    print(f"  Tenant:   {TENANT_ID}")
    print(f"  Table:    {DYNAMO_TABLE}")
    print(f"  Region:   {DYNAMO_REGION}")
    print(f"  Interval: {READ_INTERVAL}s")
    print("=" * 60)

    while True:
        sensors = discover_sensors()

        if not sensors:
            print(f"[{time.strftime('%H:%M:%S')}] No sensors found.")
        else:
            print(f"[{time.strftime('%H:%M:%S')}] Reading {len(sensors)} sensor(s)...")
            for sensor_id in sensors:
                celsius, fahrenheit, status = read_w1_sensor(sensor_id)

                if status == 'OK':
                    send_reading(sensor_id, celsius, fahrenheit, status)
                else:
                    print(f"  ⚠️  {sensor_id} skipped: {status}")

        time.sleep(READ_INTERVAL)


if __name__ == '__main__':
    main()
