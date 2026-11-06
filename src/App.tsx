import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import {
  APERSEPSI_POINTS,
  ASESMEN_AKHIR_QUESTIONS,
  ASESMEN_AWAL_QUESTIONS,
  IMAGES,
  NETWORK_COMPARISON_DATA,
  TUJUAN_SUBPOINTS,
} from './data/learningData';
import { RoutingSimulation } from './components/RoutingSimulation';
import { QuizSection } from './components/QuizSection';
import { ReflectionSection } from './components/ReflectionSection';
import { googleSignIn, initAuth, logout } from './services/googleSheets';

type StageId =
  | 'tujuan'
  | 'apersepsi'
  | 'asesmen-awal'
  | 'materi'
  | 'simulasi'
  | 'asesmen-akhir'
  | 'refleksi';

interface StageItem {
  id: StageId;
  number: string;
  label: string;
}

const STAGES: StageItem[] = [
  { id: 'tujuan', number: '01', label: 'Tujuan Pembelajaran' },
  { id: 'apersepsi', number: '02', label: 'Apersepsi' },
  { id: 'asesmen-awal', number: '03', label: 'Asesmen Awal' },
  { id: 'materi', number: '04', label: 'Materi Pokok' },
  { id: 'simulasi', number: '05', label: 'Simulasi Routing' },
  { id: 'asesmen-akhir', number: '06', label: 'Asesmen Akhir' },
  { id: 'refleksi', number: '07', label: 'Refleksi' },
];

type MateriTab = 'lan' | 'internet' | 'perangkat' | 'routing';

