# YOLOVision — Real-time YOLO Detection via Browser

A split architecture: the **frontend** lives on GitHub Pages and captures your webcam, while the **backend** runs on your own server with a YOLO `.pt` model.

---

## Architecture

```
Browser (GitHub Pages)
  └─ Webcam frame (JPEG) ──POST /detect──► Your Server (FastAPI)
                                                └─ YOLO .pt model
  ◄── JSON detections, FPS, ms, GFLOPs ─────────┘
```

---

## 1 — Backend Setup (your server)

### Requirements

```bash
pip install fastapi uvicorn ultralytics pillow python-multipart
```

### Run

```bash
# With default yolov8n.pt (downloads automatically if not present)
python server.py

# With your own model
python server.py --model /path/to/your_model.pt --port 8000

# With GPU
python server.py --model best.pt --device cuda --port 8000
```

### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--model` | `yolov8n.pt` | Path to your YOLO `.pt` file |
| `--port` | `8000` | Port to listen on |
| `--host` | `0.0.0.0` | Bind address |
| `--device` | auto | `cpu`, `cuda`, or `mps` |

### Make it reachable from the internet

Your server needs a **public IP or domain** so the browser can reach it.

Options:
- **VPS** (DigitalOcean, Linode, etc.): run `python server.py` and open port 8000 in the firewall
- **ngrok** (quick dev tunnel): `ngrok http 8000` → use the `https://xxxx.ngrok.io` URL in the frontend
- **Cloudflare Tunnel**: `cloudflared tunnel --url http://localhost:8000`
- **HTTPS required**: if your GitHub Pages site is served over HTTPS, your backend must also be HTTPS (use a reverse proxy like nginx + certbot, or a tunnel)

---

## 2 — Frontend Setup (GitHub Pages)

### Deploy

1. Create a GitHub repo (e.g. `yolovision`)
2. Copy `index.html` into the repo root
3. Go to **Settings → Pages → Source → main / root**
4. Your site will be live at `https://yourusername.github.io/yolovision/`

### Usage

1. Open the GitHub Pages URL in your browser
2. Enter your backend URL in the **Backend Server URL** field (e.g. `https://your-server.com:8000`)
3. Adjust the **confidence threshold** slider
4. Click **▶ Start Camera**

---

## API Reference

### `GET /model_info`

Returns static model metadata.

```json
{
  "name": "yolov8n",
  "params": "3.2M",
  "device": "cuda:0",
  "imgsz": "640×640",
  "gflops": 8.7,
  "num_classes": 80,
  "classes": ["person", "bicycle", ...]
}
```

### `POST /detect`

| Field | Type | Description |
|-------|------|-------------|
| `frame` | file (JPEG/PNG) | Camera frame |
| `conf` | float (0.01–1.0) | Confidence threshold |

Returns:

```json
{
  "detections": [
    { "label": "person", "confidence": 0.93, "box": [120.0, 45.0, 380.0, 480.0] }
  ],
  "inference_ms": 18.4,
  "model_gflops": 8.7,
  "model_info": { "name": "yolov8n", "params": "3.2M", "device": "cuda:0", "imgsz": "640×640" }
}
```

Box coordinates are in the **frame coordinate space** (640×360 as sent by the browser).

---

## CORS

The server allows **all origins** by default. For production, edit `server.py` and restrict:

```python
allow_origins=["https://yourusername.github.io"],
```

---

## Metrics Explained

| Metric | Source |
|--------|--------|
| **FPS** | Rendered frames per second in the browser |
| **Latency (ms)** | Full round-trip time: send frame → receive detections |
| **Model GFLOPs** | Reported by `ultralytics` at model load time |
| **Objects** | Count of detections in the current frame |
