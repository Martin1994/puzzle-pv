import { BLEND_MODES, Container, Sprite, Ticker } from "pixi.js";
import { binary, texture } from "../assets";
import { BPM, FRAME_RATE } from "../config";

export class FloatingPuzzlePiece extends Container {

    static readonly #GLOW_HALFLIFE_MS = 100;
    static readonly #GLOW_HALFLIFE_POW = Math.exp(Math.log(0.5) / FloatingPuzzlePiece.#GLOW_HALFLIFE_MS)

    readonly #piece: Sprite;
    readonly #glow: Sprite;
    readonly #volume: Float32Array;

    readonly #periodMs = 8 * FRAME_RATE * 1000 / BPM;

    #elapsedMs: number = 0;

    public constructor(autoUpdate: boolean = true) {
        super();

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.deltaMS), this);
        }

        this.#volume = new Float32Array(binary("volume"));

        this.#glow = new Sprite(texture("puzzle-centre-glow"));
        this.#glow.anchor.set(0.5);
        this.#glow.blendMode = BLEND_MODES.ADD;
        this.#glow.alpha = 0;
        this.addChild(this.#glow);

        this.#piece = new Sprite(texture("puzzle-centre"));
        this.#piece.anchor.set(0.5);
        this.addChild(this.#piece);
    }

    public update(deltaMs: number): void {
        this.#elapsedMs += deltaMs;
        const progress = this.#elapsedMs / this.#periodMs;
        const progressRad = (progress - Math.floor(progress)) * 2 * Math.PI;

        this.#piece.rotation = Math.cos(progressRad) * 0.04;
        this.#piece.y = Math.sin(progressRad) * 12;
        this.#glow.y = this.#piece.y;

        const frame = Math.floor(this.#elapsedMs / 1000 * FRAME_RATE);
        const targetAlpha = (Math.log(this.#volume[frame]) - 15) / 25;
        if (this.#elapsedMs > 255500) {
            this.#glow.alpha = 0;
        } else if (targetAlpha < this.#glow.alpha) {
            this.#glow.alpha = targetAlpha + (this.#glow.alpha - targetAlpha) * Math.pow(FloatingPuzzlePiece.#GLOW_HALFLIFE_POW, deltaMs);
        } else {
            this.#glow.alpha = targetAlpha;
        }
    }
}