export default function App() {
  const [activeStage, setActiveStage] = useState<StageId>('tujuan');
  const [visitedStages, setVisitedStages] = useState<Record<StageId, boolean>>({
    tujuan: true,
    apersepsi: false,
    'asesmen-awal': false,
    materi: false,
    simulasi: false,
    'asesmen-akhir': false,
    refleksi: false,
  });

  // Tujuan state
  const [selectedTujuanId, setSelectedTujuanId] = useState<string>(TUJUAN_SUBPOINTS[0].id);

  // Apersepsi state
  const [selectedApersepsiId, setSelectedApersepsiId] = useState<string>(APERSEPSI_POINTS[0].id);
  const [apersepsiPolls, setApersepsiPolls] = useState<Record<string, number>>({});
  const [studentQuestion, setStudentQuestion] = useState('');
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);

  // Materi state
  const [activeMateriTab, setActiveMateriTab] = useState<MateriTab>('lan');

  // Google Sheets & Auth state
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err) {
      console.error('Google Sign-In error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
    setAccessToken(null);
  };

  const handleSelectStage = (id: StageId) => {
    setActiveStage(id);
    setVisitedStages((prev) => ({ ...prev, [id]: true }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentStageIndex = STAGES.findIndex((s) => s.id === activeStage);
  const nextStage = currentStageIndex < STAGES.length - 1 ? STAGES[currentStageIndex + 1] : null;

  const activeApersepsi =
    APERSEPSI_POINTS.find((p) => p.id === selectedApersepsiId) || APERSEPSI_POINTS[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleSelectStage('tujuan');
            }}
            className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Informatika Kelas 7
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => handleSelectStage('tujuan')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Tujuan
            </button>
            <button
              type="button"
              onClick={() => handleSelectStage('apersepsi')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Apersepsi
            </button>
            <button
              type="button"
              onClick={() => handleSelectStage('materi')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Materi
            </button>
            <button
              type="button"
              onClick={() => handleSelectStage('simulasi')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Simulasi
            </button>
            <button
              type="button"
              onClick={() => handleSelectStage('asesmen-akhir')}
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Evaluasi
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectStage('simulasi')}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Mulai Simulasi
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Selectable 7-Point Learning Navigation */}
        <section aria-label="Poin-poin Pembelajaran">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {STAGES.map((stage) => {
              const isActive = activeStage === stage.id;
              const isVisited = visitedStages[stage.id];
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleSelectStage(stage.id)}
                  className={`text-left p-3 rounded-xl border transition-colors flex flex-col justify-between min-h-[72px] ${
                    isActive
                      ? 'bg-sky-600 border-sky-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-mono tabular-nums ${
                        isActive ? 'text-sky-100' : 'text-slate-400'
                      }`}
                    >
                      {stage.number}
                    </span>
                    {isVisited && !isActive && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    )}
                  </div>
                  <span className="text-xs font-semibold leading-snug mt-1.5">
                    {stage.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* STAGE 01: TUJUAN PEMBELAJARAN */}
        {activeStage === 'tujuan' && (
          <section className="space-y-8">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
              <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center space-y-4">
                <p className="text-xs font-medium text-sky-700">
                  01. Tujuan Pembelajaran · TIK Kelas 7 SMP
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight text-balance">
                  Memahami internet dan jaringan lokal serta cara kerja pengiriman data (routing) dalam konektivitas jaringan.
                </h1>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Melalui media pembelajaran interaktif ini, kamu akan mengamati bagaimana perangkat di sekitar kita saling terhubung dan bagaimana data menemukan jalannya hingga sampai ke tujuan.
                </p>
              </div>

              <div className="lg:col-span-6 bg-slate-100 min-h-[240px] lg:min-h-[340px]">
                <img
                  src={IMAGES.tujuan}
                  alt="Siswa SMP Kelas 7 belajar jaringan komputer di laboratorium TIK"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Selectable Sub-Competency Points */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Poin-Poin Target Belajar (Klik untuk melihat rincian):
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TUJUAN_SUBPOINTS.map((item) => {
                  const isSelected = selectedTujuanId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTujuanId(item.id)}
                      className={`text-left p-5 rounded-xl border transition-colors ${
                        isSelected
                          ? 'bg-sky-50 border-sky-500 text-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-mono text-sky-700 font-semibold">
                        Target {item.code}
                      </span>
                      <h3 className="text-base font-semibold text-slate-900 mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {item.detail}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* STAGE 02: APERSEPSI (Curiosity-sparking, NO explanations) */}
        {activeStage === 'apersepsi' && (
          <section className="space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">
                02. Apersepsi: Mari Bertanya &amp; Menebak!
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Pilih salah satu fenomena di bawah ini. Tidak perlu takut salah—gunakan rasa penasaranmu untuk menebak dan mengajukan pertanyaan!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
                <div className="h-52 bg-slate-100">
                  <img
                    src={IMAGES.apersepsi}
                    alt="Ilustrasi pesan chat dikirim melalui jaringan kabel bawah laut dan router"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-2 flex-1">
                  <p className="text-xs font-semibold text-slate-500">
                    Pilih Fenomena yang Membuatmu Penasaran:
                  </p>
                  {APERSEPSI_POINTS.map((point, idx) => {
                    const active = point.id === selectedApersepsiId;
                    return (
                      <button
                        key={point.id}
                        type="button"
                        onClick={() => setSelectedApersepsiId(point.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors flex items-center gap-2.5 ${
                          active
                            ? 'bg-sky-600 border-sky-600 text-white'
                            : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="font-mono text-xs opacity-75">0{idx + 1}.</span>
                        <span>{point.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <HelpCircle className="w-4 h-4" /> Pertanyaan Pemantik Rasa Ingin Tahu
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {activeApersepsi.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                    {activeApersepsi.promptQuestion}
                  </p>
                </div>

                {/* Quick Guess Poll (no right/wrong explanation yet, just curiosity!) */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-800">
                    Menurut dugaan awalmu, mana yang paling masuk akal?
                  </p>
                  <div className="space-y-2">
                    {activeApersepsi.quickPollOptions.map((opt, idx) => {
                      const isPicked = apersepsiPolls[activeApersepsi.id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setApersepsiPolls((prev) => ({
                              ...prev,
                              [activeApersepsi.id]: idx,
                            }))
                          }
                          className={`w-full text-left px-4 py-2.5 rounded-lg border text-xs sm:text-sm transition-colors ${
                            isPicked
                              ? 'bg-sky-50 border-sky-500 text-sky-900 font-medium'
                              : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {apersepsiPolls[activeApersepsi.id] !== undefined && (
                    <p className="text-xs text-sky-700 font-medium pt-1">
                      Dugaanmu tersimpan! Kita akan membuktikan jawabannya di Materi Pokok dan Simulasi.
                    </p>
                  )}
                </div>

                {/* Student's Own Curiosity Question */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <label
                    htmlFor="curiosity-input"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Tuliskan 1 pertanyaan yang muncul di benakmu tentang hal ini:
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="curiosity-input"
                      type="text"
                      value={studentQuestion}
                      onChange={(e) => setStudentQuestion(e.target.value)}
                      placeholder="Contoh: Kenapa kabel internet tidak putus di dasar laut?"
                      className="flex-1 px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!studentQuestion.trim()) return;
                        setSavedQuestions((prev) => [...prev, studentQuestion.trim()]);
                        setStudentQuestion('');
                      }}
                      className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Catat Pertanyaan
                    </button>
                  </div>
                  {savedQuestions.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      {savedQuestions.map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STAGE 03: ASESMEN AWAL */}
        {activeStage === 'asesmen-awal' && (
          <QuizSection
            title="03. Asesmen Awal (Diagnostik)"
            subtitle="Jawab 4 pertanyaan singkat ini untuk mengetahui sejauh mana pemahaman awalmu sebelum masuk ke materi."
            questions={ASESMEN_AWAL_QUESTIONS}
            mode="diagnostic"
            googleUser={googleUser}
            accessToken={accessToken}
            spreadsheetId={spreadsheetId}
            onSpreadsheetIdChange={setSpreadsheetId}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            isLoggingIn={isLoggingIn}
          />
        )}

        {/* STAGE 04: MATERI POKOK */}
        {activeStage === 'materi' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  04. Materi Pokok: Konektivitas Jaringan &amp; Routing
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Pilih topik di bawah ini untuk mempelajari konsep, perangkat, grafik perbandingan, dan cara kerja routing.
                </p>
              </div>
            </div>

            {/* Selectable Materi Tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'lan', label: '01. Jaringan Lokal (LAN)' },
                { id: 'internet', label: '02. Internet & Grafik Perbandingan' },
                { id: 'perangkat', label: '03. Perangkat Jaringan' },
                { id: 'routing', label: '04. Paket Data & Routing' },
              ].map((tab) => {
                const active = activeMateriTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveMateriTab(tab.id as MateriTab)}
                    className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap ${
                      active
                        ? 'bg-sky-600 border-sky-600 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab 1: LAN */}
            {activeMateriTab === 'lan' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
                <h3 className="text-lg font-semibold text-slate-900">
                  Apa itu Jaringan Lokal (LAN)?
                </h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
                  <strong>LAN (Local Area Network)</strong> adalah jaringan komputer yang menghubungkan perangkat-perangkat dalam area geografis yang terbatas, seperti satu ruang kelas, laboratorium komputer sekolah, kantor, atau rumah.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900">Jangkauan Terbatas</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Mencakup jarak sekitar 10 meter hingga 1 kilometer (dalam satu gedung atau kompleks sekolah).
                    </p>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900">Kecepatan Tinggi</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Transfer data antar komputer sangat cepat (100 Mbps hingga 10 Gbps) dan tidak membutuhkan kuota internet.
                    </p>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] border border-slate-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-slate-900">Berbagi Sumber Daya</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Memudahkan banyak siswa memakai satu printer bersama atau mengumpulkan tugas ke server lokal.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Internet & Grafik Perbandingan */}
            {activeMateriTab === 'internet' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Internet: Jaringan dari Segala Jaringan
                  </h3>
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
                    <strong>Internet (Interconnected Network)</strong> adalah jaringan komunikasi global yang menghubungkan jutaan jaringan lokal (LAN) dan jaringan luas (WAN) di seluruh dunia menggunakan protokol standar (TCP/IP).
                  </p>
                </div>

                {/* Visual Comparison Chart / Graph */}
                <div className="p-5 bg-[#F8FAFC] border border-slate-200 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-900">
                      Grafik Perbandingan Kecepatan &amp; Jangkauan Jaringan
                    </h4>
                    <span className="text-xs text-slate-500">Skala Relatif</span>
                  </div>

                  <div className="space-y-4">
                    {NETWORK_COMPARISON_DATA.map((item) => (
                      <div key={item.type} className="space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between text-xs">
                          <span className="font-semibold text-slate-900">{item.type}</span>
                          <span className="font-mono tabular-nums text-slate-600">
                            {item.speedLabel} · {item.scope}
                          </span>
                        </div>
                        <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-600 rounded-full"
                            style={{ width: `${item.speedPercent}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">Contoh: {item.example}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Perangkat Jaringan */}
            {activeMateriTab === 'perangkat' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6">
                  <img
                    src={IMAGES.perangkat}
                    alt="Perangkat keras jaringan: Router Wi-Fi, Switch, Kabel Fiber Optic, dan Server"
                    referrerPolicy="no-referrer"
                    className="w-full rounded-lg border border-slate-200"
                  />
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Perangkat Utama Pembentuk Jaringan
                  </h3>
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li>
                      <strong className="text-slate-900">1. Router:</strong> Perangkat cerdas yang menghubungkan jaringan lokal (LAN) ke Internet dan menentukan jalur terbaik (routing) bagi paket data.
                    </li>
                    <li>
                      <strong className="text-slate-900">2. Switch:</strong> Menghubungkan banyak komputer dalam satu jaringan lokal (LAN) menggunakan kabel UTP/RJ45.
                    </li>
                    <li>
                      <strong className="text-slate-900">3. Kabel UTP &amp; Fiber Optic:</strong> Media penghantar data. Kabel UTP digunakan di dalam ruangan, sedangkan Fiber Optic (serat kaca) digunakan untuk jarak jauh berkecepatan tinggi.
                    </li>
                    <li>
                      <strong className="text-slate-900">4. Server:</strong> Komputer khusus yang menyediakan layanan atau menyimpan data (seperti situs web, video, atau file tugas) untuk diakses klien.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 4: Paket Data & Routing */}
            {activeMateriTab === 'routing' && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-6">
                  <img
                    src={IMAGES.routing}
                    alt="Diagram cara kerja pengiriman paket data dan pemilihan jalur routing"
                    referrerPolicy="no-referrer"
                    className="w-full rounded-lg border border-slate-200"
                  />
                </div>
                <div className="lg:col-span-6 space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Bagaimana Data Dikirim (Routing)?
                  </h3>
                  <ol className="space-y-3 text-sm text-slate-700 list-decimal list-inside">
                    <li>
                      <strong className="text-slate-900">Pemecahan Data (Packet Switching):</strong> Data besar (seperti foto atau pesan) dipecah menjadi paket-paket kecil agar mudah dikirim.
                    </li>
                    <li>
                      <strong className="text-slate-900">Pemberian Alamat IP:</strong> Setiap paket diberi label <em>Header</em> berisi Alamat IP Pengirim, Alamat IP Tujuan, dan Nomor Urut.
                    </li>
                    <li>
                      <strong className="text-slate-900">Pemilihan Jalur oleh Router:</strong> Router membaca IP Tujuan, lalu memeriksa <em>Routing Table</em> untuk memilih jalur tercepat dan tidak macet.
                    </li>
                    <li>
                      <strong className="text-slate-900">Penyusunan Kembali:</strong> Setibanya di komputer penerima, paket-paket disusun kembali sesuai nomor urutnya menjadi data yang utuh.
                    </li>
                  </ol>
                </div>
              </div>
            )}
          </section>
        )}

        {/* STAGE 05: SIMULASI ROUTING */}
        {activeStage === 'simulasi' && <RoutingSimulation />}

        {/* STAGE 06: ASESMEN AKHIR */}
        {activeStage === 'asesmen-akhir' && (
          <QuizSection
            title="06. Asesmen Akhir (Evaluasi Pemahaman)"
            subtitle="Uji pemahamanmu tentang Jaringan Lokal (LAN), Internet, dan cara kerja Routing melalui 6 soal evaluasi berikut."
            questions={ASESMEN_AKHIR_QUESTIONS}
            mode="evaluation"
            googleUser={googleUser}
            accessToken={accessToken}
            spreadsheetId={spreadsheetId}
            onSpreadsheetIdChange={setSpreadsheetId}
            onGoogleLogin={handleGoogleLogin}
            onGoogleLogout={handleGoogleLogout}
            isLoggingIn={isLoggingIn}
          />
        )}

        {/* STAGE 07: REFLEKSI */}
        {activeStage === 'refleksi' && <ReflectionSection />}

        {/* Bottom Stage Navigation */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Tahap {currentStageIndex + 1} dari {STAGES.length}
          </div>
          {nextStage && (
            <button
              type="button"
              onClick={() => handleSelectStage(nextStage.id)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
            >
              Lanjut ke {nextStage.number}. {nextStage.label}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
