# Yolo-camera.io 
# YOLOVision — Real-Time Object Detection on GitHub Pages

A fully client-side YOLO object detection app powered by ONNX Runtime Web.  
No server needed — runs entirely in the browser via WebAssembly.

---

##  Repo Structure

```
your-repo/
├── index.html          ← The web app (this file)
├── models/
│   └── yolov8n.onnx    ← Your ONNX model goes here
└── README.md
```

---

## 🚀 Setup

### 1. Place your ONNX model
Put your exported YOLO `.onnx` file in the `models/` folder (or any subfolder).  
Update the **Model Path** field in the UI to match, e.g. `models/yolov8n.onnx`.

**Supported models:**
- YOLOv8n / s / m / l / x (COCO 80-class, 640×640 input)
- YOLOv5 exported to ONNX
- Any YOLO variant with output shape `[1, 84, N]` (cx, cy, w, h + 80 class scores)

### 2. Enable GitHub Pages
Go to your repo → **Settings → Pages → Source: Deploy from branch → main / root**.  
Your app will be live at `https://<username>.github.io/<repo>/`.

### 3. ⚠️ Large file warning
GitHub has a **100 MB file size limit**. For larger models use [Git LFS](https://git-lfs.com/):

```bash
git lfs install
git lfs track "*.onnx"
git add .gitattributes
git add models/yolov8n.onnx
git commit -m "Add YOLO ONNX model via LFS"
git push
```

---

## 🎛️ Features

| Feature | Detail |
|---|---|
| **Real-time detection** | Webcam feed via `getUserMedia` |
| **ONNX Runtime Web** | WebAssembly backend, no GPU needed |
| **NMS** | Client-side Non-Max Suppression |
| **Live metrics** | FPS, inference time, object count, confidence |
| **Session summary** | Avg FPS, peak FPS, avg inference, top class |
| **Model info** | Size (MB), estimated GFLOPs, input shape |
| **Export** | Download session report as JSON |
| **Configurable** | Confidence & IoU thresholds via sliders |

---

## 📊 GFLOPs Estimation

The app estimates GFLOPs using:
```
GFLOPs ≈ 8.7 × (model_size_MB / 6.0) × (input_pixels / 640²)
```
Calibrated against YOLOv8n (6 MB, 8.7 GFLOPs @ 640×640).  
For exact values, use the [Ultralytics benchmark tool](https://docs.ultralytics.com).

---

## 🛠️ Exporting your YOLO model to ONNX

```python
# YOLOv8
from ultralytics import YOLO
model = YOLO('yolov8n.pt')
model.export(format='onnx', imgsz=640, opset=12)

# YOLOv5
python export.py --weights yolov5n.pt --include onnx --opset 12
```

---

## Browser Requirements

- Chrome 90+, Edge 90+, Firefox 90+, Safari 15.4+
- Camera permission required for live detection
- WebAssembly support (all modern browsers)

---

## 📄 License
MIT
