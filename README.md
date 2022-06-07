## Prepare audio data

Generate raw audio:

```shell
ffmpeg -i ./puzzle.mp3 -f f64le -c:a pcm_f64le -ac 1 puzzle.raw
```



