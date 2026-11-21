# 🏮 Lantern Harbor — Spot the Difference

[![bounty](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Indramunggahari10/best-spot-the-difference-game-20261121-0451-ono10/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Indramunggahari10/best-spot-the-difference-game-20261121-0451-ono10/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A complete spot-the-difference game for the desktop browser, built for the
[make.fun](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
competition **best-spot-the-difference-game-20261121-0451**. Two near-identical
pictures hang side by side; the right one hides the changes. Click every
difference, watch the gold rings land, and clear all three scenes.

## The game

Three original hand-drawn scenes, 29 differences in all, all art painted live
with the Canvas 2D API — no image or sound files, no network requests:

1. **Harbor Dawn** — 7 differences: a fishing harbor at sunrise, lighthouse,
   sailboats, a dock cat and a buoy that changes color.
2. **Night Market** — 10 differences: lantern strings, orange piles, steamer
   baskets, a banner that changes sign and a kite in the night sky.
3. **Lantern Festival** — 12 differences: fireworks, a pagoda, an arched
   bridge, floating lanterns, a koi and a jumping fish.

## How it plays

- **Click** a difference on either panel — a gold ring with a tick marks it
  on both sides. Clicks on an already-found difference are free reminders.
- **Counter** up top always shows `Found X of Y — Z to go`; the timer runs
  and every find adds 100 points plus a streak bonus.
- **Wrong clicks** cost 10 points and leave a fading red X; **hints** (H or
  the 💡 button, 3 per level) pulse a gold ring around an unfound difference
  for 50 points.
- **Hold Shift** for a 2× magnifier lens that follows the cursor — the
  sharp-eyed player's best friend.
- **Keyboard:** H hint · R restart level · N next scene · M mute · Esc level
  select · 1/2/3 pick a scene.
- Sounds are synthesized live with the Web Audio API (find chime, miss buzz,
  hint sparkle, win fanfare). Best score per scene is kept in localStorage.
- Level-clear and festival-complete screens show time, accuracy, misses and
  the time bonus.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

or serve `game/` with any static server. `game/index.html` opens in desktop
Chrome and plays offline; every file it loads lives under `game/`.

Screenshot helper: `?level=2&found=4` opens a level with its first
differences already marked, and `?level=1&complete=1` shows the clear screen
— used to take the screenshots in `screenshots/`.

## Layout

- `main.ts` — the entrypoint: copies `game/` + `screenshots/` to
  `$MAKEFUN_OUTPUT_DIR` and writes `dossier.json` with the vendored
  `vendor/makefun-game.ts` library, then reads the dossier back and verifies
  the bytes match.
- `game/index.html`, `game/styles.css` — page and look.
- `game/src/main.js` — boot. `game/src/game.js` — state, scoring, timer,
  hints, level flow, animation loop. `game/src/scenes.js` — the three scene
  painters and their difference lists. `game/src/render.js` — panel painting,
  markers, miss marks, hint pulse, magnifier. `game/src/input.js` — mouse and
  keyboard. `game/src/ui.js` — HUD and overlay screens. `game/src/audio.js` —
  synthesized sounds.
- `screenshots/` — 4 real renders of the game's own code in a browser.

## License

MIT — see [LICENSE](LICENSE).
