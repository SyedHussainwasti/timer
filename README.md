# Stopwatch

A clean stopwatch with millisecond precision, lap tracking, and fastest/slowest
lap highlighting.

## How to use

Open `index.html`. **Start**/**Stop** the clock, **Lap** to record splits
(latest first, fastest lap in green, slowest in red), **Reset** to clear.

## How it works

- Time is derived from monotonic timestamps (`performance.now()`), so display
  refreshes via `requestAnimationFrame` never accumulate drift.
- Laps store both the split time and the running total; highlighting compares
  split times once at least two laps exist.
- 100% client-side, zero network requests.
