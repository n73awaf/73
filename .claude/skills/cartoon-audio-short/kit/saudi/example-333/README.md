Worked example «الساعة ٣:٣٣» (Saudi street + interiors, main character, black shadow monster, Arabic captions).
To reuse: run kit/tools/setup.sh, then copy main.js, story.js, layout.js, caps.js, index.html into web/, saudi.js into web/ and
rebuild web/toon.js = toonbase.js + roman.js + saudi.js; replace web/timing.js with the new story timing (Whisper word times),
and rewrite story.js (shots, cameras, actors). render.mjs here calls window.grab (3D + captions). Render with 4 parallel
processes (about 3.3 s/frame each, ~35 min for two minutes). Mix with kit/tools/mix.py (voice-first).
