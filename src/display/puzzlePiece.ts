import { GlowFilter } from "pixi-filters";
import { Sprite, Ticker } from "pixi.js";
import { texture } from "../assets";
import { Math3D, Matrix3D } from "../math/3d";

export class PuzzlePiece extends Sprite {

    readonly #periodMs: number;
    readonly #constantTransform: Matrix3D;
    readonly #axis: number;

    #progress: number;

    public constructor(autoUpdate: boolean = true) {
        super(texture("puzzle-piece"));

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.deltaMS), this);
        }

        this.anchor.x = 0.5;
        this.anchor.y = 0.5;

        // Style
        this.filters = [new GlowFilter({ distance: 50, outerStrength: 2 })];

        // Position jitter
        this.#constantTransform = Math3D.rotationMatrix({ x: 0, y: 0, z: 1 }, Math3D.randomSphere());

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
        this.#axis = Math.floor(Math.random() * 3);

        this.#periodMs = Math.pow(Math.random(), 0.25) * 30000;
        this.#periodMs += 10000;

        this.update(0);
    }

    public update(deltaMs: number): void {
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
        const cos = Math.cos(radius);
        const sin = Math.sin(radius);
        if (this.#axis === 0) {
            return {
                d00: 1, d01: 0, d02: 0,
                d10: 0, d11: cos, d12: -sin,
                d20: 0, d21: sin, d22: cos
            };
        } else if (this.#axis === 1) {
            return {
                d00: cos, d01: 0, d02: sin,
                d10: 0, d11: 1, d12: 0,
                d20: -sin, d21: 0, d22: cos
            };
        } else {
            return {
                d00: cos, d01: -sin, d02: 0,
                d10: sin, d11: cos, d12: 0,
                d20: 0, d21: 0, d22: 1
            };
        }
    }
}
