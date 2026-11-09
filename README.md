# Civic Pulse & Community Disaster Management

> **Dokumen proyek:** Abstraksi, Software Requirements Specification
> (SRS), TODO List Pertemuan 9--15, rancangan struktur folder,
> arsitektur, dan panduan menjalankan proyek.\
> **Nama aplikasi:** Civic Pulse\
> **Platform:** Android\
> **SDG:** 11 --- Sustainable Cities and Communities\
> **Teknologi utama:** React Native (Expo SDK), TypeScript, Zustand
> (UDF), RxJS, `expo-camera`, `expo-location`, `react-native-maps`,
> `expo-secure-store`, `expo-file-system`, Supabase, dan Antigravity
> IDE.

------------------------------------------------------------------------

# 1. Abstraksi

Civic Pulse merupakan aplikasi mobile berbasis Android yang dirancang
sebagai platform pelaporan kerusakan fasilitas dan infrastruktur publik
di lingkungan perkotaan. Aplikasi ini mengadopsi pendekatan
*community-based reporting*, yaitu masyarakat dapat berpartisipasi dalam
melaporkan kondisi fasilitas publik yang rusak melalui dokumentasi foto
yang diambil secara langsung dari kamera di dalam aplikasi.

Untuk mengurangi laporan palsu atau laporan yang menggunakan foto lama
maupun foto dari lokasi berbeda, Civic Pulse menerapkan mekanisme
**real-time in-app photo capture**. Pengguna tidak dapat mengunggah foto
yang sudah tersimpan di galeri atau memilih gambar dari memori
perangkat. Foto laporan harus diambil melalui kamera yang tersedia di
dalam aplikasi. Pada proses pengambilan foto, aplikasi juga mengambil
koordinat lokasi perangkat dan waktu pengambilan. Setelah foto diambil,
pengguna melihat pratinjau beserta informasi lokasi pada peta dan
diminta mengonfirmasi apakah lokasi yang terdeteksi sudah benar.
Pengguna menjadi pihak yang mengonfirmasi kesesuaian lokasi sebelum
laporan dikirim.

Informasi koordinat dan waktu dikaitkan dengan foto laporan serta
ditampilkan sebagai watermark/informasi dokumentasi sesuai implementasi.
Data laporan kemudian dapat ditampilkan pada peta interaktif sehingga
masyarakat dapat melihat persebaran kerusakan fasilitas publik. Aplikasi
juga dirancang untuk mendukung penapisan laporan secara reaktif
menggunakan RxJS, pengelolaan dokumen melalui mekanisme scoped storage,
serta geofencing area rawan bencana.

Civic Pulse dikembangkan menggunakan React Native dan Expo dengan
TypeScript. Zustand digunakan untuk pengelolaan state dengan pola
Unidirectional Data Flow (UDF), RxJS untuk alur data reaktif, dan
Supabase untuk autentikasi, basis data, penyimpanan media, serta
pembaruan data. Fitur lokasi memanfaatkan `expo-location`, sedangkan
peta interaktif menggunakan `react-native-maps`.

Aplikasi ini bertujuan mendukung partisipasi warga dalam pemantauan
kondisi infrastruktur perkotaan dan meningkatkan kualitas informasi
laporan. Pengambilan foto secara langsung dan konfirmasi lokasi dapat
mengurangi peluang penyalahgunaan laporan, tetapi tidak menjamin seluruh
laporan bebas dari manipulasi. Akurasi GPS, kemungkinan pemalsuan lokasi
pada perangkat, serta kondisi jaringan tetap perlu diperhitungkan.

**Kata kunci:** Civic Pulse, SDG 11, civic reporting, public
infrastructure, real-time camera capture, geotagging, Location-Based
Services, geofencing, React Native.

------------------------------------------------------------------------

# 2. Informasi dan Batasan Proyek

## 2.1 Identitas proyek

  Elemen             Keterangan
  ------------------ -----------------------------------------------
  Nama aplikasi      Civic Pulse
  Tema               Civic Pulse & Community Disaster Management
  SDG                SDG 11 --- Sustainable Cities and Communities
  Platform           Android
  Framework          React Native dengan Expo
  Bahasa             TypeScript
  Backend            Supabase
  State management   Zustand dengan pola UDF
  Reactive stream    RxJS
  Kamera             `expo-camera`
  Lokasi             `expo-location`
  Peta               `react-native-maps`
  Penyimpanan aman   `expo-secure-store`
  Pengelolaan file   `expo-file-system`
  IDE/workflow       Antigravity IDE

## 2.2 Tujuan aplikasi

1.  Memfasilitasi warga dalam melaporkan kerusakan fasilitas dan
    infrastruktur publik.
2.  Mewajibkan pengambilan foto secara langsung melalui kamera di dalam
    aplikasi.
3.  Mencegah pemilihan foto lama dari galeri atau memori perangkat
    sebagai bukti laporan.
4.  Mengambil koordinat lokasi dan waktu pada saat proses dokumentasi.
5.  Meminta pengguna mengonfirmasi apakah lokasi yang terdeteksi sudah
    sesuai sebelum laporan dikirim.
6.  Menampilkan laporan warga pada peta interaktif.
7.  Mendukung pemantauan area rawan bencana melalui geofencing.
8.  Menyediakan penapisan laporan yang responsif menggunakan RxJS.
9.  Mengelola file foto dan dokumen dengan mekanisme penyimpanan yang
    sesuai.
10. Menerapkan arsitektur aplikasi, keamanan data, pengujian, dan
    optimasi performa sesuai spesifikasi tugas.

## 2.3 Prinsip utama pengambilan foto dan lokasi

Alur dokumentasi merupakan pembeda utama Civic Pulse:

-   Kamera harus dibuka dari dalam aplikasi.
-   Foto laporan hanya boleh berasal dari hasil pemotretan langsung
    menggunakan kamera aplikasi.
-   Tidak ada tombol untuk memilih foto dari galeri, file manager, atau
    memori perangkat.
-   Aplikasi mengambil koordinat perangkat pada waktu pemotretan, bukan
    hanya ketika pengguna membuka halaman laporan.
-   Aplikasi merekam waktu pengambilan foto.
-   Setelah pemotretan, aplikasi menampilkan pratinjau foto,
    koordinat/alamat yang terdeteksi, dan penanda lokasi pada peta.
-   Pengguna harus memilih konfirmasi bahwa lokasi sudah benar sebelum
    dapat mengirim laporan.
-   Jika lokasi tidak sesuai, pengguna dapat mengambil ulang foto di
    lokasi yang benar atau membatalkan laporan. Pengguna tidak diberi
    fitur untuk mengubah koordinat secara bebas pada alur utama, agar
    mekanisme konfirmasi tidak mudah disalahgunakan.
-   Jika lokasi tidak tersedia atau akurasinya tidak memenuhi batas yang
    ditentukan, aplikasi meminta pengguna memperbaiki kondisi lokasi dan
    mengambil ulang foto. Aplikasi tidak boleh diam-diam mengirim
    laporan tanpa koordinat.
-   Foto hasil kamera disimpan sementara dalam ruang aplikasi untuk
    diproses dan dikirim, bukan ditambahkan ke galeri publik perangkat.

**Catatan penting:** konfirmasi pengguna membantu memastikan bahwa
lokasi yang ditampilkan memang sesuai menurut pelapor. Konfirmasi ini
bukan bukti teknis bahwa koordinat pasti benar. GPS spoofing, perangkat
yang dimodifikasi, dan manipulasi pada tingkat sistem operasi tetap
merupakan risiko. Karena itu, aplikasi harus mencatat waktu, koordinat,
dan akurasi lokasi serta tidak mengklaim sistem anti-fraud yang
sempurna.

## 2.4 Ruang lingkup versi proyek

### Fitur inti

