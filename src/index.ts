/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Ticker } from "pixi.js";
import { PuzzleApp } from "./app";
import { audio } from "./assets";
import { FRAME_RATE } from "./config";

async function main(): Promise<void> {
    const WIDTH = 1920;
    const HEIGHT = 1080;

    const recordingMode = location.search.indexOf("record") >= 0;

    Ticker.shared.autoStart = false;
    Ticker.shared.minFPS = 0;

    const app = new PuzzleApp({ width: WIDTH, height: HEIGHT, resolution: 2 });

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
        await record(fpsCounter);
    } else {
        await audio("puzzle-music").play();
        play(fpsCounter);
    }
}

async function record(fpsCounter: HTMLElement): Promise<void> {
    const MSPF = 1000 / FRAME_RATE;

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

    while (true) {
        Ticker.shared.update(clock);
        clock += MSPF;
        frame++;

        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
}

function play(fpsCounter: HTMLElement): void {
    let lastUpdate = 0;
    Ticker.shared.add(() => {
        const now = performance.now();
        if (now - lastUpdate < 100) {
            return;
        }
        lastUpdate = now;
        fpsCounter.innerText = Ticker.shared.FPS.toFixed(2);
    });
    Ticker.shared.start();
}

void main();
