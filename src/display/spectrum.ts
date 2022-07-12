import { Enumerable } from "es2018-linq";
import { Container, DisplayObject, Graphics, Ticker } from "pixi.js";
import { binary } from "../assets";
import { FFT_WINDOW, FRAME_RATE, SAMPLE_RATE } from "../config";

export class Spectrum extends Container {

    #elapsedMs: number = 0;

    readonly #bars: (DisplayObject | undefined)[];
    readonly #volumeInBand: Float32Array;

    static readonly #SPECTRUM_SIZE = FFT_WINDOW / 2;

    static readonly #BAR_HALFLIFE_MS = 67;
    static readonly #BAR_HALFLIFE_POW = Math.exp(Math.log(0.5) / Spectrum.#BAR_HALFLIFE_MS);

    public constructor(frequencyStart: number, frequencyEnd: number, autoUpdate: boolean = true) {
        super();

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.deltaMS), this);
        }

        this.#bars = Enumerable.range(0, 512).select(i => {
            const frequency = SAMPLE_RATE / FFT_WINDOW * (i + 1);

            if (frequency < frequencyStart || frequency > frequencyEnd) {
                return undefined;
            }

            const bar = new Graphics();

            bar.beginFill(0x1e768d);
            bar.drawRect(-1, 0.5, 2, -1);

            bar.x = i * 5;

            this.addChild(bar);
            return bar;
        }).toArray();

        this.#volumeInBand = new Float32Array(binary("volume-in-band"));
    }

    public update(deltaMs: number): void {
        this.#elapsedMs += deltaMs;

        const frame = Math.floor(this.#elapsedMs / 1000 * FRAME_RATE);
        const offset = frame * Spectrum.#SPECTRUM_SIZE;
        for (let i = 0; i < Spectrum.#SPECTRUM_SIZE; i++) {
            const bar = this.#bars[i];
            if (!bar) {
                continue;
            }

            const volume = this.#volumeInBand[offset + i];
            const targetHeight = Math.max(0, (Math.log(volume) - 15 / 25));
            const currentHeight = bar.scale.y;
            if (targetHeight < currentHeight) {
                bar.scale.y = targetHeight + (currentHeight - targetHeight) * Math.pow(Spectrum.#BAR_HALFLIFE_POW, deltaMs);
            } else {
                bar.scale.y = targetHeight;
            }
        }
    }

}
