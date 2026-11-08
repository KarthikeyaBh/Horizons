# Horizons mood picker

On `feat/mood-picker`, merge the ZIP's `frontend/` folder into your project. It includes the full source files from the prior occasion-picker handoff and the new mood picker. If you've since edited `main.jsx`, `OccasionPicker.jsx`, or `styles.css`, merge those changes instead of overwriting your edits.

- `frontend/src/MoodPicker.jsx` contains the mood screen, the custom mood form, and the small handoff to practical details.
- `frontend/src/moodScenes.js` pairs each occasion ID with its image and three mood presets.
- `frontend/public/mood-scenes/` contains all 20 scene photos.
- `frontend/src/styles.css` contains the desktop layout and the background transitions.

Run `npm.cmd run dev` from the project root on Windows. On macOS or Linux, run `npm run dev`. Choose **Date**, then try **Candlelit** and **Hushed**. Open **Other mood** and add a phrase. The current grade should stay the same. The **Practical details** button currently shows the choices passed to the next step.

## Scene photography

The photos were generated with the built-in image generator. Proposal, Birthday, Party, Date, Hangout, and Sightseeing reuse the existing high-resolution Horizons scene photos. The other backgrounds were generated for this update.

Each new occasion prompt starts with “Create a single sharp, high-resolution wide landscape 3:2 editorial photograph as a full-screen desktop backdrop for a Buffalo event planner.” and ends with “Compose the principal subjects and points of interest in the right two-thirds; the left third should retain naturally darker or visually quiet context for a white interface overlay. Realistic candid photography, natural balanced color, crisp fine detail and convincing lighting. No artificial blur, lettering, watermark, logos, graphic overlays, or borders.”.

- **graduation**. University graduates in academic gowns laughing with their families on stone campus steps, flowers and subtle motion in the right half, bright late afternoon, Buffalo university setting.
- **wedding**. Small outdoor wedding ceremony in an elegant Buffalo garden, a flower-lined aisle leading to a simple arch and a few guests on the right half, airy afternoon light.
- **shower**. An intimate baby or bridal shower table with pale flowers, wrapped gifts and refreshments on the right, bright windows, subtle pastel palette.
- **picnic**. Beautiful plaid picnic blanket, fruit, sandwiches and a woven basket under a leafy tree in a Buffalo park, dappled sunlight, picnic foreground concentrated on the right.
- **family**. Candid family outing in a spacious Buffalo park with winding paths and open grass, children and adults on the right enjoying sunshine, clear setting and approachable scale.
- **dog**. A cheerful dog and companion on a leafy nature trail in Western New York, dog prominent on the right, fresh clear morning light, realistic motion.
- **meetup**. Small welcoming community meetup in a sunny courtyard, people chatting around a long table on the right, no posed stock-photo feeling.
- **sunrise-sunset**. Open Lake Erie horizon at golden hour, setting sun and broad reflected sunlight on water, rays and subtle shoreline detail on the right, contemplative panoramic scene.
- **stargazing**. An open field near Western New York at night with a sharp natural star field, small silhouettes on the right looking up, dark neutral foreground, no oversaturated galaxy.
- **hiking**. A vivid rocky hiking trail winding into a wooded Western New York ravine, greenery and textured rock, one small hiker on the right for scale, natural daylight.
- **birdwatching**. A quiet Western New York wetland with reeds, morning mist, still water and a visible heron toward the right, natural soft early light and clear feather detail.
- **sports**. Friends playing a casual outdoor soccer game in an open Buffalo field, ball and movement on the right, clear bright afternoon, realistic candid sports photography.
- **campfire**. A small group of friends around a contained campfire at blue hour, warm ember light and relaxed expressions toward the right, rustic woods, sharply defined flames.

**Other scene prompt.** Create one high-resolution, very sharp landscape 3:2 editorial photograph for a neutral full-screen desktop event planner background. A quiet Buffalo-area lakeside path and gently rippling Lake Erie water, a few trees and a bench, clear neutral late-afternoon light. No people, no activity-specific props, no strong color grading. Main vista on the right, visually quiet darker context at the left for white text. Natural colors, high detail, no blur, logos, graphics, or words.