-   Registrasi dan login.
-   Kamera laporan di dalam aplikasi.
-   Penolakan pemilihan foto dari galeri/memori.
-   Pengambilan koordinat dan timestamp ketika memotret.
-   Pratinjau foto dan konfirmasi lokasi oleh pengguna.
-   Pengiriman laporan kerusakan fasilitas publik.
-   Peta interaktif persebaran laporan.
-   Geofencing area rawan bencana.
-   Pencarian dan penapisan laporan menggunakan RxJS.
-   Penyimpanan media dan dokumen sesuai scoped storage.
-   Riwayat laporan pengguna.

### Fitur pendukung

-   Kategori kerusakan, misalnya jalan berlubang, lampu jalan rusak,
    trotoar rusak, drainase, fasilitas umum, atau kategori lain yang
    ditentukan tim.
-   Deskripsi singkat laporan.
-   Status laporan.
-   Detail laporan dan bukti foto.
-   Filter berdasarkan kategori, status, waktu, atau area.

### Di luar cakupan kecuali tersedia waktu/integrasi

-   Integrasi langsung dengan sistem pengaduan pemerintah daerah.
-   Penugasan otomatis petugas lapangan.
-   Verifikasi resmi oleh instansi pemerintah.
-   Deteksi kerusakan menggunakan AI.
-   Pengiriman peringatan bencana dari lembaga resmi.
-   Penjaminan keaslian foto atau lokasi secara mutlak.

## 2.5 Batasan dan asumsi

-   Target implementasi adalah perangkat Android.
-   Foto bukti harus diambil melalui kamera dalam aplikasi; fitur
    pemilih galeri tidak disediakan pada alur pelaporan.
-   Aplikasi memerlukan izin kamera dan lokasi untuk membuat laporan
    lengkap.
-   Laporan yang tidak memiliki bukti foto hasil pemotretan langsung dan
    koordinat yang berhasil diperoleh tidak dapat dikirim melalui alur
    normal.
-   Pengguna harus mengonfirmasi kesesuaian lokasi sebelum mengirim
    laporan.
-   Jika pengguna menyatakan lokasi salah, aplikasi mengarahkan pengguna
    untuk mengambil ulang foto di lokasi yang benar atau membatalkan
    proses.
-   Geofencing area rawan bencana menggunakan data zona yang telah
    tersedia di backend atau data simulasi.
-   Peta menampilkan data laporan yang tersedia pada sistem, bukan
    menjamin seluruh kerusakan di kota telah terdata.
-   Mekanisme ini mengurangi peluang laporan palsu, tetapi tidak
    menghilangkan seluruh kemungkinan manipulasi.
-   Koneksi internet diperlukan untuk mengirim laporan dan menyinkronkan
    data. Aplikasi dapat menyimpan draft sementara sesuai kebijakan
    implementasi, tetapi draft tidak boleh ditampilkan sebagai laporan
    yang sudah terkirim.
-   Data lokasi dan foto dapat mengandung informasi sensitif; akses
    harus dibatasi sesuai kebutuhan.

------------------------------------------------------------------------

# 3. Software Requirements Specification (SRS)

## 3.1 Pendahuluan

### 3.1.1 Tujuan dokumen

SRS ini menjelaskan kebutuhan fungsional, nonfungsional, aktor, batasan,
alur proses, dan kriteria penerimaan aplikasi Civic Pulse. Dokumen
menjadi acuan pengembangan, pengujian, dan evaluasi proyek.

### 3.1.2 Ruang lingkup produk

Civic Pulse adalah aplikasi Android untuk melaporkan kerusakan fasilitas
publik menggunakan foto yang diambil langsung melalui kamera aplikasi.
Setiap foto laporan dikaitkan dengan koordinat lokasi dan waktu
pengambilan. Pengguna memeriksa pratinjau dan mengonfirmasi kesesuaian
lokasi sebelum mengirim laporan. Data laporan disimpan di backend dan
divisualisasikan melalui peta interaktif.

### 3.1.3 Definisi

  -----------------------------------------------------------------------
  Istilah                             Definisi
  ----------------------------------- -----------------------------------
  Civic reporting                     Pelaporan kondisi fasilitas atau
                                      infrastruktur publik oleh warga

  Real-time capture                   Pengambilan foto secara langsung
                                      melalui kamera aplikasi

  Gallery upload                      Pemilihan foto yang sudah tersimpan
                                      di galeri; tidak diperbolehkan
                                      dalam alur laporan Civic Pulse

  Geotagging                          Pengaitan foto/laporan dengan
                                      koordinat geografis

  Timestamp                           Waktu pengambilan foto atau
                                      pembuatan laporan

  LBS                                 Location-Based Services, layanan
                                      aplikasi yang memanfaatkan lokasi
                                      perangkat

  Geofencing                          Deteksi kedekatan atau masuk/keluar
                                      perangkat dari area geografis
                                      tertentu

  Haversine                           Rumus untuk memperkirakan jarak
                                      antara dua koordinat geografis

  Scoped storage                      Mekanisme akses file yang dibatasi
                                      pada ruang/izin yang sesuai

  UDF                                 Unidirectional Data Flow, aliran
                                      perubahan state satu arah

  RLS                                 Row Level Security, kebijakan
                                      pembatasan akses baris data

  GPS accuracy                        Perkiraan tingkat ketelitian
                                      koordinat yang diberikan layanan
                                      lokasi
  -----------------------------------------------------------------------

## 3.2 Deskripsi Umum

### 3.2.1 Perspektif produk

Civic Pulse terdiri atas aplikasi Android, layanan backend Supabase,
kamera perangkat, layanan lokasi, dan peta interaktif. Aplikasi
mengambil foto melalui kamera internal aplikasi, mengambil lokasi
perangkat pada waktu dokumentasi, meminta konfirmasi lokasi kepada
pengguna, kemudian mengirim data laporan dan media ke backend.

### 3.2.2 Kelas pengguna dan aktor

  -----------------------------------------------------------------------
  Aktor                               Tanggung jawab
  ----------------------------------- -----------------------------------
  Pelapor/User                        Mengambil foto kerusakan melalui
                                      kamera aplikasi, memeriksa foto dan
                                      lokasi, mengonfirmasi lokasi,
                                      mengirim laporan, serta melihat
                                      laporan

  Admin/Moderator                     Mengelola data pendukung dan status
                                      laporan sesuai cakupan
                                      implementasi; bukan pihak yang
                                      mengonfirmasi lokasi pada alur
                                      pengambilan foto

  Layanan kamera                      Mengambil foto secara langsung
                                      melalui kamera perangkat

  Layanan lokasi                      Menyediakan koordinat, timestamp
                                      pengukuran, dan estimasi akurasi

  Backend                             Mengelola autentikasi, laporan,
                                      media, zona rawan, dan pembaruan
                                      data
  -----------------------------------------------------------------------

**Aturan konfirmasi lokasi:** pada proses pembuatan laporan, pihak yang
mengonfirmasi kesesuaian lokasi adalah pengguna yang mengambil foto.
Sistem tidak meminta konfirmasi lokasi tambahan dari admin atau pihak
lain sebagai syarat pengiriman. Admin/moderator, jika ada, hanya
mengelola atau meninjau laporan berdasarkan status operasional.

### 3.2.3 Lingkungan operasi

-   Smartphone Android yang kompatibel dengan Expo SDK yang digunakan.
-   Kamera perangkat.
-   Layanan lokasi/GPS Android.
-   Koneksi internet untuk pengiriman laporan dan sinkronisasi.
-   Supabase project untuk backend.
-   Expo development build/EAS untuk pengujian dan distribusi APK.

### 3.2.4 Ketergantungan

-   Izin kamera.
-   Izin lokasi ketika aplikasi digunakan.
-   Ketersediaan kamera dan layanan lokasi perangkat.
-   Koneksi internet ketika mengirim laporan.
-   Konfigurasi Supabase URL dan publishable key.
-   Kompatibilitas package dengan Expo SDK proyek.

## 3.3 Kebutuhan Fungsional

