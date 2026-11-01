# Kâbe 3D — tavaf videosu sahnesi

Kâbe tavaf Reels'inde (Kasım 2026) kullanılan 3D model ve çizim düzeni.

## Lisans / zorunlu atıf
`model/kaaba.glb` — **"Kaaba in Mecca" by agrees_putra** (Sketchfab), **CC BY 4.0**.
Bu modeli kullanan her paylaşımın açıklamasına şu satır eklenmeli:

    3D model: "Kaaba in Mecca" by agrees_putra (Sketchfab), CC BY 4.0

## Dosyalar
- `model/kaaba.glb` — model (57 MB)
- `main.js` — WebGL2 çizici (kendi GLB yükleyicisi, gölge, ACES, bloom, etiket kartları, logo). `window.ANCH` durak koordinatları, `window.frame(t, shot)`.
- `scene.html` — fontları yükler, sonra main.js'i çalıştırır
- `video.js` — tavaf videosunun zaman çizelgesi (kamera durakları, etiketler, altyazılar, sayaç, kapanış). Yeni video için bunu kopyalayıp düzenle.
- `vid.js` — `node vid.js <ölçek> <fps> <t0> <t1> <out.mp4 | stills:t1,t2>` kareleri ffmpeg'e aktarır
- `render_final.sh` — 1080x1920 30fps, iki paralel parça + birleştirme
- `cover2.js` — kapak için temel kare
- fontlar (Inter, Amiri, Kalam), `kurandan_logo_video.png` (şeffaf logo)

## Kullanım (yeni oturumda)
```bash
git clone --depth 1 https://github.com/ocakoguzcan-oss/kurandan-reels
cd kurandan-reels/assets/kabe3d
python3 -m http.server 8765 &
node vid.js 0.5 30 0 5 test.mp4   # Playwright + headless Chromium (swiftshader)
```
Ses: `ffmpeg -i video.mp4 -i mix.m4a -c copy -shortest final.mp4`
