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
- **Look: exactly the `cartoon-audio-short` skill** (flat 2D bean-head cartoon cards with plum outlines in a
  colourful 3D three.js world, black ink outlines, painted textures, depth-of-field, gliding cameras).
  Build it with that skill's `kit/` (Stage 4). If the kit folder is missing, ask the user to upload it
  before building; do not fall back to another style without saying so.
- 1080x1920, 30fps, MP4 H.264, exactly the voiceover length (+ short tail). Never edit or re-time the voice.
- Timing: Whisper word timestamps on the mp3 (env `73-video-tools` allows Hugging Face; set
  HF_HUB_DISABLE_XET=1) matched to the script text.
- Arabic captions: on for this series (plain text, no diacritics, 2-4 words, word-by-word, keywords in
  #FFCF3A, inside the safe zone: side 90px, bottom 380px and right 160px clear). Drop them if the user asks.

## Audio rule (the user's standing instruction): the narrator is always clearly on top
- Music and SFX must never cover the voice. Mix with the kit's `mix.py`: music at 50 % of the voice's gated
  RMS (-6 dB) or lower, SFX at that level or lower, peaks capped below the voice peak.
- Continuous loud sounds (a car horn, alarms, crying, sirens, rain) sit much lower: about -15 dB under the
  voice while she speaks, louder only in gaps between sentences.
- Before delivering, check the mix numbers and listen-check by loudness: no SFX section louder than the voice.

## Main character (fixed for every story, user's standing instruction)
Always the girl in `references/main-character.jpg`: dark curly hair with a scalloped edge and fringe, a thin white
headband, round peach face, small black dot eyes with a white highlight, rosy cheeks, small smile, white shirt with
yellow dungarees (bib, straps and two white buttons). Never redesign her; only her expression and pose change.
In the cartoon kit she is the outfit `girl` in `kit/saudi/saudi.js` (`saudiFront(p, "girl", opts)`, expr `calm` is her
default face). Supporting cast in the same file: mother, aunt (abaya + hijab), father, man (thobe + ghutra), school
girls, a baby bundle and the blind eared monster. The kit's engine files are Roman-themed; the Saudi street world is
built per project on top of them.

## Colours (user's standing instruction)
Do NOT restrict a story to the «تخيّلها» palette (purple/gold). Use whatever colours suit each character, place and
mood: realistic skin tones, varied clothes (white thobe, black abaya with coloured hijab, school uniforms in different
colours), warm sand/terracotta/blue houses, natural night blues and lamp ambers, daylight in day scenes. The main
character keeps her fixed look; the monster is a tall black featureless shadow with only a faint cool rim light.
Caption highlight colour is chosen per story (coral/amber/white), not the brand yellow.
