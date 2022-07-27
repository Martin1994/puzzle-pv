import { from } from "es2018-linq";
import { MotionBlurFilter } from "pixi-filters";
import { Container, DisplayObject, Text, TextStyle, Ticker } from "pixi.js";
import { BPM } from "../config";
import { Clip } from "./clip";

export class Lyrics extends Container {

    static readonly #LINE_MATCHER = /^\[(\d\d)\:(\d\d)\.(\d\d)\](.*)$/;
    static readonly #METADATA_MATCHER = /^\[(.+)\:(.*)\]$/;
    static readonly #TRANSITION_MS = 60 / BPM * 1000;

    readonly #lines: string[] = [];
    readonly #timestamps: number[] = [];

    readonly #front: Text;
    readonly #back: Text;

    readonly #frontBlur = new MotionBlurFilter(undefined, 17);

    #currentLine: number = -1;
    #elapsedMs: number = 0;

    public constructor(lrc: string, autoUpdate: boolean = true) {
        super();

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.deltaMS), this);
        }

        let title: string | undefined = undefined;

        this.#lines.push("");
        this.#timestamps.push(0);

        for (const line of lrc.split("\n")) {
            if (line === "") {
                continue;
            }

            const matches = line.match(Lyrics.#LINE_MATCHER);
            if (!matches || !matches[0] || !matches[1] || !matches[2] || !matches[3]) {
                const metaMatches = line.match(Lyrics.#METADATA_MATCHER);

                if (metaMatches && metaMatches[1] === "ti") {
                    title = metaMatches[2];
                }

                continue;
            }

            this.#lines.push(matches[4]);
            this.#timestamps.push(parseInt(matches[1], 10) * 60000 + parseInt(matches[2], 10) * 1000 + parseInt(matches[3], 10) * 10);
        }

        this.#lines.push("");
        this.#timestamps.push(Infinity);

        this.#front = this.#makeText();
        this.#front.filters = [this.#frontBlur];
        this.#back = this.#makeText();

        if (title) {
            this.addChild(this.#makeTitleClip(title));
        }

        this.addChild(this.#front);
        this.addChild(this.#back);
    }

    #makeTitleClip(title: string): DisplayObject {
        const titleText = this.#makeText();
        titleText.style.fontSize = 90;
        titleText.style.letterSpacing = 40;
        titleText.style.dropShadowBlur = 30;
        titleText.style.stroke = 0xffffff;
        titleText.style.strokeThickness = 5;
        titleText.style.padding = 30;
        titleText.y = -150;
        titleText.text = title;

        const firstTextBlockStart = from(this.#lines).zip(this.#timestamps).first(([line, _timestamp]) => line !== "")[1];
        const firstTextBlockEnd = from(this.#lines).zip(this.#timestamps).skipWhile(([line, _timestamp]) => line === "").first(([line, _timestamp]) => line === "")[1];

        const titleClip = new Clip(
            firstTextBlockStart - Clip.TRANSITION_MS,
            firstTextBlockEnd
        );
        titleClip.addChild(titleText);
        return titleClip;
    }

    #makeText(): Text {
        const style = new TextStyle({
            fontFamily: ["lyric-font", "Noto Serif SC", "SimSum", "ST Song", "serif"],
            fontSize: 36,
            fontWeight: "bold",
            fill: ["#16677f", "#1e768d"],
            dropShadow: true,
            dropShadowColor: "#ffffff",
            dropShadowBlur: 10,
            dropShadowAngle: 0,
            dropShadowDistance: 0,
            letterSpacing: 3,
            padding: 10,
            wordWrap: false
        });
        const text = new Text("", style);
        text.anchor.x = 1;
        text.anchor.y = 0.5;
        return text;
    }

    public update(deltaMs: number): void {
        this.#elapsedMs += deltaMs;

        let dirty = false;
        while (this.#elapsedMs >= this.#timestamps[this.#currentLine + 1]) {
            this.#currentLine++;
            dirty = true;
        }

        const lineEnd = this.#timestamps[this.#currentLine + 1];

        if (dirty) {
            this.#front.text = this.#lines[this.#currentLine];
            this.#back.text = this.#lines[this.#currentLine + 1];
            this.#back.visible = false;
            this.#front.alpha = 1;
            this.#front.y = 0;
            this.#frontBlur.enabled = false;
        }

        const displacement = 40;
        if (this.#elapsedMs > lineEnd - Lyrics.#TRANSITION_MS) {
            this.#back.visible = true;
            const progress = 1 - (lineEnd - this.#elapsedMs) / Lyrics.#TRANSITION_MS;
            const offset = (-Math.cos(Math.PI * progress) + 1) / 2;
            this.#front.y = -displacement * offset;
            this.#front.alpha = 1 - offset;
            this.#back.y = displacement * (1 - offset);
            this.#back.alpha = offset;
            this.#frontBlur.enabled = true;
            this.#frontBlur.velocity.x = 30 * Math.pow(progress, 2);
        }
    }
}
