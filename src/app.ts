import { Enumerable } from "es2018-linq";
import { Application, DisplayObject, Rectangle, Sprite } from "pixi.js";
import { load, texture } from "./assets";
import { OrbitalRing } from "./display/orbitalRing";
import { PuzzlePiece } from "./display/puzzlePiece";

export class PuzzleApp extends Application {

    public async init(): Promise<void> {
        await load();
        console.log("Assets have been loaded.");

        this.stage.addChild(...[...this.#stageChildren(new Rectangle(0, 0, this.screen.width / this.stage.scale.x, this.screen.height / this.stage.scale.y))].reverse());
    }

    *#stageChildren(screen: Rectangle): Iterable<DisplayObject> {
        const mikuScale = 0.3;

        const centrePuzzle = new Sprite(texture("puzzle-centre"));
        centrePuzzle.anchor.set(0.5);
        centrePuzzle.scale.set(mikuScale, mikuScale);
        centrePuzzle.x = screen.width / 2;
        centrePuzzle.y = screen.height / 2;
        yield centrePuzzle;

        const centrePuzzleGlow = new Sprite(texture("puzzle-centre-glow"));
        centrePuzzleGlow.anchor.set(0.5);
        centrePuzzleGlow.scale.set(mikuScale, mikuScale);
        centrePuzzleGlow.x = screen.width / 2;
        centrePuzzleGlow.y = screen.height / 2;
        yield centrePuzzleGlow;

        const puzzleRing = new OrbitalRing(Enumerable.range(0, 500).select(_ => new PuzzlePiece()).toArray(), {
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
