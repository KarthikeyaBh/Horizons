const grades = {
  amber: ['#f4a04d', 0.37, 1.06, 1.23, 1.03],
  rose: ['#d88186', 0.33, 1.01, 1.10, 1.02],
  peach: ['#ffbda0', 0.28, 1.13, 1.03, 0.91],
  blush: ['#e5acbf', 0.32, 1.14, 0.87, 0.86],
  cream: ['#f4dfb9', 0.22, 1.20, 0.76, 0.86],
  sun: ['#f7d378', 0.29, 1.15, 1.17, 1.00],
  coral: ['#f08767', 0.31, 1.07, 1.39, 1.07],
  cyan: ['#74c6d4', 0.31, 1.10, 1.16, 1.00],
  mist: ['#a3c9df', 0.36, 1.08, 0.69, 0.85],
  slate: ['#7895b2', 0.29, 0.93, 0.68, 0.91],
  crisp: ['#abd7ec', 0.20, 1.16, 0.96, 1.13],
  indigo: ['#526ba5', 0.37, 0.79, 1.03, 1.25],
  cinema: ['#304659', 0.36, 0.90, 1.20, 1.31],
  electric: ['#7065dc', 0.31, 0.99, 1.46, 1.22],
  vivid: ['#df5e77', 0.22, 1.08, 1.54, 1.12],
  fern: ['#71a980', 0.35, 1.02, 1.20, 1.06],
  moss: ['#6e8361', 0.33, 0.91, 0.83, 1.09],
  fresh: ['#b8ce83', 0.32, 1.12, 1.09, 0.96],
  sepia: ['#c58d57', 0.38, 1.01, 0.65, 0.97],
  ember: ['#df6d35', 0.39, 0.88, 1.26, 1.17],
};

function scene(id, alt, presets) {
  return {
    image: import.meta.env.BASE_URL + 'mood-scenes/' + id + '.png',
    alt,
    presets: presets.map(([word, detail, tone]) => {
      const [color, opacity, brightness, saturation, contrast] = grades[tone];
      return { word, detail, color, opacity, brightness, saturation, contrast };
    }),
  };
}

