export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface CuriosityPoint {
  id: string;
  title: string;
  promptQuestion: string;
  followUpQuestions: string[];
  quickPollOptions: string[];
}

export const IMAGES = {
  tujuan: '/src/assets/images/tujuan_jaringan_nyata_1793965750118.jpg',
  apersepsi: '/src/assets/images/apersepsi_pesan_kilat_1793965749714.jpg',
  perangkat: '/src/assets/images/materi_perangkat_jaringan_1793965751586.jpg',
  routing: '/src/assets/images/materi_routing_peta_1793965751713.jpg',
};

export const TUJUAN_SUBPOINTS = [
  {
    id: 'lan',
    code: '01',
    title: 'Mengenal Jaringan Lokal (LAN)',
    detail:
      'Membedakan cara kerja jaringan lokal di ruang kelas atau rumah yang menghubungkan perangkat secara langsung tanpa harus selalu memakai kuota internet.',
  },
  {
    id: 'internet',
    code: '02',
    title: 'Memahami Jaringan Internet Global',
    detail:
      'Menjelaskan bagaimana jutaan jaringan lokal di seluruh dunia saling terhubung melalui penyedia layanan (ISP), router, dan kabel serat optik.',
  },
  {
    id: 'routing',
    code: '03',
    title: 'Memahami Pengiriman Data (Routing)',
    detail:
      'Menelusuri bagaimana data dipecah menjadi paket-paket kecil, diberi alamat IP, dan diarahkan oleh router melalui jalur terbaik menuju tujuan.',
  },
];

export const APERSEPSI_POINTS: CuriosityPoint[] = [
  {
    id: 'chat-kilat',
    title: 'Pesan Chat Kilat Antar Pulau',
    promptQuestion:
      'Bayangkan kamu mengirim pesan "Halo!" dari HP di kamarmu kepada temanmu yang sedang berlibur di pulau lain. Dalam hitungan kurang dari 1 detik, pesan itu sudah muncul di layarnya. Bagaimana mungkin pesan itu tahu jalan menuju HP temanmu dan tidak nyasar ke jutaan HP lain?',
    followUpQuestions: [
      'Apakah pesan dikirim dalam bentuk utuh atau dipecah-pecah?',
      'Siapa yang bertugas menjadi "polisi lalu lintas" di jaringan?',
      'Bagaimana jika ada satu jalur kabel yang sedang sibuk atau putus?',
    ],
    quickPollOptions: [
      'Dikirim langsung lewat udara seperti gelombang radio',
      'Dipecah menjadi paket kecil lalu diarahkan router',
      'Disimpan dulu di satelit baru dikirim ke semua HP',
    ],
  },
  {
    id: 'lab-tanpa-kuota',
    title: 'Berbagi File di Lab Tanpa Kuota',
    promptQuestion:
      'Di laboratorium komputer sekolah, 30 komputer bisa saling mengirim tugas ke komputer guru dengan sangat cepat meskipun kabel internet dari luar sekolah sedang dicabut. Mengapa hal itu bisa terjadi?',
    followUpQuestions: [
      'Perangkat apa yang menghubungkan komputer-komputer di dalam satu ruangan?',
      'Apa bedanya jaringan di dalam ruangan dengan internet?',
    ],
    quickPollOptions: [
      'Karena komputer saling terhubung dalam jaringan lokal (LAN)',
      'Karena komputer memakai Bluetooth jarak jauh',
      'Karena setiap komputer punya kartu SIM masing-masing',
    ],
  },
  {
    id: 'jalur-putus',
    title: 'Misteri Kabel Bawah Laut',
    promptQuestion:
      'Tahukah kamu bahwa sebagian besar data internet antarbenua melewati kabel serat optik di dasar laut? Jika suatu hari ada kabel bawah laut yang rusak terkena jangkar kapal, mengapa kita masih tetap bisa membuka situs web luar negeri?',
    followUpQuestions: [
      'Apakah internet hanya memiliki satu jalur tunggal?',
      'Bagaimana cara jaringan mencari jalan memutar secara otomatis?',
    ],
    quickPollOptions: [
      'Jaringan punya banyak jalur alternatif yang dipilih otomatis',
      'Semua data otomatis pindah ke jaringan telepon rumah',
      'Situs web luar negeri langsung pindah ke server sekolah',
    ],
  },
];

