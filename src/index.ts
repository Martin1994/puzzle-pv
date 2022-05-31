/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Ticker } from "pixi.js";
import { PuzzleApp } from "./app";

async function main(): Promise<void> {
    const WIDTH = 1920;
    const HEIGHT = 1080;
    const MSAA = 2;

    const recordingMode = location.search.indexOf("record") >= 0;

    Ticker.shared.autoStart = false;

    const app = new PuzzleApp({ width: WIDTH * MSAA, height: HEIGHT * MSAA, autoStart: !recordingMode });
    app.stage.scale.x = MSAA;
    app.stage.scale.y = MSAA;

    document.getElementById("app")?.appendChild(app.view);

    const fpsCounter = document.getElementById("fps-counter")!;
    fpsCounter.parentElement!.style.position = "relative";
    fpsCounter.parentElement!.style.top = "-25px";

    await app.init();

    if (recordingMode) {
        await record(fpsCounter, app);
    } else {
        play(fpsCounter);
    }
}

async function record(fpsCounter: HTMLElement, app: PuzzleApp): Promise<void> {
    const FRAME_RATE = 60;
    const MSPF = 1000 / FRAME_RATE;

    const chunks: ArrayBuffer[] = [];

    const encoder = new VideoEncoder({
        error: e => console.error(e, e.message),
        output: (chunk, _metadata) => {
            const buffer = new ArrayBuffer(chunk.byteLength);
            chunk.copyTo(buffer);
            chunks.push(buffer);
        }
    });

    encoder.configure({
        codec: "avc1.42001f",
        height: 1080,
        width: 1920,
        framerate: FRAME_RATE,
        hardwareAcceleration: "prefer-software"
    });

    let frame = 0;
    let clock = 0;

    let lastFpsFrame = 0;
    let lastUpdate = 0;
    Ticker.system.add(() => {
        const now = performance.now();
        if (now - lastUpdate < 1000) {
            return;
        }
        fpsCounter.innerText = ((frame - lastFpsFrame) / (now - lastUpdate) * 1000).toFixed(2);
        lastFpsFrame = frame;
        lastUpdate = now;
    });

    document.getElementById("app")?.addEventListener("click", () => {
        const a = document.createElement("a");
        document.body.append(a);
        a.download = "video.raw";
        a.href = URL.createObjectURL(new Blob(chunks, {
            type: "application/x-h264"
        }));
        a.click();
        a.remove();
    });

    while (true) {
        Ticker.shared.update(clock);
        clock += MSPF;
        frame++;

        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

        const videoFrame = new VideoFrame(app.view, {
            duration: MSPF * 1000,
            timestamp: frame / FRAME_RATE * 1000000
        });
        encoder.encode(videoFrame, {
            keyFrame: frame % 120 === 0
        });
        videoFrame.close();
    }
}

function play(fpsCounter: HTMLElement): void {
    let lastUpdate = 0;
    Ticker.shared.add(() => {
        const now = performance.now();
        if (now - lastUpdate < 1000) {
            return;
        }
        lastUpdate = now;
        fpsCounter.innerText = Ticker.shared.FPS.toFixed(2);
    });
    Ticker.shared.start();
}

void main();

