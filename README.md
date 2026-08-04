 [Подробная презентация и разбор функционала](https://circular-citron-a0b.notion.site/Runich-2529e9858819472abb55d104d5fcf324)

## Android background location testing

Start an Android Emulator, grant Runich foreground and background location permissions, then start the activity. To replay the bundled route as a stream of GPS points:

```bash
yarn location:android:route
```

The default route is `scripts/routes/runich-moscow.gpx`, interpolates it to 3,000 points, and sends a point every 100 ms. Use a different route, point count, interval, or emulator with:

```bash
yarn location:android:route --route scripts/routes/runich-moscow.gpx --points 5000 --interval 100
yarn location:android:route --device emulator-5554
```

Alternatively, open the emulator's `More (...)` menu, choose `Location → Routes`, and import the GPX file. The `Routes` tab supports playback speed and repeat playback.