Prioritas: **Must** = wajib untuk versi proyek; **Should** = penting
jika waktu memungkinkan; **Could** = tambahan.

  -----------------------------------------------------------------------
  ID                      Kebutuhan               Prioritas
  ----------------------- ----------------------- -----------------------
  FR-01                   Sistem menyediakan      Must
                          registrasi dan login    
                          pengguna.               

  FR-02                   Sistem menyediakan      Must
                          halaman utama untuk     
                          mengakses pembuatan     
                          laporan dan peta.       

  FR-03                   Sistem menyediakan      Must
                          fitur kamera yang       
                          dibuka dari dalam       
                          aplikasi.               

  FR-04                   Pengguna hanya dapat    Must
                          mengambil foto laporan  
                          melalui kamera          
                          aplikasi.               

  FR-05                   Sistem tidak            Must
                          menyediakan pemilihan   
                          foto laporan dari       
                          galeri, file manager,   
                          atau memori perangkat.  

  FR-06                   Sistem mengambil        Must
                          koordinat lokasi        
                          perangkat pada proses   
                          pemotretan.             

  FR-07                   Sistem mencatat waktu   Must
                          pengambilan foto.       

  FR-08                   Sistem mencatat         Must
                          estimasi akurasi lokasi 
                          jika disediakan oleh    
                          layanan lokasi.         

  FR-09                   Sistem menampilkan      Must
                          pratinjau foto beserta  
                          informasi lokasi yang   
                          terdeteksi.             

  FR-10                   Sistem menampilkan      Must
                          penanda lokasi pada     
                          peta untuk diperiksa    
                          pengguna.               

  FR-11                   Pengguna harus          Must
                          mengonfirmasi bahwa     
                          lokasi sudah benar      
                          sebelum laporan         
                          dikirim.                

  FR-12                   Jika pengguna           Must
                          menyatakan lokasi       
                          salah, sistem           
                          menyediakan pilihan     
                          mengambil ulang foto    
                          atau membatalkan        
                          laporan.                

  FR-13                   Sistem menolak          Must
                          pengiriman laporan jika 
                          foto bukan hasil        
                          capture dalam sesi      
                          kamera aplikasi.        

  FR-14                   Sistem menolak          Must
                          pengiriman melalui alur 
                          normal jika lokasi      
                          tidak tersedia atau     
                          tidak memenuhi aturan   
                          akurasi yang            
                          ditetapkan.             

  FR-15                   Sistem menyediakan      Must
                          kategori kerusakan      
                          fasilitas publik.       

  FR-16                   Pengguna dapat          Should
                          menambahkan deskripsi   
                          singkat laporan.        

  FR-17                   Sistem mengirim         Must
                          laporan, foto,          
                          koordinat, timestamp,   
                          dan metadata terkait ke 
                          backend.                

  FR-18                   Sistem menampilkan      Must
                          status hasil pengiriman 
                          laporan secara jelas.   

  FR-19                   Sistem menampilkan      Must
                          laporan warga pada peta 
                          interaktif.             

  FR-20                   Sistem menyediakan      Must
                          detail laporan beserta  
                          foto, kategori, waktu,  
                          dan lokasi.             

  FR-21                   Sistem menyediakan      Must
                          geofencing atau deteksi 
                          kedekatan terhadap area 
                          rawan bencana.          

  FR-22                   Sistem menyediakan      Must
                          pencarian/penapisan     
                          laporan menggunakan     
                          RxJS.                   

  FR-23                   Sistem mengelola        Must
                          foto/dokumen            
                          menggunakan mekanisme   
                          scoped storage.         

  FR-24                   Sistem menyediakan      Should
                          riwayat laporan milik   
                          pengguna.               

  FR-25                   Sistem menyediakan      Should
                          pembaruan data laporan  
                          secara realtime jika    
                          integrasi backend       
                          diaktifkan.             

  FR-26                   Admin/moderator dapat   Could
                          mengelola data          
                          kategori, zona, atau    
                          status laporan jika     
                          modul tersebut dibuat.  
  -----------------------------------------------------------------------

## 3.4 Alur Utama Pelaporan

1.  Pengguna membuka aplikasi Civic Pulse.
2.  Pengguna memilih menu **Buat Laporan**.
3.  Aplikasi meminta izin kamera dan lokasi jika belum diberikan.
4.  Aplikasi membuka tampilan kamera internal.
5.  Pengguna mengarahkan kamera ke kerusakan fasilitas publik.
6.  Ketika pengguna menekan tombol shutter, aplikasi mengambil foto dan
    memperoleh lokasi perangkat pada waktu pemotretan.
7.  Aplikasi menyimpan hasil foto sementara dalam ruang aplikasi dan
    mengaitkannya dengan koordinat, timestamp, serta akurasi lokasi.
8.  Aplikasi menampilkan pratinjau foto dan peta kecil dengan marker
    lokasi.
9.  Pengguna memeriksa apakah lokasi yang terdeteksi sudah benar.
10. Jika benar, pengguna memilih **Konfirmasi Lokasi**.
11. Jika salah, pengguna memilih **Ambil Ulang Foto** atau membatalkan
    proses. Koordinat tidak dapat diedit bebas dalam alur utama.
12. Pengguna memilih kategori kerusakan dan dapat menambahkan deskripsi.
13. Pengguna mengirim laporan.
14. Aplikasi mengunggah foto dan menyimpan data laporan ke backend.
15. Aplikasi menampilkan status pengiriman dan laporan pada riwayat/peta
    setelah berhasil tersimpan.

### 3.4.1 Kondisi khusus

-   **Izin kamera ditolak:** tampilkan alasan dan instruksi untuk
    mengaktifkan izin; jangan membuka pemilih galeri sebagai pengganti.
-   **Izin lokasi ditolak:** jelaskan bahwa lokasi diperlukan untuk
    laporan; jangan mengirim laporan seolah-olah lokasi telah
    tervalidasi.
-   **GPS belum siap:** tampilkan proses memperoleh lokasi atau
    instruksi mengaktifkan layanan lokasi.
-   **Akurasi lokasi buruk:** tampilkan estimasi akurasi dan minta
    pengguna menunggu/mengambil ulang. Batas akurasi ditetapkan sebagai
    konfigurasi aplikasi dan diuji pada perangkat nyata.
-   **Lokasi salah menurut pengguna:** pengguna mengambil ulang foto di
    tempat yang benar atau membatalkan.
-   **Internet terputus:** tampilkan bahwa laporan belum terkirim. Jika
    draft lokal didukung, beri label draft dan jangan tampilkan sebagai
    laporan publik.
-   **Upload foto gagal:** jangan membuat laporan berstatus berhasil;
    sediakan opsi mencoba kembali.
-   **Pengguna keluar dari kamera tanpa memotret:** tidak ada laporan
    yang dibuat.

