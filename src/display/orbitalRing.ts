import { Container, DisplayObject, Ticker } from "pixi.js";
import { Math3D, Vector3D } from "../math/3d";

export interface OrbitalGeometry {
    readonly a: Readonly<Vector3D>;
    readonly b: Readonly<Vector3D>;
    readonly c: Readonly<Vector3D>;
    readonly camera: Readonly<Vector3D>;
    readonly periodMs: number;
}

class Particle extends Container {

    readonly #geometry: OrbitalGeometry;
    readonly #frontContainer: Container;
    readonly #backContainer: Container;
    readonly #referenceDistance: number;
    #atFront: boolean = false;

    public constructor(child: DisplayObject, progress: number, geometry: OrbitalGeometry, frontContainer: Container, backContainer: Container) {
        super();

        this.addChild(child);

        this.#frontContainer = frontContainer;
        this.#backContainer = backContainer;
        this.#geometry = geometry;
        backContainer.addChild(this);
        this.#referenceDistance = Math3D.distance(geometry.camera, { x: geometry.camera.x, y: geometry.camera.y, z: this.#frontCutZ });
        this.progress = progress;
    }

    set #location3D(location3D: Readonly<Vector3D>) {
        // Swap container
        const wasAtFront = this.#atFront;
        this.#atFront = location3D.z < this.#frontCutZ;
        if (wasAtFront !== this.#atFront) {
            (wasAtFront ? this.#frontContainer : this.#backContainer).removeChild(this);
            (wasAtFront ? this.#backContainer : this.#frontContainer).addChild(this);
        }

        const scale = this.#referenceDistance / Math3D.distance(location3D, this.#geometry.camera);

        // Re-location
        this.x = location3D.x * scale;
        this.y = location3D.y * scale;

        // Re-order
        this.zIndex = -location3D.z;

        // Re-size
        this.scale.x = scale;
        this.scale.y = scale;
    }

    #progress: number = 0;
    public get progress(): number {
        return this.#progress;
    }
    public set progress(progress: number) {
        this.#progress = progress - Math.floor(progress);
        const angle = Math.PI * 2 * this.#progress;
        this.#location3D = {
            x: Math.cos(angle) * this.#geometry.a.x + Math.sin(angle) * this.#geometry.b.x + this.#geometry.c.x,
            y: Math.cos(angle) * this.#geometry.a.y + Math.sin(angle) * this.#geometry.b.y + this.#geometry.c.y,
            z: Math.cos(angle) * this.#geometry.a.z + Math.sin(angle) * this.#geometry.b.z + this.#geometry.c.z
        };
    }

    get #frontCutZ(): number {
        return this.#geometry.c.z;
    }
}

export class OrbitalRing {
    readonly #front = new Container();
    public get front(): DisplayObject {
        return this.#front;
    }

    readonly #back = new Container();
    public get back(): DisplayObject {
        return this.#back;
    }

    readonly #particles: Particle[] = [];
    readonly #geometry: OrbitalGeometry;

    public constructor(particles: DisplayObject[], geometry: OrbitalGeometry, autoUpdate: boolean = true) {
        this.#front.sortableChildren = true;
        this.#back.sortableChildren = true;

        this.#geometry = geometry;

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.deltaMS), this);
        }

        const quantity = particles.length;
        for (let i = 0; i < quantity; i++) {
            const particle = new Particle(particles[i], (i + Math.random() * 5) / quantity, geometry, this.#front, this.#back);
            this.#particles.push(particle);
        }
    }

    public update(deltaMs: number): void {
        const deltaProgress = deltaMs / this.#geometry.periodMs;

        for (const particle of this.#particles) {
            particle.progress += deltaProgress;
        }
    }
}
