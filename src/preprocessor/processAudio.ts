import * as fs from "fs/promises";
import * as path from "path";
import * as zlib from "zlib";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import Ooura = require("ooura");
import { FFT_WINDOW, FRAME_RATE, SAMPLE_RATE } from "../config"


const ASSETS_DIR = path.join(__dirname, "..", "..", "static", "assets");

const fft = new Ooura(FFT_WINDOW, { type: "real", radix: 4 });
const fftInput = new Float64Array(FFT_WINDOW);
const fftReOutput = new Float64Array(FFT_WINDOW);
const fftImOutput = new Float64Array(FFT_WINDOW);
const spectrum = new Float64Array(FFT_WINDOW / 2 + 1);

async function main(): Promise<void> {
    const audioBuffer = await fs.readFile(path.join(ASSETS_DIR, "puzzle.raw"));
    const audio = new Float64Array(audioBuffer.buffer);

    const totalFrames = Math.floor(audio.length / SAMPLE_RATE * FRAME_RATE);
    const volume = new Float32Array(totalFrames);
    const volumeInBand = new Float32Array(totalFrames * FFT_WINDOW / 2);

    let frame = 0;
    for (const spectrum of iterateSpectrumPerFrame(audio)) {
        volume[frame] = getVolume(spectrum);

        getVolumeInBand(spectrum, volumeInBand.subarray(frame * FFT_WINDOW / 2, (frame + 1) * FFT_WINDOW / 2));

        frame++;
    }

    await saveZip(path.join(ASSETS_DIR, "puzzle.volume.gz"), volume);
    await saveZip(path.join(ASSETS_DIR, "puzzle.volume-in-band.gz"), volumeInBand);
}

function* iterateSpectrumPerFrame(audio: Float64Array): Iterable<Float64Array> {
    const length = audio.length / SAMPLE_RATE;
    const step = 1 / FRAME_RATE;
    for (let timestamp = 0; timestamp < length; timestamp += step) {
        const mid = Math.round((timestamp + step / 2) * SAMPLE_RATE);
        fft.fft(sliceWithWindow(audio, mid - FFT_WINDOW / 2).buffer, fftReOutput.buffer, fftImOutput.buffer);
        for (let i = 0; i < FFT_WINDOW / 2 + 1; i++) {
            spectrum[i] = fftReOutput[i] * fftReOutput[i] * fftImOutput[i] * fftImOutput[i];
        }
        yield spectrum;
    }
}

function sliceWithWindow(buffer: Float64Array, from: number): Float64Array {
    const upperBound = buffer.length;
    for (let i = 0; i < FFT_WINDOW; i++) {
        const sourceIndex = from + i;
        if (sourceIndex < 0 || sourceIndex >= upperBound) {
            fftInput[i] = 0;
        } else {
            fftInput[i] = buffer[sourceIndex] * (0.53836 - 0.46164 * Math.cos(2 * Math.PI * (i + 0.5) / FFT_WINDOW));
        }
    }

    return fftInput;
}

function getVolume(spectrum: Float64Array): number {
    let volume = 0;
    for (let i = 1; i < spectrum.length; i++) {
        volume += spectrum[i] * spectrum[i] * i * i;
    }
    return volume;
}

function getVolumeInBand(spectrum: Float64Array, volumeInBand: Float32Array): void {
    for (let i = 1; i < spectrum.length; i++) {
        volumeInBand[i - 1] = spectrum[i] * spectrum[i] * i * i;
    }
}

async function saveZip(filePath: string, content: Float32Array): Promise<void> {
    const source = new Readable();
    source.push(new Uint8Array(content.buffer));
    source.push(null);

    const gz = zlib.createGzip({
        level: zlib.constants.Z_BEST_COMPRESSION
    });

    await pipeline(source, gz, createWriteStream(filePath));
}

void main().catch(err => console.error(err));
