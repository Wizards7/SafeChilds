# SafeChilds concept video: prompts and edit plan

Concept video for the jury (about 40 s, 16:9). People shots come from Google Flow (Veo). Phone screens are our own recordings in `out/`, put onto the green phone screen in the edit. Mark the video «Концепт»: a button over Instagram needs a native Android app, and on iPhone the route is «Поделиться → SafeChilds».

## Before you start in Flow

1. Make one **character image** first (Flow → image, or any image tool): *"Portrait of a 16-year-old Central Asian teenager, short dark hair, plain grey hoodie, gentle face, soft window light, neutral background, photorealistic."* Add it as an **Ingredient** to every shot below, so the teen looks the same.
2. Settings: Veo 3 (Quality), 16:9, 8 s. Make 3–4 takes per shot and keep the best.
3. If text or an app interface appears on the phone, add *"the phone screen is plain flat green, no interface, no text"* and generate again.
4. If Flow refuses the age, write *"young person, around 17"*.

Colours are written as words (Veo understands "deep navy blue" better than hex codes). The look: **deep navy blue night, soft blue phone glow, small lime-green accent lights, a warm amber lamp that grows warmer at the end.**

## Shots

**Shot 1: night scroll**
```
Cinematic, photorealistic, 16:9. Night in a small cozy teenager's bedroom. A 16-year-old Central Asian teen with short dark hair and a grey hoodie sits on the bed with knees up, scrolling a smartphone. The phone screen is plain flat green with no interface. The room is in deep navy blue shadow, the face is lit by a soft cool blue glow from the phone, a small warm amber lamp glows in the background, tiny soft lime-green fairy lights on the wall. The thumb scrolls, slows down, and the face changes from relaxed to uneasy. Slow push-in, 35mm lens, shallow depth of field, soft film grain. Quiet, calm, not scary. Sound: soft room tone, distant city.
```

**Shot 2: the message**
```
Cinematic, photorealistic, 16:9. Over-the-shoulder close shot of the same teen in a grey hoodie holding a smartphone at night. The phone screen is plain flat green with no interface, facing the camera, in sharp focus. The thumb stops scrolling and hovers, the hand tightens a little. Background softly blurred in deep navy blue with one warm amber lamp bokeh and small lime-green light dots. Slow dolly forward toward the phone. Sound: one soft notification ping, then silence.
```

**Shot 3: the tap**
```
Cinematic macro shot, 16:9. Extreme close-up of a teenager's thumb gently tapping the right edge of a smartphone whose screen is plain flat green with no interface, then lifting away. The fingertip is sharp, everything else is a soft deep navy blue blur with tiny lime-green and amber bokeh lights. Very slow macro push-in, very shallow depth of field, calm and precise. Sound: a soft tap.
```

**Shot 4: share on iPhone**
```
Cinematic, photorealistic, 16:9. Close-up of two hands in grey hoodie sleeves holding a modern smartphone; the screen is plain flat green with no interface. The thumb taps near the bottom of the screen, pauses, then taps once in the middle, calm and confident. The camera slowly orbits a little around the phone. Deep navy blue background, a soft blue rim light on the fingers, a hint of lime-green light. Shallow depth of field, soft film grain.
```

**Shot 5: relief**
```
Cinematic, photorealistic, 16:9. Medium close-up of the same teen on the bed at night. They breathe out, the shoulders relax, a small relieved half-smile appears. They type a short message with both thumbs on a phone with a plain flat green screen, then rest the phone on their chest and look up at the ceiling. The light slowly changes: the warm amber lamp glow fills the room and pushes back the deep navy blue, small lime-green lights twinkle softly. Slow pull-back, 35mm lens, shallow depth of field. Warm, hopeful, calm. Sound: a quiet exhale, soft typing.
```

**Shot 6: background behind the logo (optional, our end card already has one)**
```
Abstract cinematic background, 16:9. A slow, smooth deep navy blue gradient with two large soft glowing circles, one sky blue and one soft lime green, drifting gently. Fine film grain, a lot of calm empty space in the middle. No objects, no shapes, no letters.
```

## Our screen recordings (`out/`)

| File | What it shows | Use on |
|---|---|---|
| `dm.mp4` | DM «Это ты на этом фото?» + short link + «пока не удалили» | Shot 2 |
| `bubble.mp4` | Floating button → panel opens → «Проверить ссылку» | Shot 3 |
| `link.mp4` | Link check: «Есть признаки обмана», real address, 3 findings, «Что дальше» | full screen |
| `photo.mp4` | Photo check: scan, markers ①②, «Где смотреть» | full screen |
| `share.mp4` | iPhone: «Поделиться» → SafeChilds → «Что проверить?» | Shot 4 |
| `message.mp4` | Ready message → «Мама» → «Я рядом…» | Shot 5 |
| `end.mp4` | End card: logo, «Следующий понятный шаг», «Концепт», QR | last |
| `*-16x9.mp4` | Same screens inside our phone on the navy stage, with a caption | use these instead of Flow shots if time is short |

Phone clips are 1080 × 2340 (9:19.5), 30 fps.

## Edit (CapCut or DaVinci)

1. Order: **Shot 1 → Shot 2 + dm → Shot 3 + bubble → link (full screen) → photo (full screen) → Shot 4 + share → Shot 5 + message → end**.
2. Put each screen clip on the green screen with **Chroma key**, then **Corner pin / Track** so it follows the phone.
3. Cut on the tap: the screen clip should start the moment the thumb touches.
4. Music: soft piano or ambient, low. Small «Концепт» label in a corner for the whole video.
5. Optional voice-over (RU): *«Ночью приходит сообщение: „Это ты на фото?“ Ссылка, давят временем. Одно касание — и SafeChilds проверяет ссылку, не открывая её, и показывает на фото, где смотреть. Без вердикта, честно. А дальше — готовые слова для взрослого. Следующий понятный шаг.»*

To re-render the screens: serve `apps/web` on port 4501 (any static server), then `node rec.mjs out` from a folder where `playwright-core` is installed (it is not in the repo's dependencies on purpose; needs Chrome and ffmpeg); the screens themselves are `screens.html?s=dm|bubble|link|photo|share|message|end` (add `&frame=1` for 16:9).