export const moodScenes = {
  proposal: scene('proposal', 'A lakeside proposal in the evening light', [
    ['Golden', 'Warm light across the water', 'amber'],
    ['Intimate', 'Soft rose light and a quieter setting', 'rose'],
    ['Dreamlike', 'A pale, softened glow', 'blush'],
  ]),
  birthday: scene('birthday', 'A birthday cake glowing with candles', [
    ['Jubilant', 'Warm, bright highlights', 'sun'],
    ['Playful', 'Coral light and punchier color', 'coral'],
    ['Colorful', 'Rich, saturated accents', 'vivid'],
  ]),
  party: scene('party', 'Friends dancing under string lights', [
    ['Electric', 'Colorful lights and bold contrast', 'electric'],
    ['High-energy', 'Punchy reds and bright highlights', 'vivid'],
    ['Dramatic', 'Deeper shadows and cooler light', 'cinema'],
  ]),
  graduation: scene('graduation', 'Graduates and families on campus steps', [
    ['Triumphant', 'Confident contrast and warm highlights', 'coral'],
    ['Bright', 'Clear light and sharper detail', 'crisp'],
    ['Nostalgic', 'Soft contrast and a film-like warmth', 'sepia'],
  ]),
  wedding: scene('wedding', 'A garden aisle with flowers and an outdoor ceremony arch', [
    ['Timeless', 'Quiet warmth and natural color', 'sepia'],
    ['Airy', 'Pale light and lifted shadows', 'cream'],
    ['Romantic', 'Rose-tinted light and gentle contrast', 'rose'],
  ]),
  shower: scene('shower', 'A sunlit table with flowers and gifts', [
    ['Delicate', 'Soft peach light and lifted shadows', 'peach'],
    ['Cheerful', 'Sunny highlights and lively color', 'sun'],
    ['Pastel', 'Pale pink and muted contrast', 'blush'],
  ]),
  date: scene('date', 'A candlelit table for two overlooking the Buffalo skyline', [
    ['Candlelit', 'Amber light and warmer highlights', 'amber'],
    ['Hushed', 'Softer contrast and cooler shadows', 'mist'],
    ['Cinematic', 'Deeper shadows and vivid city lights', 'cinema'],
  ]),
  hangout: scene('hangout', 'Friends spending time outdoors together', [
    ['Unhurried', 'Soft contrast and cooler light', 'mist'],
    ['Cozy', 'Warm light and gentle shadows', 'peach'],
    ['Easygoing', 'A bright, natural wash of sunlight', 'cream'],
  ]),
  picnic: scene('picnic', 'A picnic blanket and food under leafy shade', [
    ['Breezy', 'Cool light and clear color', 'cyan'],
    ['Sun-dappled', 'Golden highlights across the shade', 'sun'],
    ['Fresh', 'Light greens and an open feel', 'fresh'],
  ]),
  family: scene('family', 'A family exploring a park with winding paths', [
    ['Sunny', 'Bright yellow light and warm greens', 'sun'],
    ['Welcoming', 'Soft peach warmth', 'peach'],
    ['Relaxed', 'Lighter shadows and softer colors', 'cream'],
  ]),
  dog: scene('dog', 'A dog and its companion on a leafy nature trail', [
    ['Spirited', 'Lively color and crisp contrast', 'coral'],
    ['Woodsy', 'Shaded greens and earthy tones', 'moss'],
    ['Open', 'Clear air and cool, bright light', 'crisp'],
  ]),
  meetup: scene('meetup', 'People chatting around a courtyard table', [
    ['Lively', 'Bright color and punchier contrast', 'vivid'],
    ['Inviting', 'Warmer light around the gathering', 'amber'],
    ['Casual', 'Soft light and neutral color', 'cream'],
  ]),
  sightseeing: scene('sightseeing', 'The Buffalo waterfront with an open view of Lake Erie', [
    ['Expansive', 'Cool water and a brighter sky', 'cyan'],
    ['Striking', 'Deeper shadows and richer color', 'cinema'],
    ['Crisp', 'Clearer highlights and sharper contrast', 'crisp'],
  ]),
  'sunrise-sunset': scene('sunrise-sunset', 'Low sunlight reflecting across an open Lake Erie horizon', [
    ['Aglow', 'Amber light spreading across the water', 'amber'],
    ['Serene', 'Cooler water and a softer horizon', 'mist'],
    ['Sweeping', 'Stronger contrast and deeper sky color', 'cinema'],
  ]),
  stargazing: scene('stargazing', 'A star-filled sky above an open field', [
    ['Still', 'Subdued blue and soft contrast', 'slate'],
    ['Celestial', 'Cool highlights and clearer star detail', 'crisp'],
    ['Inky', 'Deep blue and darker shadows', 'indigo'],
  ]),
  hiking: scene('hiking', 'A trail winding into a wooded ravine', [
    ['Rugged', 'Earthy tones and deeper shade', 'moss'],
    ['Verdant', 'Lush, richer greens', 'fern'],
    ['Adventurous', 'Crisp highlights and cool shadows', 'crisp'],
  ]),
  birdwatching: scene('birdwatching', 'A heron near reeds in a quiet wetland', [
    ['Quiet', 'Muted blue and gentle contrast', 'slate'],
    ['Misty', 'Pale, diffused morning light', 'mist'],
    ['Secluded', 'Shaded greens with less glare', 'moss'],
  ]),
  sports: scene('sports', 'Friends playing soccer on an open field', [
    ['Brisk', 'Cool, clear daylight', 'crisp'],
    ['Vibrant', 'Bold color and brighter accents', 'vivid'],
    ['Energetic', 'Warm light and stronger contrast', 'coral'],
  ]),
  campfire: scene('campfire', 'Friends around a campfire at blue hour', [
    ['Ember-lit', 'Orange firelight against deeper shade', 'ember'],
    ['Rustic', 'Muted color and earthy warmth', 'sepia'],
    ['Warm', 'Golden highlights and softer shadows', 'amber'],
  ]),
  other: scene('other', 'A quiet lakeside path and gently rippling water', [
    ['Calm', 'Gentle light and softer colors', 'mist'],
    ['Radiant', 'Warm light and brighter highlights', 'sun'],
    ['Bold', 'Stronger contrast and deeper shadows', 'cinema'],
  ]),
};
