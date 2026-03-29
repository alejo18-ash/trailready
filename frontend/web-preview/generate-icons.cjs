const sharp = require('sharp');
const fs = require('fs');

const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="100" fill="#0a0f14"/>
  <polygon points="256,80 440,390 72,390" fill="#0f6e56"/>
  <polygon points="256,80 300,175 212,175" fill="white" opacity="0.95"/>
  <path d="M 256 175 Q 220 240 200 300 Q 185 340 160 380" fill="none" stroke="#4ade80" stroke-width="14" stroke-linecap="round" stroke-dasharray="20 12"/>
  <circle cx="160" cy="385" r="18" fill="#4ade80"/>
  <circle cx="256" cy="175" r="12" fill="white"/>
</svg>`;

const sizes = [72, 96, 128, 144, 152, 180, 192, 512];
const buf = Buffer.from(svg);

if (!fs.existsSync('public/icons')) fs.mkdirSync('public/icons', { recursive: true });

Promise.all(sizes.map(size =>
  sharp(buf).resize(size, size).png().toFile(`public/icons/icon-${size}.png`)
    .then(() => console.log(`✅ icon-${size}.png`))
)).then(() => console.log('🏔️ All icons generated!'));