export const ASESMEN_AWAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 'awal-1',
    question:
      'Manakah contoh penggunaan Jaringan Lokal (LAN) yang paling sering kamu temui di sekolah?',
    options: [
      'Membuka video dari server luar negeri menggunakan kuota seluler',
      'Komputer-komputer di lab TIK saling terhubung ke satu printer dan server lokal',
      'Mengirim email ke teman yang tinggal di negara lain',
      'Menonton siaran langsung televisi melalui satelit',
    ],
    correctIndex: 1,
    explanation:
      'Jaringan Lokal (LAN) menghubungkan perangkat dalam area terbatas seperti ruang kelas, lab komputer, atau rumah.',
  },
  {
    id: 'awal-2',
    question:
      'Apa fungsi utama dari Alamat IP (IP Address) pada setiap perangkat yang terhubung ke jaringan?',
    options: [
      'Sebagai kata sandi untuk membuka kunci layar komputer',
      'Sebagai identitas alamat unik agar data tidak salah kirim tujuan',
      'Untuk mempercepat kapasitas penyimpanan harddisk',
      'Untuk mengubah sinyal suara menjadi gambar',
    ],
    correctIndex: 1,
    explanation:
      'Alamat IP berfungsi seperti alamat rumah yang unik sehingga paket data tahu persis ke mana harus dikirim.',
  },
  {
    id: 'awal-3',
    question:
      'Perangkat jaringan yang bertugas mengarahkan paket data antar jaringan yang berbeda disebut...',
    options: ['Monitor', 'Router', 'Keyboard', 'Proyektor'],
    correctIndex: 1,
    explanation:
      'Router adalah perangkat cerdas yang membaca alamat tujuan paket data dan memilihkan jalur terbaik.',
  },
  {
    id: 'awal-4',
    question:
      'Ketika kita mengirim foto berukuran besar melalui internet, bagaimana cara data tersebut dikirim?',
    options: [
      'Dikirim utuh dalam satu bongkahan besar sekaligus',
      'Dipecah menjadi paket-paket data kecil lalu disusun kembali di tujuan',
      'Diubah menjadi teks biasa terlebih dahulu',
      'Dikirim hanya jika semua pengguna internet lain sedang tidur',
    ],
    correctIndex: 1,
    explanation:
      'Data dipecah menjadi paket-paket kecil (packet switching) agar pengiriman lebih cepat, efisien, dan aman.',
  },
];

export const NETWORK_COMPARISON_DATA = [
  {
    type: 'LAN (Local Area Network)',
    scope: '10 m – 1 km (Ruangan / Gedung)',
    speedPercent: 95,
    speedLabel: '100 Mbps – 10 Gbps',
    costLabel: 'Rendah',
    example: 'Lab Komputer Sekolah, Wi-Fi Rumah',
  },
  {
    type: 'MAN (Metropolitan Area Network)',
    scope: '5 km – 50 km (Antar Gedung / Kota)',
    speedPercent: 75,
    speedLabel: '100 Mbps – 1 Gbps',
    costLabel: 'Menengah',
    example: 'Jaringan Antar Kampus / Kantor Pemda',
  },
  {
    type: 'WAN / Internet (Wide Area Network)',
    scope: '> 100 km (Antar Negara / Benua)',
    speedPercent: 60,
    speedLabel: '10 Mbps – 1 Gbps (Bervariasi)',
    costLabel: 'Tinggi (Infrastruktur Global)',
    example: 'Internet Global, Kabel Serat Optik Bawah Laut',
  },
];

