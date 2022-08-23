## Prepare assets
Place all asset files defined in `src/assets.ts` under `static/assets/`.

## Prepare audio data

```shell
ffmpeg -i ./static/assets/puzzle.m4a -f f64le -c:a pcm_f64le -ac 1 ./static/assets/puzzle.raw
npm run preprocess
```

## Local playback

```shell
npm run dev
```

http://127.0.0.1:5001/

To play from the middle:

http://127.0.0.1:5001/?skip={seconds}

## Build and bundle

```shell
npm run build
```

## Recording

```shell
npm run build && npm run dev
```

Output is under `./output/`.
