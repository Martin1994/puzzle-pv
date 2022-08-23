import { Container, Ticker } from "pixi.js";
import { BPM } from "../config";

export class Clip extends Container {

    public static readonly TRANSITION_MS = 60 / BPM * 1000;

    readonly #startMs: number;
    readonly #endMs: number;
    readonly #transitionMs: number;

    #elapsedMs: number = 0;

    public constructor(startMs: number, endMs: number, transitionMs: number = Clip.TRANSITION_MS, autoUpdate: boolean = true) {
        super();

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.deltaMS), this);
        }

        this.#startMs = startMs;
        this.#endMs = endMs;
        this.#transitionMs = transitionMs;

        this.visible = false;
        this.alpha = 0;
    }

    public update(deltaMs: number): void {
        this.#elapsedMs += deltaMs;

        if (this.#elapsedMs < this.#startMs || this.#elapsedMs > this.#endMs) {
            this.visible = false;
            return;
        }

        this.visible = true;
        this.alpha = Math.min(
            1,
            (this.#elapsedMs - this.#startMs) / this.#transitionMs,
            (this.#endMs - this.#elapsedMs) / this.#transitionMs
        );
    }

}