## 3.5 Kebutuhan Nonfungsional

  -----------------------------------------------------------------------
  ID                      Kategori                Kebutuhan
  ----------------------- ----------------------- -----------------------
  NFR-01                  Platform                Aplikasi harus dapat
                                                  dijalankan pada
                                                  perangkat Android yang
                                                  didukung Expo SDK
                                                  proyek.

  NFR-02                  Performa                Interaksi utama
                                                  ditargetkan responsif
                                                  dengan target 60 FPS
                                                  dan anggaran frame
                                                  sekitar 16 ms sesuai
                                                  mandat tugas.

  NFR-03                  Keamanan                Tidak boleh ada
                                                  service-role key atau
                                                  kredensial rahasia di
                                                  aplikasi klien.

  NFR-04                  Keamanan                Akses database dan
                                                  media dibatasi
                                                  menggunakan kebijakan
                                                  backend/RLS dan aturan
                                                  bucket yang sesuai.

  NFR-05                  Privasi                 Foto dan lokasi hanya
                                                  digunakan untuk tujuan
                                                  pelaporan serta
                                                  ditampilkan kepada
                                                  pihak yang memiliki hak
                                                  akses.

  NFR-06                  Integritas bukti        Foto laporan harus
                                                  berasal dari proses
                                                  pemotretan kamera
                                                  internal aplikasi,
                                                  bukan pemilihan file
                                                  yang sudah ada.

  NFR-07                  Integritas lokasi       Koordinat, waktu
                                                  pengukuran, dan
                                                  estimasi akurasi
                                                  dicatat bersama
                                                  laporan.

  NFR-08                  Transparansi            Pengguna dapat melihat
                                                  dan mengonfirmasi
                                                  lokasi sebelum mengirim
                                                  laporan.

  NFR-09                  Reliabilitas            Kegagalan kamera, GPS,
                                                  jaringan, atau backend
                                                  harus ditangani tanpa
                                                  menyebabkan aplikasi
                                                  crash.

  NFR-10                  Storage                 File foto dikelola
                                                  melalui ruang
                                                  aplikasi/scoped storage
                                                  dan tidak memerlukan
                                                  akses luas ke galeri.

  NFR-11                  Maintainability         Kode dipisahkan antara
                                                  UI, state, hooks,
                                                  services, storage, dan
                                                  utilitas.

  NFR-12                  State management        Zustand menerapkan
                                                  Single Source of Truth,
                                                  precision selectors,
                                                  dan tidak melakukan
                                                  direct state mutation.

  NFR-13                  Reactive stream         Subscription RxJS,
                                                  listener kamera, dan
                                                  watcher lokasi
                                                  dibersihkan ketika
                                                  tidak digunakan.

  NFR-14                  Usability               Tahapan foto,
                                                  pemeriksaan lokasi,
                                                  konfirmasi, dan
                                                  pengiriman harus mudah
                                                  dipahami.

  NFR-15                  Compatibility           Versi pustaka harus
                                                  kompatibel dengan Expo
                                                  SDK yang digunakan.

  NFR-16                  Testing                 Alur capture, validasi
                                                  lokasi, Haversine,
                                                  store, dan pelaporan
                                                  harus diuji.
  -----------------------------------------------------------------------

## 3.6 Kebutuhan Antarmuka Eksternal

### 3.6.1 Antarmuka pengguna

Halaman minimum: - Login dan registrasi. - Home/dashboard. - Kamera
laporan. - Pratinjau foto dan konfirmasi lokasi. - Form kategori dan
deskripsi laporan. - Peta laporan. - Detail laporan. - Riwayat
laporan. - Informasi area rawan bencana.

### 3.6.2 Antarmuka perangkat keras

-   Kamera perangkat Android.
-   GPS/lokasi perangkat.
-   Penyimpanan lokal aplikasi.

### 3.6.3 Antarmuka perangkat lunak

-   `expo-camera` untuk pengambilan foto langsung di aplikasi.
-   `expo-location` untuk koordinat, timestamp lokasi, dan geofencing.
-   `react-native-maps` untuk peta dan marker.
-   Supabase Auth untuk autentikasi.
-   Supabase PostgreSQL untuk data laporan.
-   Supabase Storage untuk media foto.
-   Supabase Realtime/Event jika diperlukan.
-   `expo-file-system` untuk pengelolaan file lokal.
-   `expo-secure-store` untuk token atau data kredensial yang perlu
    disimpan secara aman.
-   RxJS untuk pencarian dan penapisan laporan.

## 3.7 Aturan Validasi Foto dan Lokasi

Setiap laporan harus memiliki pasangan bukti berikut:

  ------------------------------------------------------------------------
  Data                    Sumber                  Aturan
  ----------------------- ----------------------- ------------------------
  Foto                    Hasil                   Tidak boleh berasal dari
                          `takePictureAsync` dari gallery picker atau file
                          kamera internal         picker

  Koordinat               `expo-location` pada    Wajib tersedia sesuai
                          saat proses capture     aturan akurasi

  Timestamp foto          Waktu perangkat saat    Dicatat sebagai waktu
                          capture                 dokumentasi

  Timestamp lokasi        Timestamp dari hasil    Disimpan untuk menilai
                          pengukuran lokasi jika  kesegaran data lokasi
                          tersedia                

  Akurasi                 Properti accuracy dari  Ditampilkan/diterapkan
                          hasil lokasi jika       dalam validasi
                          tersedia                

  Konfirmasi lokasi       Pilihan eksplisit       Wajib bernilai benar
                          pengguna                sebelum submit

  Kategori                Pilihan pengguna        Wajib diisi

  Deskripsi               Input pengguna          Opsional atau wajib
                                                  sesuai keputusan tim
  ------------------------------------------------------------------------

**Aturan penting implementasi:** - Jangan menggunakan
`expo-image-picker` untuk alur bukti laporan karena dapat membuka akses
pemilihan foto yang sudah ada. - Gunakan `expo-camera` untuk mengambil
foto dari kamera aplikasi. - Simpan hasil foto sementara di ruang
aplikasi. - Jangan menambahkan foto ke galeri perangkat secara
otomatis. - Pastikan data lokasi yang digunakan memang diambil pada sesi
pengambilan foto, bukan lokasi lama yang tersisa dari state
sebelumnya. - Jika koordinat diambil sesaat sebelum/sesudah shutter
karena keterbatasan API, catat timestamp pengukuran dan terapkan batas
kesegaran lokasi yang ditentukan tim. - Watermark koordinat dan waktu
dapat ditampilkan pada hasil foto melalui proses compositing/overlay.
Simpan juga metadata koordinat dan waktu sebagai field terpisah di
database agar informasi tidak hanya bergantung pada teks watermark. -
Konfirmasi pengguna harus tersimpan sebagai bagian dari metadata
laporan, misalnya `location_confirmed = true` dan
`location_confirmed_at`.

## 3.8 Rancangan Data

Skema awal yang disarankan:

  ----------------------------------------------------------------------------
  Tabel                     Kolom inti                 Keterangan
  ------------------------- -------------------------- -----------------------
  `profiles`                `id`, `full_name`,         Profil pengguna
                            `phone`, `role`,           
                            `created_at`               

  `reports`                 `id`, `user_id`,           Data inti laporan
                            `category_id`,             
                            `description`, `latitude`, 
                            `longitude`,               
                            `location_accuracy`,       
                            `captured_at`,             
                            `location_measured_at`,    
                            `location_confirmed`,      
                            `location_confirmed_at`,   
                            `status`, `created_at`     

  `report_media`            `id`, `report_id`,         Referensi media foto
                            `storage_path`,            
                            `mime_type`, `file_size`,  
                            `captured_at`              

  `report_categories`       `id`, `name`,              Kategori kerusakan
                            `description`              

  `hazard_zones`            `id`, `name`,              Area rawan bencana
                            `description`,             
                            `center_latitude`,         
                            `center_longitude`,        
                            `radius_meters` atau       
                            geometri zona              

  `report_status_history`   `id`, `report_id`,         Riwayat perubahan
                            `status`, `changed_at`,    status
                            `note`                     
  ----------------------------------------------------------------------------

Status laporan yang dapat digunakan: - `draft` - `submitted` -
`under_review` - `in_progress` - `resolved` - `rejected`

Status dan alur moderasi perlu disesuaikan dengan fitur yang benar-benar
diimplementasikan. Konfirmasi lokasi oleh pengguna terjadi sebelum
`submitted` dan bukan konfirmasi oleh admin.

### 3.8.1 Penyimpanan foto

Alur penyimpanan yang disarankan:

1.  Kamera menghasilkan file foto sementara.
2.  Aplikasi memperoleh koordinat dan timestamp capture.
3.  Aplikasi menampilkan pratinjau dan meminta konfirmasi lokasi.
4.  Setelah pengguna mengonfirmasi, aplikasi mengunggah foto ke Supabase
    Storage.
5.  Aplikasi menyimpan path media dan metadata ke tabel `report_media`
    dan `reports`.
6.  File sementara lokal dibersihkan setelah upload berhasil atau sesuai
    kebijakan retry.

