import { Enumerable } from "es2018-linq";
import { Application, Container, DisplayObject, Rectangle, Sprite } from "pixi.js";
import { load, text, texture } from "./assets";
import { Clip } from "./display/clip";
import { FloatingPuzzlePiece } from "./display/floatingPuzzlePiece";
import { Lyrics } from "./display/lyrics";
import { OrbitalRing } from "./display/orbitalRing";
import { PuzzlePiece } from "./display/puzzlePiece";
import { Spectrum } from "./display/spectrum";

export class PuzzleApp extends Application {

    public async init(): Promise<void> {
        await load();
        console.log("Assets have been loaded.");

        this.stage.addChild(...[...this.#stageChildren(this.screen)].reverse());
    }

    *#stageChildren(screen: Rectangle): Iterable<DisplayObject> {
        const mikuScale = 0.3;

        const spectrum = new Clip(111200, 155000);
        spectrum.addChild(new Spectrum(100, 2000));
        spectrum.x = screen.width * 0.9 - 450;
        spectrum.y = screen.height * 0.9;
        yield spectrum;

        const lyrics = new Lyrics(text("puzzle-lyrics"));
        lyrics.x = screen.width * 0.9;
        lyrics.y = screen.height * 0.9;
        yield lyrics;

        const centrePiece = new FloatingPuzzlePiece();
        centrePiece.scale.set(mikuScale, mikuScale);
        centrePiece.x = screen.width * (0.5 - 0.0395);
        centrePiece.y = screen.height * (0.5 - 0.3255);
        yield centrePiece;

        const puzzleRing = new OrbitalRing(Enumerable.range(0, 400).select(_ => {
            const container = new Container();
            const piece = new PuzzlePiece();
            container.addChild(piece.glow);
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
        miku.scale.set(mikuScale, mikuScale);
        miku.x = screen.width / 2;
        miku.y = screen.height / 2 + 50;
        yield miku;

        puzzleRing.back.x = screen.width / 2 + 50;
        puzzleRing.back.y = screen.height / 2 - 150;
        yield puzzleRing.back;

        const background = new Sprite(texture("background"));
        background.anchor.set(0.5);
        background.scale.set(0.45, 0.45);
        background.x = screen.width / 2;
        background.y = screen.height / 2;
        yield background;
    }
}
