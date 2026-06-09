const video = document.getElementById("video");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

let running = false;
let stream = null;

let fpsCounter = 0;
let fpsLast = performance.now();

function getServerURL() {

    return document
        .getElementById("serverUrl")
        .value
        .trim()
        .replace(/\/$/, "");
}

async function testConnection() {

    const url =
        getServerURL() + "/model_info";

    try {

        const res =
            await fetch(url);

        if(!res.ok)
            throw new Error();

        const info =
            await res.json();

        document.getElementById("modelName")
            .textContent = info.name || "-";

        document.getElementById("params")
            .textContent = info.params || "-";

        document.getElementById("gflops")
            .textContent = info.gflops || "-";

        document.getElementById("device")
            .textContent = info.device || "-";

        document.getElementById("status")
            .textContent = "Connected";

        return true;

    } catch(err) {

        document.getElementById("status")
            .textContent = "Connection Failed";

        return false;
    }
}

async function startCamera() {

    const ok =
        await testConnection();

    if(!ok)
        return;

    stream =
        await navigator
            .mediaDevices
            .getUserMedia({
                video:true
            });

    video.srcObject = stream;

    await new Promise(resolve => {
        video.onloadedmetadata = resolve;
    });

    canvas.width =
        video.videoWidth;

    canvas.height =
        video.videoHeight;

    running = true;

    detectLoop();
}

function stopCamera() {

    running = false;

    if(stream)
        stream.getTracks()
            .forEach(t => t.stop());
}

async function detectLoop() {

    while(running) {

        const t0 =
            performance.now();

        try {

            const offscreen =
                document.createElement("canvas");

            offscreen.width = 640;
            offscreen.height = 640;

            const oc =
                offscreen.getContext("2d");

            oc.drawImage(
                video,
                0,
                0,
                640,
                640
            );

            const blob =
                await new Promise(resolve =>
                    offscreen.toBlob(
                        resolve,
                        "image/jpeg",
                        0.8
                    )
                );

            const fd =
                new FormData();

            fd.append(
                "frame",
                blob,
                "frame.jpg"
            );

            fd.append(
                "conf",
                "0.4"
            );

            const res =
                await fetch(
                    getServerURL() +
                    "/detect",
                    {
                        method:"POST",
                        body:fd
                    }
                );

            const result =
                await res.json();

            drawBoxes(
                result.detections
            );

            document
                .getElementById(
                    "latency"
                )
                .textContent =
                result.inference_ms;

        }
        catch(err) {

            console.error(err);

            document
                .getElementById(
                    "status"
                )
                .textContent =
                "Backend Error";
        }

        fpsCounter++;

        const now =
            performance.now();

        if(now - fpsLast > 1000){

            document
                .getElementById(
                    "fps"
                )
                .textContent =
                fpsCounter;

            fpsCounter = 0;
            fpsLast = now;
        }

        await new Promise(
            r => setTimeout(r,100)
        );
    }
}

function drawBoxes(dets) {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const sx =
        canvas.width / 640;

    const sy =
        canvas.height / 640;

    dets.forEach(det => {

        const [x1,y1,x2,y2] =
            det.box;

        ctx.strokeStyle =
            "lime";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            x1*sx,
            y1*sy,
            (x2-x1)*sx,
            (y2-y1)*sy
        );

        ctx.fillStyle =
            "lime";

        ctx.fillText(
            det.label +
            " " +
            Math.round(
                det.confidence*100
            ) + "%",
            x1*sx,
            y1*sy - 5
        );
    });
}

document
    .getElementById("testBtn")
    .onclick =
    testConnection;

document
    .getElementById("startBtn")
    .onclick =
    startCamera;

document
    .getElementById("stopBtn")
    .onclick =
    stopCamera;