Gunakan bucket privat jika foto tidak boleh diakses publik. Akses file
melalui signed URL atau mekanisme akses terotorisasi. Jangan menyimpan
file foto sebagai base64 di tabel PostgreSQL.

### 3.8.2 Keamanan database dan media

-   Aktifkan RLS pada tabel yang menyimpan data pengguna/laporan.
-   Pengguna hanya dapat membuat laporan atas nama dirinya sendiri.
-   Kebijakan baca laporan publik harus mengikuti keputusan privasi
    proyek.
-   Batasi akses bucket Storage sesuai hak akses.
-   Validasi tipe MIME, ukuran file, dan format gambar.
-   Jangan mempercayai nama file atau metadata dari klien sebagai
    satu-satunya bukti keaslian.
-   Jangan menaruh Supabase service-role key di aplikasi Android.
-   Hindari menyimpan koordinat atau foto lebih lama dari yang
    diperlukan.

## 3.9 Penapisan Laporan dan Geofencing

### Penapisan laporan

Pencarian/filter laporan menggunakan pipeline RxJS: - `debounceTime`
untuk menunda pencarian sampai input stabil. - `distinctUntilChanged`
untuk menghindari pemrosesan input yang sama. - `switchMap` untuk
mengganti permintaan sebelumnya ketika filter berubah. - Subscription
harus dibersihkan ketika komponen atau hook dilepas.

Filter dapat mencakup kategori, status, waktu, dan area.

### Geofencing

-   Sistem menyimpan daftar area rawan bencana.
-   Lokasi perangkat dibandingkan dengan area yang tersedia.
-   Sistem memberi informasi ketika pengguna berada di dalam/dekat area
    tersebut sesuai aturan aplikasi.
-   Geofencing tidak boleh diklaim sebagai sistem peringatan resmi dari
    pemerintah/lembaga kebencanaan tanpa integrasi resmi.
-   Untuk implementasi awal, gunakan deteksi jarak/geofence saat
    aplikasi aktif jika background geofencing terlalu kompleks untuk
    cakupan proyek.

## 3.10 Kriteria Penerimaan Sistem

-   Pengguna dapat masuk ke aplikasi.
-   Pengguna dapat membuka kamera dari dalam aplikasi.
-   Tidak tersedia opsi memilih foto dari galeri atau memori perangkat
    pada alur laporan.
-   Foto yang diambil dapat ditampilkan pada halaman pratinjau.
-   Koordinat, timestamp, dan estimasi akurasi diperoleh dan
    ditampilkan.
-   Pengguna harus mengonfirmasi lokasi sebelum mengirim.
-   Jika pengguna menyatakan lokasi salah, aplikasi meminta pengambilan
    ulang atau pembatalan.
-   Sistem tidak mengirim laporan normal tanpa foto hasil capture dan
    lokasi yang memenuhi aturan.
-   Foto dan metadata tersimpan di backend ketika proses pengiriman
    berhasil.
-   Peta menampilkan marker laporan yang tersedia.
-   Geofencing/deteksi area rawan bekerja pada skenario pengujian.
-   Pencarian dan filter menggunakan RxJS.
-   Offline, izin ditolak, GPS gagal, dan upload gagal ditangani secara
    informatif.
-   Pengujian unit dan integrasi yang ditargetkan lulus.
-   APK dapat dipasang dan dijalankan pada perangkat Android fisik.

------------------------------------------------------------------------

# 4. TODO List dan Milestone Pertemuan 9--15

Checklist ini mengikuti milestone panduan tugas. Item yang diberi label
**Tambahan Civic Pulse** merupakan rincian implementasi agar deliverable
umum sesuai dengan kebutuhan aplikasi ini.

## Pertemuan 9 --- Milestone 1: Inisialisasi Modul LBS & Interactive Mapping Engine

**Fokus:** integrasi LBS, peta interaktif, dan komputasi spasial.

-   [ ] Buat project React Native Expo dengan TypeScript.
-   [ ] Konfigurasi `react-native-maps`.
-   [ ] Konfigurasi `expo-location`.
-   [ ] Konfigurasi izin lokasi Android.
-   [ ] Implementasikan custom hook `useLocationTracking`.
-   [ ] Terapkan `distanceInterval` adaptif sesuai kebutuhan.
-   [ ] Tampilkan peta interaktif pada halaman Map.
-   [ ] Tampilkan custom marker untuk laporan warga.
-   [ ] Siapkan data koordinat laporan untuk marker.
-   [ ] Implementasikan Haversine untuk menghitung jarak dua koordinat.
-   [ ] Implementasikan dasar geofencing/deteksi kedekatan area rawan
    bencana.
-   [ ] Siapkan data simulasi area rawan untuk pengujian.
-   [ ] Tambahan Civic Pulse: tentukan format koordinat, timestamp, dan
    accuracy yang akan dipakai pada laporan.
-   [ ] Uji lokasi pada emulator/perangkat Android.
-   [ ] Dokumentasikan konfigurasi dan hasil pengujian.

**Deliverable pertemuan 9:** konfigurasi `react-native-maps` dan
`expo-location`, custom hook `useLocationTracking`, custom markers, dan
kalkulasi Haversine.

## Pertemuan 10 --- Milestone 2: Offline-First Architecture & Secure Storage Integration

**Fokus:** penyimpanan terenkripsi, pengelolaan berkas lokal, dan
runtime permissions.

-   [ ] Integrasikan `expo-secure-store`.
-   [ ] Tentukan data sensitif yang perlu disimpan secara lokal,
    misalnya token autentikasi.
-   [ ] Buat helper penyimpanan aman.
-   [ ] Integrasikan `expo-file-system`.
-   [ ] Tentukan lokasi penyimpanan sementara hasil foto dalam ruang
    aplikasi.
-   [ ] Pastikan foto laporan tidak otomatis masuk ke galeri perangkat.
-   [ ] Terapkan pengelolaan file sesuai scoped storage.
-   [ ] Implementasikan permintaan izin kamera dan lokasi secara
    Just-In-Time.
-   [ ] Tinjau izin storage berdasarkan API Expo SDK yang benar-benar
    digunakan.
-   [ ] Implementasikan halaman kamera internal menggunakan
    `expo-camera`.
-   [ ] Pastikan tidak ada gallery picker/file picker pada alur bukti
    laporan.
-   [ ] Implementasikan pengambilan foto langsung dari kamera.
-   [ ] Implementasikan pengambilan koordinat dan timestamp pada proses
    capture.
-   [ ] Buat halaman pratinjau foto dan lokasi.
-   [ ] Tambahan Civic Pulse: buat pilihan konfirmasi lokasi
    benar/salah.
-   [ ] Jika lokasi salah, arahkan pengguna mengambil ulang foto atau
    membatalkan.
-   [ ] Uji izin kamera/lokasi ditolak dan dicabut.
-   [ ] Uji penghapusan file sementara sesuai alur aplikasi.

**Deliverable pertemuan 10:** integrasi `expo-secure-store`,
`expo-file-system`/document directory, runtime permissions, dan fondasi
real-time camera capture.

## Pertemuan 11 --- Milestone 3: Real-Time Data Pipeline & Background Task Processing

**Fokus:** RxJS, pembaruan data realtime, dan graceful offline fallback.

-   [ ] Integrasikan RxJS.
-   [ ] Buat pipeline pencarian/filter laporan menggunakan
    `debounceTime`.
-   [ ] Gunakan `distinctUntilChanged`.
-   [ ] Gunakan `switchMap` untuk mengganti permintaan pencarian
    sebelumnya.
-   [ ] Siapkan project Supabase.
-   [ ] Integrasikan Supabase Auth.
-   [ ] Buat tabel `profiles`.
-   [ ] Buat tabel `reports`.
-   [ ] Buat tabel `report_media`.
-   [ ] Buat tabel `report_categories`.
-   [ ] Buat tabel `hazard_zones`.
-   [ ] Buat tabel `report_status_history` jika diperlukan.
-   [ ] Aktifkan dan uji RLS.
-   [ ] Buat bucket Storage untuk foto laporan.
-   [ ] Tentukan aturan akses bucket.
-   [ ] Implementasikan service upload foto.
-   [ ] Implementasikan service pengiriman laporan beserta koordinat,
    timestamp, accuracy, dan konfirmasi lokasi.