export const ASESMEN_AKHIR_QUESTIONS: QuizQuestion[] = [
  {
    id: 'akhir-1',
    question:
      'Perbedaan mendasar antara Jaringan Lokal (LAN) dan Internet adalah...',
    options: [
      'LAN hanya menggunakan kabel, sedangkan Internet hanya menggunakan Wi-Fi',
      'LAN mencakup area terbatas (seperti sekolah/rumah), sedangkan Internet menghubungkan jutaan jaringan di seluruh dunia',
      'LAN tidak membutuhkan alamat IP, sedangkan Internet membutuhkan alamat IP',
      'LAN hanya bisa digunakan oleh 2 komputer, sedangkan Internet maksimal 100 komputer',
    ],
    correctIndex: 1,
    explanation:
      'LAN (Local Area Network) terbatas pada area kecil, sedangkan Internet adalah jaringan global yang menghubungkan berbagai LAN dan WAN di seluruh dunia.',
  },
  {
    id: 'akhir-2',
    question:
      'Dalam proses pengiriman data, mengapa sebuah file gambar dipecah menjadi beberapa paket data kecil?',
    options: [
      'Agar ukuran file menjadi lebih kecil secara permanen',
      'Agar paket bisa melewati jalur berbeda secara efisien dan mudah dikirim ulang jika ada satu paket yang rusak',
      'Karena kabel jaringan hanya bisa dilewati huruf, bukan gambar',
      'Supaya komputer pengirim tidak cepat panas',
    ],
    correctIndex: 1,
    explanation:
      'Pemecahan data menjadi paket (packet switching) membuat jalur jaringan tidak tersumbat dan jika ada 1 paket hilang, cukup paket itu saja yang dikirim ulang.',
  },
  {
    id: 'akhir-3',
    question:
      'Informasi apa saja yang wajib ada di dalam "Header" sebuah paket data agar sampai ke tujuan dengan benar?',
    options: [
      'Nama pemilik komputer dan tanggal lahir',
      'Alamat IP Pengirim, Alamat IP Tujuan, dan Nomor Urut Paket',
      'Merek router dan kecepatan kipas prosesor',
      'Ukuran layar monitor penerima',
    ],
    correctIndex: 1,
    explanation:
      'Header paket berisi IP Pengirim, IP Tujuan, nomor urut paket (untuk menyusun ulang), serta TTL (Time To Live).',
  },
  {
    id: 'akhir-4',
    question:
      'Apa yang dilakukan oleh Router ketika menerima sebuah paket data?',
    options: [
      'Menghapus isi paket data agar lebih ringan',
      'Membaca alamat IP tujuan pada paket, lalu mencocokkannya dengan tabel routing untuk menentukan jalur terbaik berikutnya',
      'Mengirimkan salinan paket ke semua komputer yang ada di dunia',
      'Menyimpan paket tersebut selamanya di dalam memori',
    ],
    correctIndex: 1,
    explanation:
      'Router memeriksa IP tujuan dan menggunakan tabel routing (routing table) untuk meneruskan paket ke hop/router berikutnya yang paling optimal.',
  },
  {
    id: 'akhir-5',
    question:
      'Jika jalur utama antara Router A dan Router B terputus, apa yang akan terjadi pada pengiriman paket data di Internet?',
    options: [
      'Pengiriman data langsung berhenti total selamanya',
      'Router akan mencari jalur alternatif lain yang masih terhubung (rerouting) menuju tujuan',
      'Komputer pengirim akan otomatis mati',
      'Paket data berubah menjadi pesan SMS',
    ],
    correctIndex: 1,
    explanation:
      'Salah satu keunggulan utama routing dinamis adalah kemampuannya mengalihkan paket ke jalur cadangan jika jalur utama mengalami gangguan.',
  },
  {
    id: 'akhir-6',
    question:
      'Perangkat di lab sekolah yang berfungsi menghubungkan banyak komputer dalam satu jaringan lokal (LAN) menggunakan kabel UTP/RJ45 adalah...',
    options: ['Switch', 'Modem Dial-Up', 'Repeater Satelit', 'Flashdisk'],
    correctIndex: 0,
    explanation:
      'Switch menghubungkan banyak perangkat dalam satu LAN dan meneruskan data berdasarkan alamat MAC perangkat di jaringan lokal.',
  },
];
