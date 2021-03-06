import { Container, Ticker } from "pixi.js";

export class Clip extends Container {

    static readonly #TRANSITION_MS = 500;

    readonly #startMs: number;
    readonly #endMs: number;

    #elapsedMs: number = 0;

    public constructor(startMs: number, endMs: number, autoUpdate: boolean = true) {
        super();

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.deltaMS), this);
        }

        this.#startMs = startMs;
        this.#endMs = endMs;

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
            (this.#elapsedMs - this.#startMs) / Clip.#TRANSITION_MS,
            (this.#endMs - this.#elapsedMs) / Clip.#TRANSITION_MS
        );
    }

}