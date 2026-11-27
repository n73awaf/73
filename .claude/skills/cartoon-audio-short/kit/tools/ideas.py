#!/usr/bin/env python3
"""Generate cartoon-short ideas or a script through the local FreeLLMAPI router.

Setup (once):  setx FREELLM_API_KEY "<unified key from the Keys page>"
Usage:
  python ideas.py ideas "افعال حمقاء عن الجشع"        # 10 story ideas
  python ideas.py script "فكرة القصة" --out script.txt  # ~45s voiceover script
Env: FREELLM_URL (default http://localhost:3001/v1), FREELLM_MODEL (default auto)
"""
import json, os, sys, urllib.request

URL = os.environ.get("FREELLM_URL", "http://localhost:3001/v1").rstrip("/")
KEY = os.environ.get("FREELLM_API_KEY", "")
MODEL = os.environ.get("FREELLM_MODEL", "auto")

PROMPTS = {
    "ideas": "اقترح 10 أفكار قصص قصيرة (كرتون عمودي، 45 ثانية) لقناة «افعال حمقاء» عن أفعال حمقاء "
             "وعواقبها، من حوادث تاريخية حقيقية أو قصص طريفة. لكل فكرة: عنوان وسطر واحد. الموضوع: ",
    "script": "اكتب نص تعليق صوتي بالعربية الفصحى المبسطة لكرتون قصير مدته 45 ثانية، يبدأ بهوك قوي "
              "وينتهي بمفارقة. نص صافٍ بدون عناوين أو رموز. القصة: ",
}

def main():
    if len(sys.argv) < 3 or sys.argv[1] not in PROMPTS:
        sys.exit(__doc__)
    if not KEY:
        sys.exit("Set FREELLM_API_KEY first (unified key from the FreeLLMAPI Keys page).")
    mode, topic = sys.argv[1], sys.argv[2]
    out = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else None
    body = json.dumps({"model": MODEL, "messages": [{"role": "user", "content": PROMPTS[mode] + topic}]}).encode()
    req = urllib.request.Request(URL + "/chat/completions", body,
                                 {"Content-Type": "application/json", "Authorization": "Bearer " + KEY})
    text = json.load(urllib.request.urlopen(req, timeout=120))["choices"][0]["message"]["content"]
    if out:
        open(out, "w", encoding="utf-8").write(text)
        print("saved", out)
    print(text)

if __name__ == "__main__":
    main()
