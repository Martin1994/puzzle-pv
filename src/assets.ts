/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Loader, LoaderResource, Texture } from "pixi.js";
import { inflate } from "pako";

const textureList = {
    "background": "bg.png",
    "miku": "miku.png",
    "puzzle-centre-glow": "puzzle-centre-glow.png",
    "puzzle-centre": "puzzle-centre.png",
    "puzzle-piece": "puzzle-piece.png",
    "puzzle-piece-glow": "puzzle-piece-glow.png"
} as const;

const binaryList = {
    "volume": "puzzle.volume.gz",
    "volume-in-band": "puzzle.volume-in-band.gz"
} as const;

type AssetKey = TextureKey | BinaryKey;
type TextureKey = keyof typeof textureList;
type BinaryKey = keyof typeof binaryList;

const loader = new Loader();

for (const textureKey of Object.keys(textureList)) {
    loader.add(textureKey, `assets/${textureList[textureKey as TextureKey]}`);
}

for (const binaryKey of Object.keys(binaryList)) {
    loader.add(binaryKey, `assets/${binaryList[binaryKey as BinaryKey]}`, {
        xhrType: LoaderResource.XHR_RESPONSE_TYPE.BUFFER
    });
}

let resources: Record<AssetKey, LoaderResource> | undefined = undefined;

export async function load(): Promise<void> {
    resources = await new Promise((resolve, _reject)=> loader.load((_loader, resources) => resolve(resources as Record<AssetKey, LoaderResource>)));

    for (const textureKey of Object.keys(textureList)) {
        if (!resources![textureKey as TextureKey].texture) {
            throw new Error(`Resource ${textureKey} is not a texture.`);
        }
    }

    for (const binaryKey of Object.keys(binaryList)) {
        if (!(resources![binaryKey as BinaryKey].data instanceof ArrayBuffer)) {
            throw new Error(`Resource ${binaryKey} is not binary data.`);
        }
        resources![binaryKey as BinaryKey].data = inflate(resources![binaryKey as BinaryKey].data as ArrayBuffer).buffer;
    }
}

export function texture(key: TextureKey): Texture {
    if (!resources) {
        throw new Error("Application is still loading assets.");
    }
    return resources[key].texture!;
}

export function binary(key: BinaryKey): ArrayBuffer {
    if (!resources) {
        throw new Error("Application is still loading assets.");
    }
    return resources[key].data as ArrayBuffer;
}
