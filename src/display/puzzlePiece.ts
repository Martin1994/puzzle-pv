import { GlowFilter } from "pixi-filters";
import { BLEND_MODES, Sprite, Ticker } from "pixi.js";
import { texture } from "../assets";
import { Math3D, Matrix3D, Vector3D } from "../math/3d";

export class PuzzlePiece extends Sprite {

    readonly #periodMs: number;
    readonly #constantTransform: Matrix3D;
    readonly #axis: Vector3D;

    #progress: number;

    public readonly glow?: Sprite;

    public constructor(realtime: boolean, autoUpdate: boolean = true) {
        super(texture("puzzle-piece"));

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.updateDelta(Ticker.shared.deltaMS), this);
        }

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
        if (realtime) {
            this.glow = new Sprite(texture("puzzle-piece-glow"));
            this.glow.anchor.x = 0.5;
            this.glow.anchor.y = 0.5;
            this.glow.scale.x = scale / 2;
            this.glow.scale.y = scale / 2;
            this.glow.x = this.x;
            this.glow.y = this.y;
            this.glow.blendMode = BLEND_MODES.NORMAL;
            this.glow.alpha = 0.1;
        } else {
            this.filters = [new GlowFilter({ distance: 50, outerStrength: 2 })];
        }
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

    get #dynamicTransform(): Matrix3D {
        const radius = 2 * Math.PI * this.#progress;
        return Math3D.rotationMatrix(this.#axis, radius);
    }
}
