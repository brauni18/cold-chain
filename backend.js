const express = require('express');
const { InfluxDB } = require('@influxdata/influxdb-client');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS for your React app
app.use(cors({
    origin: 'http://localhost:5173', // Vite's default port
    methods: ['GET', 'POST'],
    credentials: true
}));

// 1. InfluxDB Setup
const token = 'INUsA-pnf0CbGCgLlyRokVQVvfJ9z33meMlK2SmOrLLVNS10L4S7kLitcbLIpnX9wtFLybDb1iPNb0ewBjlXHQ==';
const org = 'CoolMonitor org';
const bucket = 'refrigerator-sensor-bucket';
const url = 'https://eu-central-1-1.aws.cloud2.influxdata.com';

const client = new InfluxDB({ url, token });
const queryApi = client.getQueryApi(org);

// 2. The "Bridge" Endpoint
app.get('/api/temperature/latest', async (req, res) => {
    const fluxQuery = `
        from(bucket: "${bucket}")
        |> range(start: -7d)
        |> last()
    `;

    let data = {};
    let hasError = false;

    try {
        queryApi.queryRows(fluxQuery, {
            next(row, tableMeta) {
                data = tableMeta.toObject(row);
                console.log("✅ Data received:", data);
            },
            error(e) {
                hasError = true;
                console.error("❌ InfluxDB Error:", e.message);
                if (!res.headersSent) {
                    res.status(500).json({ error: e.message });
                }
            },
            complete() {
                if (!hasError && !res.headersSent) {
                    if (data && data._value !== undefined) {
                        console.log("✅ Sending to frontend:", data);
                        res.json({
                            temp: data._value,
                            time: data._time,
                            unit: 'Celsius'
                        });
                    } else {
                        console.log("⚠️ No data found");
                        res.status(404).json({ error: "No data found" });
                    }
                }
            },
        });
    } catch (error) {
        console.error("Server Error:", error);
        if (!res.headersSent) {
            res.status(500).send("Server Error");
        }
    }
});

app.listen(port, () => {
    console.log(`🚀 Bridge running on http://localhost:${port}`);
    console.log(`📊 Test: http://localhost:${port}/api/temperature/latest`);
});