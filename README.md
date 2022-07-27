## Prepare audio data

```shell
ffmpeg -i ./static/assets/puzzle.mp3 -f f64le -c:a pcm_f64le -ac 1 ./static/assets/puzzle.raw
npm run preprocess
```

## Local playback

```shell
npm run dev
```

http://127.0.0.1:5001/

To play from the middle:

http://127.0.0.1:5001/?skip={seconds}
