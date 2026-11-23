# Ikon Lapora — manifest

Semua ikon aplikasi dibaca lewat satu komponen: `src/components/common/Icon.tsx`.
Tidak ada ikon yang digambar di repo ini; geometri di bawah adalah garis desain
(`design/lapora.figcraft`, layer "Ikon & coretan") dan sudah dipakai sebagai
fallback. Kalau kamu punya set SVG sendiri, cukup taruh di folder ini dengan nama
persis seperti kolom **Nama** lalu tukar entri `GLYPHS` agar membaca file itu.

## Spesifikasi file

| Properti | Nilai |
| --- | --- |
| Path | `assets/icons/<nama>.svg` |
| ViewBox | `0 0 24 24` |
| Grid | 24 × 24, padding aman 2 px dari tepi |
| Stroke | `2` (bisa diturunkan jadi 1.6 untuk ukuran ≤ 16 px) |
| Line cap / join | `round` |
| Fill | `none` — hanya `currentColor` untuk stroke |
| Warna | `stroke="currentColor"`, jangan hard-code warna |
| Format | SVG teks biasa, tanpa `<style>`, tanpa `<filter>`, tanpa gradient |

Konvensi nama: huruf kecil, `snake_case`, tanpa prefix (`lock.svg`, bukan
`ic_lock_24.svg`). Nama file = key di `GLYPHS`.

## Cara pakai di kode

```tsx
import { Icon } from '@/components/common/Icon';

<Icon name="camera" size={20} color={colors.ink} />
<Icon name="alert" size={14} color={colors.accent} strokeWidth={1.6} />
```

`size` default 24, `strokeWidth` default 2, `color` default `#111111`
(sebaiknya selalu lewat token tema: `colors.ink`, `colors.ink3`, `colors.accent`).
Ukuran yang dipakai di layar: 13–18 untuk meta, 20–24 untuk aksi/nav, 30 untuk
mark besar di layar status. Semua target sentuh tetap ≥ 44 × 44 (ikon kecil
dibungkus `IconButton`).

## 29 ikon yang dibutuhkan

Semua nama di bawah sudah punya fallback di registry dan sudah dipakai layar —
tidak ada ikon nganggur.

| Nama file | Fungsi | Dipakai di |
| --- | --- | --- |
| `camera.svg` | kamera dalam aplikasi, CTA lapor | home, camera, history, preview, accuracy, confirm-location, report/[id], BottomNav |
| `pin.svg` | titik lokasi terkonfirmasi | login, confirm-location |
| `alert.svg` | peringatan/gagal | login, register, preview, failed, hazard, profile, ReportThumb, Feedback |
| `check.svg` | sukses/terverifikasi | success, uploading, constants |
| `close.svg` | batal/tutup | map, accuracy, camera, confirm-location, details, preview, FilterSheet |
| `arrow.svg` | aksi lanjut | home (CTA "Laporkan kerusakan baru") |
| `chev.svg` | affordance baris | home (kartu draf) |
| `back.svg` | navigasi kembali | register, report/[id], hazard |
| `search.svg` | pencarian | map, history, +not-found |
| `clock.svg` | waktu/riwayat | BottomNav, history, PhotoEvidence |
| `filter.svg` | buka sheet filter | map |
| `bolt.svg` | lampu jalan | login, constants (kategori + status) |
| `user.svg` | akun/pelapor | login, register, report/[id] |
| `home.svg` | tab beranda | BottomNav |
| `map.svg` | tab peta | home, hazard, report/[id], BottomNav |
| `upload.svg` | kirim/draf | home, history, uploading, failed, constants |
| `shield.svg` | privasi/verifikasi | login, hazard, map, profile |
| `bell.svg` | notifikasi | home, register |
| `target.svg` | akurasi/GPS/posisi | map, camera, preview, accuracy, MapCanvas, constants |
| `list.svg` | status draf | constants |
| `grid.svg` | kategori trotoar | constants |
| `flip.svg` | ganti kamera depan/belakang | camera |
| `lock.svg` | bukti terkunci | camera, preview, details, failed, PhotoEvidence, ReportEvidence |
| `info.svg` | info/ketentuan | profile, details, hazard, MapCanvas, BottomNav |
| `dots.svg` | progres upload | uploading |
| `image.svg` | slot galeri (nonaktif) | camera |
| `refresh.svg` | perbarui lokasi/ulang | home, preview, failed, gps-failed, constants |
| `signal.svg` | kekuatan sinyal GPS | gps-failed, register |
| `wifi_off.svg` | mode offline | failed |

## Peta penempatan per layar

| Layar (route) | Ikon |
| --- | --- |
| `src/app/(auth)/login.tsx` | alert, bolt, lock, pin, shield, user |
| `src/app/(auth)/register.tsx` | alert, back, bell, lock, signal, user |
| `src/app/(tabs)/home.tsx` | alert, arrow, bell, camera, chev, map, refresh, upload |
| `src/app/(tabs)/map.tsx` | close, filter, search, shield, target |
| `src/app/(tabs)/history.tsx` | camera, clock, search, upload |
| `src/app/(tabs)/hazard.tsx` | back, info, map |
| `src/app/(tabs)/profile.tsx` | alert, info, lock, shield |
| `src/app/report/[id].tsx` | back, camera, map, user |
| `src/app/report/camera.tsx` | camera, close, flip, image, lock, target |
| `src/app/report/preview.tsx` | alert, camera, close, lock, refresh, target |
| `src/app/report/confirm-location.tsx` | camera, close, pin |
| `src/app/report/accuracy.tsx` | camera, close, target |
| `src/app/report/details.tsx` | close, info, lock |
| `src/app/report/uploading.tsx` | check, dots, upload |
| `src/app/report/failed.tsx` | alert, lock, refresh, upload, wifi_off |
| `src/app/report/gps-failed.tsx` | refresh, signal |
| `src/app/report/success.tsx` | check |
| `src/app/+not-found.tsx` | search |
| `src/components/map/FilterSheet.tsx` | close |
| `src/components/map/MapCanvas.tsx` | info, target |
| `src/components/navigation/BottomNav.tsx` | camera, clock, home, info, map |
| `src/components/report/PhotoEvidence.tsx` | clock, lock |
| `src/components/report/ReportEvidence.tsx` | lock |
| `src/components/report/ReportThumb.tsx` | alert |
| `src/components/common/Feedback.tsx` | alert (default `ErrorState`) |
| `src/constants/reportMeta.ts` | bolt, check, close, grid, list, refresh, shield, target, upload |

## Aturan

- Satu ikon hanya untuk satu makna. Jangan pakai `alert` sebagai penanda sukses.
- Warna status tidak boleh hijau/merah; gagal = `colors.accent` + `alert`/`wifi_off`,
  sukses = `colors.ink` + `check`.
- Jangan campur family ikon lain (`lucide-react-native` terpasang tapi tidak dipakai).
- Ikon opname tidak perlu dibuat: manifest ini adalah daftar yang diminta.
