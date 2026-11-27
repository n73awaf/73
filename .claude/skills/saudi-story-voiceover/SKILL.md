---
name: saudi-story-voiceover
description: >
  Turn a story the user sends into a Saudi-dialect voiceover script with full diacritics (tashkeel/sukoon)
  ready for ElevenLabs, then build the 9:16 cartoon video from the recorded audio. Use whenever the user
  sends a story or says "قصة"، "حوّلها لفيديو"، "شكّلها"، "ضبط الحركات"، or uploads an ElevenLabs mp3 for a story.
---

# Saudi story → diacritized voiceover → video

## Step 1: Script (always do both, in this order)
1. **Numbers to words, Saudi spoken form.** No digits anywhere in the voiceover text.
   - 3:33 → «ثلاثة وثلاث وثلاثين» · 3:30 → «ثلاثة ونص» · 3:15 → «ثلاثة وربع» · 3:20 → «ثلاثة وثلث»
   - «الساعة ٣» → «الساعة ثلاثة» · «دقيقة واحدة» → «دقيقة وحدة»
2. **Saudi dialect wording** (keep the user's story and order; change only what dialect needs):
   وحدة، بدت، لفّت، يدوّر، يركض → يِرْكُضْ، بعدين، للحين، جوّاها، شفت، جات → جَتْ.
3. **Full tashkeel for the TTS, on dialect pronunciation, not Fusha:**
   - Sukoon on word endings (waqf): أَبْوَابْ، الْوَحْشْ، بِالشَّارِعْ. No tanween: «أبدًا» → «أَبَدْ».
   - Dialect verb forms with kasra on the prefix: يِسْمَعْ، تِفْتَحْ، يِمْشِي، تِنَامْ، بِتْخَاطْرُونْ.
   - Shadda on doubled letters; «وِ/وْ» before words as spoken: وْبِلَيْلَة، وِاللِّي.
   - Loanwords as spoken: بُورِي، الْبِيبِي.
   - Pronoun suffixes: هَا، هُمْ → «ـهُ» written with sukoon: خُطُواتُهْ.
   - Check the pronoun/gender of the narrator and the monster before finalizing.
4. Deliver: the diacritized text (for ElevenLabs), a short list of risky words, and ask for the mp3.
   Offer a lighter-tashkeel version if the voice sounds theatrical.

## Step 2: Video (after the user sends the mp3)
- Style: skill `story-25d-cartoon` (cozy 2.5D, dark outlines, rounded characters, depth blur, mood-shifting palette).
- 1080×1920, 30fps, MP4 H.264. Camera moves slow and steady, hard cuts on narration beats.
- Arabic captions on screen use the **plain text without diacritics**, 2–5 words per phrase, synced to the audio
  (get word timings from the mp3 by forced alignment), bottom-center inside the safe zone
  (side margin 90px, keep bottom 380px and right 160px clear).
- Audio: the user's mp3 as the main track, soft ambience/SFX under it, ducking not needed if no music.
- QA: extract frames at start/middle/end, check captions, RTL, safe zone and sync before sending.
- Deliver the MP4 with SendUserFile (display: attach).
