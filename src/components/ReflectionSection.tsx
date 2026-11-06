import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

const SELF_ASSESSMENT_TOPICS = [
  { id: 'lan', label: 'Membedakan Jaringan Lokal (LAN) dan Internet' },
  { id: 'perangkat', label: 'Mengenal fungsi Switch, Router, dan Kabel Jaringan' },
  { id: 'paket', label: 'Memahami cara data dipecah menjadi paket & diberi Alamat IP' },
  { id: 'routing', label: 'Memahami cara Router memilih jalur terbaik (Routing)' },
];

const RATING_LEVELS = [
  { value: 1, label: 'Perlu Bimbingan' },
  { value: 2, label: 'Cukup Paham' },
  { value: 3, label: 'Paham' },
  { value: 4, label: 'Sangat Paham' },
];

const FEELING_OPTIONS = [
  'Sangat Tertarik & Penasaran',
  'Senang & Mudah Mengerti',
  'Tertantang dengan Simulasi',
  'Masih Perlu Mengulang Materi',
];

const MOTIVATION_GOALS = [
  'Mencoba mengamati perangkat Wi-Fi/Router di rumah atau sekolah',
  'Mengulang simulasi routing dengan skenario jalur putus',
  'Berdiskusi dengan teman kelompok tentang cara kerja internet',
  'Mencari tahu lebih lanjut tentang keamanan jaringan komputer',
];

export const ReflectionSection: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [selectedFeeling, setSelectedFeeling] = useState<string>('');
  const [impressionText, setImpressionText] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleCopySummary = () => {
    const ratingLines = SELF_ASSESSMENT_TOPICS.map((t) => {
      const val = ratings[t.id];
      const label = RATING_LEVELS.find((r) => r.value === val)?.label || 'Belum diisi';
      return `- ${t.label}: ${label}`;
    }).join('\n');

    const summary = `REFLEKSI PEMBELAJARAN TIK KELAS 7
Nama Siswa: ${studentName || '(Belum diisi)'}

1. Penilaian Pemahaman Mandiri:
${ratingLines}

2. Perasaan & Kesan Pembelajaran:
- Perasaan: ${selectedFeeling || '(Belum dipilih)'}
- Kesan/Pesan: ${impressionText || '(Belum diisi)'}

3. Motivasi & Rencana Belajar ke Depan:
- Target: ${selectedGoal || '(Belum dipilih)'}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900">
          Refleksi Pembelajaran Mandiri
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Luangkan waktu sejenak untuk menilai pemahamanmu, mengungkapkan perasaan selama belajar, dan menentukan target belajarmu berikutnya.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Penilaian Pemahaman Mandiri */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                01. Penilaian Pemahaman Materi Secara Mandiri
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih tingkat pemahamanmu untuk setiap topik berikut secara jujur.
              </p>
            </div>

            <div className="space-y-3">
              {SELF_ASSESSMENT_TOPICS.map((topic) => (
                <div
                  key={topic.id}
                  className="p-3.5 bg-[#F8FAFC] border border-slate-200/80 rounded-lg space-y-2.5"
                >
                  <p className="text-sm font-medium text-slate-800">{topic.label}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {RATING_LEVELS.map((lvl) => {
                      const active = ratings[topic.id] === lvl.value;
                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          onClick={() =>
                            setRatings((prev) => ({ ...prev, [topic.id]: lvl.value }))
                          }
                          className={`px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                            active
                              ? 'bg-sky-600 border-sky-600 text-white'
                              : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                          }`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Ekspresi Perasaan & Kesan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                02. Perasaan &amp; Kesan Terhadap Proses Pembelajaran
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Bagaimana perasaanmu setelah mempelajari materi dan mencoba simulasi routing?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {FEELING_OPTIONS.map((feeling) => {
                const active = selectedFeeling === feeling;
                return (
                  <button
                    key={feeling}
                    type="button"
                    onClick={() => setSelectedFeeling(feeling)}
                    className={`text-left px-4 py-3 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                      active
                        ? 'bg-sky-50 border-sky-500 text-sky-900'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {feeling}
                  </button>
                );
              })}
            </div>

            <div>
              <label
                htmlFor="impression-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Bagian mana yang paling menarik atau masih membuatmu penasaran?
              </label>
              <textarea
                id="impression-input"
                rows={3}
                value={impressionText}
                onChange={(e) => setImpressionText(e.target.value)}
                placeholder="Tuliskan kesan atau pertanyaanmu di sini..."
                className="w-full px-3.5 py-2.5 text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900"
              />
            </div>
          </div>

          {/* 3. Motivasi Belajar untuk Perbaikan di Masa Depan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                03. Motivasi &amp; Rencana Belajar ke Depan
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih satu langkah nyata yang akan kamu lakukan untuk memperdalam pemahamanmu.
              </p>
            </div>

            <div className="space-y-2">
              {MOTIVATION_GOALS.map((goal) => {
                const active = selectedGoal === goal;
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => setSelectedGoal(goal)}
                    className={`w-full text-left px-4 py-3 rounded-lg border text-xs sm:text-sm transition-colors ${
                      active
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-medium'
                        : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {goal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Summary Card */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 sticky top-20">
            <h3 className="text-sm font-semibold text-slate-900">
              Ringkasan Refleksi Siswa
            </h3>

            <div>
              <label
                htmlFor="student-name"
                className="block text-xs font-medium text-slate-600 mb-1"
              >
                Nama Lengkap &amp; Kelas
              </label>
              <input
                id="student-name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Contoh: Raka Pratama - 7A"
                className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
              <p>
                <span className="font-semibold text-slate-800">Topik Dinilai: </span>
                <span className="font-mono tabular-nums">
                  {Object.keys(ratings).length} / {SELF_ASSESSMENT_TOPICS.length}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-800">Perasaan: </span>
                {selectedFeeling || 'Belum dipilih'}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Target Belajar: </span>
                {selectedGoal || 'Belum dipilih'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopySummary}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Ringkasan Disalin!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Salin Hasil Refleksi
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