-   [ ] Pastikan laporan tidak dapat dikirim jika `location_confirmed`
    belum bernilai benar.
-   [ ] Implementasikan pembaruan data realtime menggunakan Supabase
    Realtime/Event jika digunakan.
-   [ ] Buat graceful offline fallback.
-   [ ] Tampilkan status draft, uploading, submitted, dan failed secara
    jelas.
-   [ ] Tambahan Civic Pulse: pastikan file media dan record laporan
    tidak menghasilkan status sukses parsial yang menyesatkan.
-   [ ] Uji koneksi terputus saat upload dan retry.
-   [ ] Bersihkan subscription RxJS setelah tidak digunakan.

**Deliverable pertemuan 11:** RxJS pipeline, integrasi realtime, dan
graceful offline fallbacks.

## Pertemuan 12 --- Milestone 4: Advanced UI Polish, Animations & Responsiveness

**Fokus:** UI responsif, inklusif, dan berkinerja tinggi.

-   [ ] Rapikan navigasi dan halaman utama.
-   [ ] Sempurnakan layout Flexbox.
-   [ ] Gunakan `useWindowDimensions` untuk ukuran layar dan rotasi.
-   [ ] Integrasikan Reanimated untuk mikro-interaksi yang relevan.
-   [ ] Terapkan `SafeAreaProvider`.
-   [ ] Terapkan `KeyboardAvoidingView` pada form.
-   [ ] Tambahkan skeleton loader.
-   [ ] Buat loading, empty, dan error states.
-   [ ] Sempurnakan tampilan kamera dan tombol shutter.
-   [ ] Buat tampilan pratinjau foto yang jelas.
-   [ ] Buat komponen konfirmasi lokasi dengan peta kecil dan informasi
    akurasi.
-   [ ] Buat tombol konfirmasi dan ambil ulang yang mudah dipahami.
-   [ ] Buat halaman peta laporan dan filter kategori/status.
-   [ ] Uji layout pada beberapa ukuran layar Android.
-   [ ] Tambahan Civic Pulse: pastikan pengguna memahami bahwa foto
    harus diambil langsung dan tidak dapat dipilih dari galeri.

**Deliverable pertemuan 12:** layout responsif, animasi Reanimated,
KeyboardAvoidingView, SafeAreaProvider, dan skeleton loaders.

## Pertemuan 13 --- Milestone 5: AI Vibe Coding Refactoring, 16ms Profiling & Memory Leak Audit

**Fokus:** refactoring dengan Antigravity IDE, Architect's Audit
Protocol, optimasi 16 ms, dan evaluasi etika engineering.

-   [ ] Audit pemisahan screen, komponen, hooks, services, stores,
    storage, dan utilitas.
-   [ ] Refaktorisasi kode menggunakan Antigravity IDE.
-   [ ] Tinjau setiap hasil AI sebelum diterapkan.
-   [ ] Jalankan pengujian setelah perubahan AI.
-   [ ] Lengkapi Architect's Audit Protocol --- Check 1: explicit error
    handling dan permissions.
-   [ ] Lengkapi Architect's Audit Protocol --- Check 2: graceful
    fallbacks dan skeleton UI.
-   [ ] Lengkapi Architect's Audit Protocol --- Check 3: unsubscribe dan
    cleanup/zero memory leak.
-   [ ] Audit subscription RxJS.
-   [ ] Audit watcher lokasi.
-   [ ] Audit lifecycle kamera dan pembersihan file sementara.
-   [ ] Pastikan Zustand menggunakan Single Source of Truth dan
    precision selectors.
-   [ ] Pastikan tidak ada direct state mutation.
-   [ ] Terapkan `React.memo`, `useMemo`, dan `useCallback` secara
    terukur.
-   [ ] Profiling performa untuk target 60 FPS/anggaran frame 16 ms.
-   [ ] Periksa frame drop, UI freeze, dan render berulang.
-   [ ] Audit keamanan akses foto dan koordinat.
-   [ ] Pastikan tidak ada kredensial rahasia yang di-hardcode.
-   [ ] Lengkapi Architect's Audit Checklist.
-   [ ] Tulis refleksi AIK: Ikhlas, Itqan, dan Amanah.
-   [ ] Tambahan Civic Pulse: evaluasi privasi foto/lokasi dan potensi
    penyalahgunaan pelaporan.

**Deliverable pertemuan 13:** hasil refactoring, Architect's Audit
Protocol, profiling 16 ms, audit memory leak, checklist arsitektur, dan
refleksi AIK.

## Pertemuan 14 --- Milestone 6: Automated Testing & Standalone EAS Build Generation

**Fokus:** pengujian otomatis dan pembuatan paket instalasi.

-   [ ] Siapkan konfigurasi testing.
-   [ ] Buat unit test untuk fungsi Haversine.
-   [ ] Buat unit test untuk validasi koordinat dan akurasi.
-   [ ] Buat unit test untuk Zustand store.
-   [ ] Buat integration test alur kamera.
-   [ ] Uji bahwa alur laporan tidak menyediakan pemilihan foto galeri.
-   [ ] Uji capture foto langsung.
-   [ ] Uji pengambilan koordinat dan timestamp.
-   [ ] Uji konfirmasi lokasi benar.
-   [ ] Uji ketika pengguna menyatakan lokasi salah.
-   [ ] Uji pengambilan ulang foto dan pembatalan.
-   [ ] Uji kasus izin kamera/lokasi ditolak.
-   [ ] Uji kasus GPS tidak tersedia atau akurasi buruk.
-   [ ] Uji upload foto dan penyimpanan metadata.
-   [ ] Uji peta marker dan filter laporan.
-   [ ] Uji geofencing area rawan.
-   [ ] Uji offline dan upload gagal.
-   [ ] Perbaiki bug dan jalankan ulang seluruh test.
-   [ ] Konfigurasi Expo EAS Build.
-   [ ] Hasilkan APK Android atau build preview sesuai ketentuan.
-   [ ] Instal APK pada perangkat Android fisik.
-   [ ] Uji aplikasi dari kondisi instalasi bersih.
-   [ ] Simpan bukti pengujian dan hasil build.

**Deliverable pertemuan 14:** unit testing, integration testing, dan APK
Android/Expo EAS Build yang dapat dijalankan.

## Pertemuan 15 --- Milestone 7: Final System Integration, AIK Report & Application Expo

**Fokus:** integrasi akhir, repository, laporan AIK, demo, dan
presentasi.

-   [ ] Integrasikan seluruh modul.
-   [ ] Uji ulang alur laporan dari kamera hingga tampil pada peta.
-   [ ] Pastikan alur konfirmasi lokasi berjalan sesuai SRS.
-   [ ] Bersihkan kode, file sementara, dan dependency yang tidak
    digunakan.
-   [ ] Pastikan tidak ada kredensial rahasia di repository.
-   [ ] Pastikan `.env` tidak dikomit dan sediakan `.env.example`.
-   [ ] Pastikan commit history aktif dari seluruh anggota kelompok.
-   [ ] Lengkapi `README.md`.
-   [ ] Siapkan repository GitHub/GitLab.
-   [ ] Siapkan APK atau link Expo EAS Build.
-   [ ] Susun laporan proyek PDF.
-   [ ] Bab I: Pendahuluan dan latar belakang masalah SDG 11.
-   [ ] Bab II: Arsitektur sistem dan perancangan Zustand UDF.
-   [ ] Bab III: Hasil audit arsitek, Antigravity Vibe Coding Checklist,
    dan profiling 16 ms.
