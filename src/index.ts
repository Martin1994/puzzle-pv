/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Application, Renderer, Ticker, settings } from "pixi.js";
import { PuzzleApp } from "./app";
import { audio, binary } from "./assets";
import { FRAME_RATE } from "./config";

const WIDTH = 1920;
const HEIGHT = 1080;
const RESOLUTION = 2;

async function main(): Promise<void> {

    const search = new URLSearchParams(location.search);

    const recordingMode = search.has("record");
    const skip = parseFloat(search.get("skip") ?? "0");

    Ticker.shared.autoStart = false;
    Ticker.shared.minFPS = 0;

    settings.FILTER_RESOLUTION = 2;
    const app = new PuzzleApp({
        width: WIDTH,
        height: HEIGHT,
        resolution: RESOLUTION,
        realtime: !recordingMode,
        preserveDrawingBuffer: recordingMode
    });

    document.getElementById("app")!.appendChild(app.view);

    await app.init();

    const playButton = document.getElementById("play-btn")!;
    playButton.innerText = "Click to play";
    await new Promise<void>(resolve => playButton.addEventListener("click", function start() {
        playButton.removeEventListener("click", start);
        playButton.style.visibility = "hidden";
        resolve();
    }));

    const fpsCounter = document.getElementById("fps-counter")!;

    if (recordingMode) {
        await record(skip, fpsCounter, app);
    } else {
        await play(skip, fpsCounter);
    }
}

async function record(skip:number, fpsCounter: HTMLElement, app: Application): Promise<void> {
    const { spawn } = await import("child_process");

    const encoder = spawn("ffmpeg", [
        "-y", // Always override output
        "-f", "rawvideo",
        "-pix_fmt", "rgba",
        "-video_size", `${WIDTH * RESOLUTION}x${HEIGHT * RESOLUTION}`,
        "-r", `${FRAME_RATE}`,
        "-i", "pipe:0",
        "-c:v", "libx264",
        "-crf", "14",
        "-pix_fmt", "yuv420p",
        "-tune", "animation",
        "-preset", "veryslow",
        "-vf", `scale=${WIDTH}:${HEIGHT},vflip`, // downscale + webgl's y axis is flipped
        "output/puzzle.mp4"
    ], { stdio: ["pipe", "inherit", "inherit"] });

    const encoderEnd = new Promise(resolve => encoder.once("close", resolve));

    const frameStream = encoder.stdin;
    if (!frameStream) {
        throw new Error("ffmpeg does not have stdin exposed.");
    }

    const MSPF = 1000 / FRAME_RATE;

    let frame = 0;
    let clock = skip * 1000;
    Ticker.shared.lastTime = clock - MSPF;

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

    const totalFrame = new Float32Array(binary("volume")).length;

    const renderer = app.renderer;
    if (!(renderer instanceof Renderer)) {
        throw new Error("Renderer must be used");
    }
    const gl = renderer.gl;

    const screenBuffer = new Uint8Array(HEIGHT * RESOLUTION * WIDTH * RESOLUTION * 4);

    let previousFrameEncoded: Promise<void> = Promise.resolve();

    while (frame < totalFrame) {
        Ticker.shared.update(clock);
        clock += MSPF;
        frame++;

        await previousFrameEncoded;
        gl.readPixels(0, 0, WIDTH * RESOLUTION, HEIGHT * RESOLUTION, gl.RGBA, gl.UNSIGNED_BYTE, screenBuffer);
        previousFrameEncoded = new Promise<void>((resolve, reject) => frameStream.write(screenBuffer, error => error ? reject(error) : resolve()));

        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }

    await previousFrameEncoded;
    frameStream.end();
    await encoderEnd;

    process.stdout.write("Encoder finished.");

    process.exit(0);
}

async function play(skip: number, fpsCounter: HTMLElement): Promise<void> {
    let lastUpdate = 0;
    Ticker.shared.add(() => {
        const now = performance.now();
        if (now - lastUpdate < 100) {
            return;
        }
        lastUpdate = now;
        fpsCounter.innerText = Ticker.shared.FPS.toFixed(2);
    });
    await audio("puzzle-music").play({
        start: skip
    });
    Ticker.shared.start();
    Ticker.shared.lastTime = performance.now() - skip * 1000;
}

void main();
