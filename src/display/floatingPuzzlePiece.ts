import { BLEND_MODES, Container, Sprite, Ticker } from "pixi.js";
import { binary, texture } from "../assets";
import { BPM, FRAME_RATE } from "../config";

export class FloatingPuzzlePiece extends Container {

    readonly #piece: Sprite;
    readonly #glow: Sprite;
    readonly #volume: Float32Array;

    readonly #periodMs = 8 * FRAME_RATE * 1000 / BPM;

    public constructor(autoUpdate: boolean = true) {
        super();

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.lastTime), this);
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

    public update(elapsedMs: number): void {
        const progress = elapsedMs / this.#periodMs;
        const progressRad = (progress - Math.floor(progress)) * 2 * Math.PI;

        this.#piece.rotation = Math.cos(progressRad) * 0.04;
        this.#piece.y = Math.sin(progressRad) * 12;
        this.#glow.y = this.#piece.y;

        const frame = Math.floor(elapsedMs / 1000 * FRAME_RATE);
        this.#glow.alpha = (Math.log(this.#volume[frame]) - 15) / 30;
    }
}