-   [ ] Bab IV: Laporan refleksi nilai AIK --- Ikhlas, Itqan, Amanah.
-   [ ] Bab V: Kesimpulan dan saran pengembangan.
-   [ ] Siapkan skenario demo: ambil foto, dapatkan lokasi, konfirmasi
    lokasi, kirim laporan, dan tampilkan marker di peta.
-   [ ] Siapkan demonstrasi penolakan alur gallery upload.
-   [ ] Pastikan setiap anggota memahami arsitektur dan keputusan
    teknis.
-   [ ] Latihan presentasi dan tanya jawab teknis.
-   [ ] Serahkan seluruh deliverable melalui LMS Moodle.

**Deliverable pertemuan 15:** repository Git, APK/EAS Build, laporan
proyek PDF, laporan audit AIK, dan demonstrasi aplikasi.

------------------------------------------------------------------------

# 5. Rancangan Struktur Folder Repository

Struktur berikut dirancang agar pemrosesan kamera, lokasi, laporan, dan
peta terpisah dengan jelas.

``` text
CivicPulse/
├── app/                                  # Routing dan screen (Expo Router)
│   ├── _layout.tsx
│   ├── index.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── home.tsx
│   │   ├── map.tsx
│   │   ├── reports.tsx
│   │   └── profile.tsx
│   └── report/
│       ├── camera.tsx
│       ├── preview.tsx
│       ├── confirm-location.tsx
│       ├── details.tsx
│       └── [id].tsx
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│   ├── common/
│   │   ├── AppButton.tsx
│   │   ├── LoadingView.tsx
│   │   └── ErrorView.tsx
│   ├── camera/
│   │   ├── CameraPreview.tsx
│   │   ├── CaptureButton.tsx
│   │   └── PhotoPreview.tsx
│   ├── location/
│   │   ├── LocationConfirmationCard.tsx
│   │   ├── LocationAccuracyLabel.tsx
│   │   └── LocationMiniMap.tsx
│   ├── map/
│   │   ├── ReportMarker.tsx
│   │   └── HazardZoneOverlay.tsx
│   └── reports/
│       ├── ReportCard.tsx
│       ├── ReportFilter.tsx
│       └── ReportStatusBadge.tsx
│
├── features/
│   ├── auth/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types.ts
│   ├── camera/
│   │   ├── hooks/
│   │   │   └── useReportCamera.ts
│   │   ├── services/
│   │   │   └── cameraService.ts
│   │   └── types.ts
│   ├── location/
│   │   ├── hooks/
│   │   │   ├── useLocationTracking.ts
│   │   │   └── useHazardGeofence.ts
│   │   ├── services/
│   │   │   └── locationService.ts
│   │   └── utils/
│   │       └── haversine.ts
│   ├── reports/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useReportFilters.ts
│   │   ├── services/
│   │   │   ├── reportService.ts
│   │   │   └── reportMediaService.ts
│   │   └── types.ts
│   └── map/
│       ├── components/
│       ├── hooks/
│       └── services/
│
├── stores/                               # Zustand stores (UDF)
│   ├── authStore.ts
│   ├── cameraStore.ts
│   ├── locationStore.ts
│   ├── reportStore.ts
│   └── mapStore.ts
│
├── hooks/
│   ├── useNetworkStatus.ts
│   └── useAppPermissions.ts
│
├── services/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── database.types.ts
│   └── realtime/
│       └── reportChannel.ts
│
├── storage/
│   ├── secureStorage.ts
│   ├── temporaryPhotoStorage.ts
│   └── fileStorage.ts
│
├── lib/
│   ├── constants.ts
│   ├── permissions.ts
│   └── logger.ts
│
├── utils/
│   ├── haversine.ts
│   ├── validators.ts
│   ├── date.ts
│   └── reportMetadata.ts
│
├── types/
│   ├── navigation.ts
│   ├── database.ts
│   └── common.ts
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── tests/
│   ├── unit/
│   │   ├── haversine.test.ts
│   │   ├── reportStore.test.ts
│   │   └── reportValidation.test.ts
│   └── integration/
│       ├── cameraCapture.test.tsx
│       ├── locationConfirmation.test.tsx
│       └── reportSubmission.test.tsx
│
├── docs/
│   ├── SRS.md
│   ├── architecture.md
│   ├── camera-location-flow.md
│   ├── audit-checklist.md
│   └── AIK-report-notes.md
│
├── .env.example
├── .gitignore
├── app.json
├── eas.json
├── package.json
├── tsconfig.json
└── README.md
```

## 5.1 Aturan penempatan kode

  -----------------------------------------------------------------------
  Lokasi                              Isi
  ----------------------------------- -----------------------------------
  `app/`                              Screen dan routing; tidak menampung
                                      logika bisnis kompleks

  `components/`                       Komponen UI reusable

  `features/camera/`                  Pengambilan foto langsung dan
                                      lifecycle kamera

  `features/location/`                GPS, geofencing, dan perhitungan
                                      spasial

  `features/reports/`                 Pembuatan, validasi, pengiriman,
                                      dan penapisan laporan

  `features/map/`                     Tampilan peta dan marker

  `stores/`                           State global Zustand dan action

  `hooks/`                            Custom hooks lintas fitur

  `services/`                         Integrasi Supabase dan realtime

  `storage/`                          Pengelolaan file sementara dan
                                      penyimpanan aman

  `utils/`                            Fungsi murni seperti Haversine dan
                                      validator

  `database/`                         SQL schema dan seed data

  `tests/`                            Unit dan integration tests

  `docs/`                             Dokumentasi teknis dan audit
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 6. README Operasional: Setup dan Menjalankan Proyek

## 6.1 Prasyarat

-   Node.js versi LTS yang kompatibel dengan Expo SDK proyek.
-   npm atau package manager yang disepakati tim.
-   Android Studio/Android SDK atau perangkat Android fisik.
-   Kamera dan layanan lokasi pada perangkat untuk pengujian fitur
    utama.
-   Akun dan project Supabase.
-   Expo account jika menggunakan EAS Build.
-   Git.

## 6.2 Inisialisasi project

``` bash
npx create-expo-app@latest CivicPulse --template blank-typescript
cd CivicPulse
```

Jika menggunakan Expo Router, tambahkan dan konfigurasi Expo Router
mengikuti dokumentasi yang sesuai dengan versi Expo SDK.

## 6.3 Instalasi dependency inti

Gunakan `npx expo install` untuk package native agar versi mengikuti
kompatibilitas Expo SDK.

``` bash
npx expo install expo-camera expo-location expo-file-system
npx expo install expo-secure-store react-native-maps
npm install zustand rxjs @supabase/supabase-js
npm install react-native-url-polyfill
```

Tambahkan Reanimated dan package testing sesuai panduan kompatibilitas
Expo SDK proyek.

**Penting:** jangan menambahkan `expo-image-picker` ke alur pelaporan
foto. Library tersebut dapat menyediakan pemilihan gambar dari media
perangkat, sedangkan kebutuhan Civic Pulse mewajibkan foto diambil
langsung melalui kamera aplikasi.

## 6.4 Environment variable

Buat file `.env` pada root project:

``` env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Buat `.env.example` dengan placeholder. Jangan commit file `.env` yang
berisi nilai aktual. Jangan pernah memasukkan service-role key ke
aplikasi klien.

## 6.5 Menjalankan aplikasi

``` bash
npx expo start
```

Jalankan pada emulator atau perangkat Android. Untuk fitur native
seperti kamera, peta, dan konfigurasi perangkat tertentu, gunakan
development build jika Expo Go tidak memenuhi kebutuhan pengujian.

## 6.6 Build Android

Konfigurasikan `eas.json`, login ke akun Expo, lalu jalankan:

``` bash
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
```

Pastikan profil build menghasilkan APK apabila tugas meminta file APK
yang dapat dipasang langsung. Instal dan uji hasil build pada perangkat
Android fisik.

------------------------------------------------------------------------

# 7. Arsitektur dan Alur Data

## 7.1 Gambaran lapisan

``` text
User
  |
  v
