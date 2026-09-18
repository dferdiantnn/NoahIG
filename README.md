# ⛵ NoahIG - Instagram Unfollower & Follow Navigator

<div align="center">

![NoahIG Banner](https://img.shields.io/badge/NoahIG-v2.1%20Smart%2010k%20Filter-e1306c?style=for-the-badge&logo=instagram&logoColor=white)
![Client Side](https://img.shields.io/badge/Security-100%25%20In--Memory%20Safe-10b981?style=for-the-badge&logo=shield)
![Zero Backend](https://img.shields.io/badge/Backend-Zero%20Storage-0ea5e9?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)

**Temukan siapa saja yang tidak follow back akun Instagram kamu secara 100% aman, instan (Sat-Set 10 Detik), dan otomatis dikelompokkan antara Akun Teman (< 10k) vs Official / Artis (> 10k)!**

Created with ❤️ by **[Dwi Ferdiantono](https://instagram.com/dferdiantn)** ([@dferdiantn](https://instagram.com/dferdiantn))

</div>

---

## 🌟 Kenapa Memilih NoahIG?

Sebagian besar aplikasi pihak ketiga di Play Store / App Store meminta kamu memasukkan **username & password** Instagram, yang berakibat akun terkena *checkpoint*, *suspicious activity*, atau bahkan dibajak.

**NoahIG dirancang dengan prinsip Zero-Risk:**
- 🛡️ **Tanpa Password / Token**: Tidak pernah meminta password atau login akun.
- 💻 **100% In-Memory (Client-Side)**: Data diekstrak dan diproses di RAM browser kamu sendiri, tidak ada yang diunggah ke cloud/server manapun.
- ⚡ **Mode Sat-Set (10 Detik Selesai)**: Ekstrak data langsung dari browser aktif tanpa menunggu antrean email Meta.
- 👥 **Smart Classification (v2.1 Baru!)**: Pisahkan dengan 1 klik antara akun teman sendiri (< 10k / Private) dengan akun artis/seleb/brand (>= 10k Pengikut Asli / Centang Biru).
- ⚙️ **Batas Followers Fleksibel**: Bebas atur ambang batas akun official (5k, 10k, 25k, 50k, 100k).
- 🏷️ **1-Klik Pindah Kelompok (Override)**: Pindahkan akun ke kelompok Teman / Official sesuka hati, tersimpan permanen di komputermu.
- 📦 **Dukungan ZIP Resmi Meta**: Menerima file export JSON resmi dari Pusat Akun (Meta Accounts Center).
- 📋 **Ekspor Teks Ringan**: 1-Click Copy semua username yang tidak follow back ke clipboard atau unduh file `.txt` sederhana.

---

## 🚀 Fitur Utama

- ❌ **Deteksi Tidak Follow Back**: Temukan akun yang kamu ikuti tapi mereka tidak mengikuti balik bahteramu.
- 👥 **Pengelompokan Teman vs Official (v2.1)**: Sub-menu filter untuk melihat hanya akun teman atau hanya akun official.
- 🔒 **Deteksi Akun Gembok (Private)**: Otomatis mendeteksi akun personal/teman yang diprivat.
- 🌟 **Fans / Belum Di-Follback**: Temukan pengikut setia yang belum kamu follow back.
- 🤝 **Sahabat Sekoci (Mutuals)**: Daftar akun yang saling follow.
- 🔍 **Realtime Search & Filter**: Cari username tertentu secara instan.
- ⛵ **Estetika Bahtera Laut & Gradien Instagram**: Desain dark-mode modern, glassmorphism, animasi bahtera berlayar, dan confetti celebration.

---

## ⚡ Cara Menggunakan (Mode Sat-Set)

1. Buka **[NoahIG](https://dferdiantnn.github.io/NoahIG)** (atau jalankan secara lokal).
2. Klik tombol **"Mode Sat-Set (10 Detik)"** di kanan atas & klik **"Salin Script"**.
3. Buka tab baru [instagram.com](https://www.instagram.com) (pastikan sudah login):
   - **Mac Safari**: Tekan `Cmd + Option + I` &rarr; tab **Console**
   - **Mac Chrome**: Tekan `Cmd + Option + J`
   - **Windows (Chrome / Edge / Firefox)**: Tekan `F12` &rarr; tab **Console**
4. **Paste (Tempel)** script ke Console & tekan **Enter**.
5. Tunggu widget NoahIG di pojok kanan bawah memuat data.
6. Kembali ke NoahIG dan klik **"Paste Data Sat-Set"** &rarr; Selesai! 🎉

---

## 💻 Menjalankan Secara Lokal

Cukup clone repo ini dan buka `index.html` langsung di browser, atau jalankan local server:

```bash
git clone https://github.com/dferdiantnn/NoahIG.git
cd NoahIG
python3 -m http.server 8080
```
Buka browser di `http://localhost:8080`.

---

## 👨‍💻 Author & Credits

- **Creator:** Dwi Ferdiantono
- **Instagram:** [@dferdiantn](https://instagram.com/dferdiantn)
- **GitHub:** [@dferdiantnn](https://github.com/dferdiantnn)

---

## 📄 License
Project ini dilisensikan di bawah [MIT License](LICENSE).
