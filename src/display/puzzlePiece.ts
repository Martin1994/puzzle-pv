// import { GlowFilter } from "pixi-filters";
import { BLEND_MODES, Sprite, Ticker } from "pixi.js";
import { binary, texture } from "../assets";
import { FFT_WINDOW, FRAME_RATE } from "../config";
import { Math3D, Matrix3D, Vector3D } from "../math/3d";

export class PuzzlePiece extends Sprite {

    readonly #periodMs: number;
    readonly #constantTransform: Matrix3D;
    readonly #axis: Vector3D;
    readonly #volumeInBand: Float32Array;
    readonly #band: number;

    #progress: number;

    public readonly glow: Sprite;

    public constructor(position: number, autoUpdate: boolean = true) {
        super(texture("puzzle-piece"));

        if (autoUpdate) {
            Ticker.shared.add(_delta => {
                this.updateDelta(Ticker.shared.deltaMS);
                this.updateElapsed(Ticker.shared.lastTime);
            }, this);
        }

        this.#band = 1 + Math.floor(position * 0.4 * FFT_WINDOW / 2);
        this.#volumeInBand = new Float32Array(binary("volume-in-band"));

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        // Position jitter
        this.#constantTransform = Math3D.rotationMatrix(Math3D.randomSphere(), Math.random() * 2 * Math.PI);

        const scale = 0.15 * (1 + (Math.random() - 0.5) * 0.2);
        this.#constantTransform.d00 *= scale;
        this.#constantTransform.d01 *= scale;
        this.#constantTransform.d02 *= scale;
        this.#constantTransform.d10 *= scale;
        this.#constantTransform.d11 *= scale;
        this.#constantTransform.d12 *= scale;
        this.#constantTransform.d20 *= scale;
        this.#constantTransform.d21 *= scale;
        this.#constantTransform.d22 *= scale;

        const offDistance = Math.pow(Math.random(), 2) * 100;
        const offRotation = Math.random() * 2 * Math.PI;
        this.x = offDistance * Math.cos(offRotation);
        this.y = offDistance * Math.sin(offRotation);

        this.#progress = Math.random();
        this.#axis = Math3D.randomSphere();

        this.#periodMs = Math.pow(Math.random(), 0.25) * 30000;
        this.#periodMs += 10000;

        // Initialize transformation
        this.updateDelta(0);

        // Glow
        // this.filters = [new GlowFilter({ distance: 50, outerStrength: 2 })];
        this.glow = new Sprite(texture("puzzle-piece-glow"));
        this.glow.anchor.x = 0.5;
        this.glow.anchor.y = 0.5;
        this.glow.scale.x = scale / 2;
        this.glow.scale.y = scale / 2;
        this.glow.x = this.x;
        this.glow.y = this.y;
        this.glow.blendMode = BLEND_MODES.NORMAL;
        this.glow.alpha = 0.1;
    }

    public updateDelta(deltaMs: number): void {
        this.#progress += deltaMs / this.#periodMs;
        this.#progress -= Math.floor(this.#progress);

        const transform3D = Math3D.matrixMultiply(this.#constantTransform, this.#dynamicTransform);

        // Translate back to 2D transformation
        this.scale.x = Math.sqrt(transform3D.d00 * transform3D.d00 + transform3D.d10 * transform3D.d10);
        this.scale.y = Math.sqrt(transform3D.d01 * transform3D.d01 + transform3D.d11 * transform3D.d11);
        this.skew.y = Math.atan2(transform3D.d10, transform3D.d00);
        this.skew.x = -Math.atan2(-transform3D.d01, transform3D.d11);
    }

    public updateElapsed(elapsedMs: number): void {
        const frame = Math.floor(elapsedMs / 1000 * FRAME_RATE);
        const volume = this.#volumeInBand[frame * FFT_WINDOW / 2 + this.#band];
        this.#brightness = (Math.log(volume) - 15) / 25;

        const log = Math.log(volume);
        // eslint-disable-next-line
        if (!(Math.max((window as any)["maxV"], log) > log)) {
            // eslint-disable-next-line
            (window as any)["maxV"] = log;
        }
    }

    get #dynamicTransform(): Matrix3D {
        const radius = 2 * Math.PI * this.#progress;
        return Math3D.rotationMatrix(this.#axis, radius);
    }

    set #brightness(level: number) {
        if (level < 0) {
            level = 0;
        }
        if (level > 1) {
            level = 1;
        }

        this.glow.alpha = 0.05 + 0.5 * level;
    }
}