Presentation Layer (Expo Router Screens + Components)
  |
  v
Zustand Store (UDF: state + actions)
  |
  v
Hooks / Business Services
  |                         |
  v                         v
Device Services              Supabase Services
(Camera, Location,           (Auth, PostgreSQL,
FileSystem, SecureStore)       Storage, Realtime)
  |
  v
State diperbarui -> UI merender state terbaru
```

## 7.2 Alur pengambilan foto dan konfirmasi lokasi

``` text
Pengguna membuka Buat Laporan
          |
          v
Aplikasi meminta izin Kamera + Lokasi
          |
          v
Kamera internal aplikasi dibuka
          |
          v
Pengguna mengambil foto
          |
          +------> Ambil koordinat + timestamp + accuracy
          |
          v
Foto dan metadata disimpan sementara
          |
          v
Tampilkan Preview + Peta + Informasi Lokasi
          |
          v
Pengguna mengonfirmasi lokasi?
          |
       +--+--+
       |     |
      Ya    Tidak
       |     |
       v     v
  Isi detail  Ambil ulang foto
  laporan     atau batalkan
       |
       v
  Upload foto + simpan metadata
       |
       v
  Laporan berhasil dikirim
       |
       v
  Tampilkan pada peta/riwayat
```

## 7.3 Contoh state proses laporan

``` ts
type ReportCreationStatus =
  | 'idle'
  | 'requesting_permission'
  | 'opening_camera'
  | 'capturing'
  | 'getting_location'
  | 'preview'
  | 'location_confirmation'
  | 'ready_to_submit'
  | 'uploading'
  | 'submitted'
  | 'error'
  | 'cancelled';
```

State lokasi perlu menyimpan setidaknya: - latitude - longitude -
accuracy - location timestamp - capture timestamp - `locationConfirmed`

Jangan menganggap laporan sudah terkirim hanya karena foto berhasil
diambil. Status `submitted` hanya digunakan setelah backend
mengonfirmasi penyimpanan laporan.

------------------------------------------------------------------------

# 8. Pembagian Tanggung Jawab Tim

Untuk tim maksimal tiga orang, pembagian awal yang dapat digunakan:

  -----------------------------------------------------------------------
  Peran                               Fokus pekerjaan
  ----------------------------------- -----------------------------------
  Anggota 1 --- System & Backend      Arsitektur, Supabase, autentikasi,
                                      skema database, RLS, Storage,
                                      service laporan, dan audit keamanan

  Anggota 2 --- Frontend & UI         Screen, navigasi, komponen UI,
                                      kamera preview, konfirmasi lokasi,
                                      responsive layout, dan animasi

  Anggota 3 --- Camera, Location &    Kamera internal, capture metadata,
  Mapping                             GPS, Haversine, geofencing, peta,
                                      dan permissions

  Semua anggota                       Integrasi, code review, testing,
                                      dokumentasi, demo, dan presentasi
  -----------------------------------------------------------------------

Pembagian ini adalah rekomendasi. Seluruh anggota tetap harus memahami
alur sistem dan mampu menjelaskan kontribusinya.

------------------------------------------------------------------------

# 9. Risiko Teknis dan Mitigasi

  -----------------------------------------------------------------------
  Risiko                              Mitigasi
  ----------------------------------- -----------------------------------
  Pengguna mencoba mengirim foto lama Tidak menyediakan gallery picker;
                                      hanya menerima hasil capture dari
                                      kamera internal

  Lokasi tidak tersedia               Jangan izinkan submit normal;
                                      tampilkan instruksi mengaktifkan
                                      lokasi

  Akurasi GPS buruk                   Tampilkan accuracy dan minta
                                      pengguna menunggu atau mengambil
                                      ulang

  Pengguna mengonfirmasi lokasi yang  Tampilkan peta dan koordinat dengan
  salah                               jelas; sediakan ambil ulang/batal

  GPS spoofing                        Catat accuracy dan timestamp;
                                      jangan mengklaim anti-fraud
                                      sempurna

  Foto dan koordinat tidak cocok      Ambil lokasi pada sesi capture dan
  waktunya                            validasi kesegaran timestamp

  Izin kamera ditolak                 Jelaskan kebutuhan izin; jangan
                                      mengganti dengan upload galeri

  Internet terputus                   Simpan draft jika diimplementasikan
                                      dan beri label belum terkirim

  Upload foto gagal                   Pertahankan status gagal dan
                                      sediakan retry; jangan membuat
                                      laporan sukses palsu

  Akses foto tidak sah                Gunakan bucket privat dan kebijakan
                                      akses yang sesuai

  File sementara menumpuk             Hapus file setelah upload berhasil
                                      atau saat draft dibatalkan sesuai
                                      kebijakan

  Subscription terus berjalan         Cleanup subscription, listener, dan
                                      watcher saat unmount

  Peta tidak tampil pada Expo Go      Periksa kompatibilitas package dan
                                      gunakan development build

  Performa buruk                      Profiling, selector Zustand
                                      presisi, dan optimasi render
                                      terukur
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 10. Checklist Final Sebelum Pengumpulan

-   [ ] Registrasi/login berjalan.
-   [ ] Kamera internal dapat dibuka dari aplikasi.
-   [ ] Tidak ada fitur pemilihan foto dari galeri/memori pada alur
    laporan.
-   [ ] Foto dapat diambil dan ditampilkan dalam preview.
-   [ ] Koordinat, timestamp, dan accuracy berhasil diperoleh.
-   [ ] Pengguna harus mengonfirmasi lokasi sebelum submit.
-   [ ] Jika lokasi salah, pengguna dapat mengambil ulang atau
    membatalkan.
-   [ ] Foto dan metadata tersimpan di backend.
-   [ ] Watermark/informasi koordinat dan waktu diterapkan sesuai
    rancangan.
-   [ ] Peta interaktif menampilkan laporan.
-   [ ] Geofencing area rawan diuji.
-   [ ] RxJS pipeline berjalan.
-   [ ] Scoped storage diterapkan.
-   [ ] Zustand mengikuti UDF dan tidak melakukan direct mutation.
-   [ ] Architect's Audit Protocol selesai.
-   [ ] Profiling performa dan audit memory leak selesai.
-   [ ] Unit test dan integration test dijalankan.
-   [ ] APK/EAS Build berjalan pada perangkat fisik.
-   [ ] Repository bersih dan tidak memuat secret.
-   [ ] README.md lengkap.
-   [ ] Laporan PDF Bab I--V selesai.
-   [ ] Laporan AIK Ikhlas, Itqan, Amanah selesai.
-   [ ] Demo dan presentasi telah dilatih.

------------------------------------------------------------------------

# 11. Referensi

1.  **Spesifikasi Panduan Tugas Besar Mata Kuliah Pemrograman Mobile**,
    khususnya Topik B: Civic Pulse & Community Disaster Management (SDG
    11), milestone Pertemuan 9--15, rubrik penilaian, dan format
    penyerahan.
2.  Dokumentasi resmi Expo: https://docs.expo.dev/
3.  Dokumentasi Expo Camera:
    https://docs.expo.dev/versions/latest/sdk/camera/
4.  Dokumentasi Expo Location:
    https://docs.expo.dev/versions/latest/sdk/location/
5.  Dokumentasi Supabase: https://supabase.com/docs
6.  Dokumentasi Zustand: https://zustand.docs.pmnd.rs/
7.  Dokumentasi RxJS: https://rxjs.dev/

------------------------------------------------------------------------

**Catatan pemeliharaan dokumen:** README ini merupakan baseline
perencanaan Civic Pulse. Perbarui SRS, status checklist, struktur
folder, dan keputusan teknis ketika implementasi berubah. Foto laporan
harus tetap berasal dari kamera internal aplikasi, dan konfirmasi lokasi
oleh pengguna harus menjadi gerbang sebelum laporan dikirim. Mekanisme
ini mengurangi peluang laporan palsu, bukan menjamin keaslian lokasi
secara mutlak.
