import { Enumerable, from } from "es2018-linq";
import { GlowFilter } from "pixi-filters";
import { Application, Container, DisplayObject, Graphics, IApplicationOptions, Rectangle, Sprite } from "pixi.js";
import { load, text, texture } from "./assets";
import { Clip } from "./display/clip";
import { FloatingPuzzlePiece } from "./display/floatingPuzzlePiece";
import { Lyrics } from "./display/lyrics";
import { OrbitalRing } from "./display/orbitalRing";
import { PuzzlePiece } from "./display/puzzlePiece";
import { Spectrum } from "./display/spectrum";

export interface IPuzzleAppOptions extends IApplicationOptions {
    realtime: boolean
}

export class PuzzleApp extends Application {

    readonly #realtime: boolean;

    public constructor(options?: IPuzzleAppOptions) {
        super(options);

        this.#realtime = options?.realtime ?? true;
    }

    public async init(): Promise<void> {
        await load();
        console.log("Assets have been loaded.");

        this.stage.addChild(...from(this.#stageChildren(this.screen)).reverse());
    }

    *#stageChildren(screen: Rectangle): Iterable<DisplayObject> {
        const fadeIn = new Clip(-Infinity, 3000, 3000);
        const fadeInBlock = new Graphics();
        fadeInBlock.beginFill(0x000000);
        fadeInBlock.drawRect(0, 0, screen.width, screen.height);
        fadeIn.addChild(fadeInBlock);
        yield fadeIn;


        yield* this.#lyricSection(screen);
        yield* this.#background(screen);
    }

    *#lyricSection(screen: Rectangle): Iterable<DisplayObject> {
        const spectrum = new Clip(114070, 157870);
        spectrum.addChild(new Spectrum(100, 2000));
        spectrum.x = screen.width * 0.9 - 450;
        spectrum.y = screen.height * 0.9;
        yield spectrum;

        const lyrics = new Lyrics(text("puzzle-lyrics"));
        lyrics.x = screen.width * 0.9;
        lyrics.y = screen.height * 0.9;
        yield lyrics;

        const presentsClip = new Clip(250870, Infinity);
        const presents = new Sprite(texture("presents"));
        presents.scale.x = 0.7;
        presents.scale.y = 0.7;
        presents.anchor.x = 1;
        presents.anchor.y = 0.5;
        presents.filters = [new GlowFilter({ distance: 7, outerStrength: 3, color: 0xffffff })];
        presentsClip.addChild(presents);
        presentsClip.x = screen.width * 0.9;
        presentsClip.y = screen.height * 0.85;
        yield presentsClip;
    }

    *#background(screen: Rectangle): Iterable<DisplayObject> {
        const centrePiece = new FloatingPuzzlePiece();
        centrePiece.scale.set(0.3, 0.3);
        centrePiece.x = screen.width * (0.5 - 0.0395);
        centrePiece.y = screen.height * (0.5 - 0.3255);
        yield centrePiece;

        const puzzleRing = new OrbitalRing(Enumerable.range(0, 400).select(_ => {
            const container = new Container();
            const piece = new PuzzlePiece(this.#realtime);
            if (piece.glow) {
                container.addChild(piece.glow);
            }
            container.addChild(piece);
            return container;
        }).toArray(), {
            a: { x: -600, y: -200, z: 0 },
            b: { x: -100, y: 100, z: -600 },
            c: { x: 0, y: 0, z: 0 },
            camera: { x: 0, y: 0, z: -2000 },
            periodMs: 120000
        });

        puzzleRing.front.x = screen.width / 2 + 50;
        puzzleRing.front.y = screen.height / 2 - 150;
        yield puzzleRing.front;

        const miku = new Sprite(texture("miku"));
        miku.anchor.set(0.5);
        miku.x = screen.width / 2;
        miku.y = screen.height / 2 + 50;
        yield miku;

        puzzleRing.back.x = screen.width / 2 + 50;
        puzzleRing.back.y = screen.height / 2 - 150;
        yield puzzleRing.back;

        const background = new Sprite(texture("background"));
        background.anchor.set(0.5);
        background.x = screen.width / 2;
        background.y = screen.height / 2;
        yield background;
    }
}
