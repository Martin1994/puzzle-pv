import { Container, Text, TextStyle, Ticker } from "pixi.js";
import { BPM } from "../config";

export class Lyrics extends Container {

    static readonly #LINE_MATCHER = /\[(\d\d)\:(\d\d)\.(\d\d)\](.*)/;
    static readonly #TRANSITION_MS = 60 / BPM * 1000;

    readonly #lines: string[] = [];
    readonly #timestamps: number[] = [];

    readonly #front: Text;
    readonly #back: Text;

    #currentLine: number = -1;
    #elapsedMs: number = 0;

    public constructor(lrc: string, autoUpdate: boolean = true) {
        super();

        if (autoUpdate) {
            Ticker.shared.add(_delta => this.update(Ticker.shared.deltaMS), this);
        }

        for (const line of lrc.split("\n")) {
            if (line === "") {
                continue;
            }

            const matches = line.match(Lyrics.#LINE_MATCHER);
            if (!matches || !matches[0] || !matches[1] || !matches[2] || !matches[3]) {
                continue;
            }

            this.#lines.push(matches[4]);
            this.#timestamps.push(parseInt(matches[1], 10) * 60000 + parseInt(matches[2], 10) * 1000 + parseInt(matches[3], 10) * 10);
        }
        this.#lines.push("");
        this.#timestamps.push(Infinity);

        this.#front = this.#makeText();
        this.#back = this.#makeText();

        this.addChild(this.#front);
        this.addChild(this.#back);
    }

    #makeText(): Text {
        const style = new TextStyle({
            fontFamily: ["Noto Serif SC", "SimSum", "ST Song", "serif"],
            fontSize: 36,
            fontWeight: "bold",
            fill: ["#16677f", "#1e768d"],
            dropShadow: true,
            dropShadowColor: "#ffffff",
            dropShadowBlur: 10,
            dropShadowAngle: 0,
            dropShadowDistance: 0,
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
        }
    }
}
