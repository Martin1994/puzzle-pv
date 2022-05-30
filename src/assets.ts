/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Loader, LoaderResource, Texture } from "pixi.js";

const textureList = {
    "background": "assets/bg.png",
    "miku": "assets/miku.png",
    "puzzle-centre-glow": "assets/puzzle-centre-glow.png",
    "puzzle-centre": "assets/puzzle-centre.png",
    "puzzle-piece": "assets/puzzle-piece.png"
} as const;

type AssetKey = TextureKey;
type TextureKey = keyof typeof textureList;

const loader = new Loader();

for (const textureKey of Object.keys(textureList)) {
    loader.add(textureKey, textureList[textureKey as TextureKey]);
}

let resources: Record<TextureKey, LoaderResource> | undefined = undefined;

export async function load(): Promise<void> {
    resources = await new Promise((resolve, _reject)=> loader.load((_loader, resources) => resolve(resources as Record<AssetKey, LoaderResource>)));

    for (const textureKey of Object.keys(textureList)) {
        if (!resources![textureKey as TextureKey].texture) {
            throw new Error(`Resource ${textureKey} is not a texture`);
        }
    }
}

export function texture(key: AssetKey): Texture {
    if (!resources) {
        throw new Error("Application is still loading assets.");
    }
    return resources[key].texture!;
}
