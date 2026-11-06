import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  LogOut,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { QuizQuestion } from '../data/learningData';
import {
  APPS_SCRIPT_TEMPLATE,
  appendQuizResultToSheet,
  createQuizSpreadsheet,
  extractSpreadsheetId,
  sendQuizResultViaAppsScript,
} from '../services/googleSheets';

interface QuizSectionProps {
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  mode: 'diagnostic' | 'evaluation';
  googleUser: User | null;
  accessToken: string | null;
  spreadsheetId: string;
  onSpreadsheetIdChange: (id: string) => void;
  onGoogleLogin: () => Promise<void>;
  onGoogleLogout: () => Promise<void>;
  isLoggingIn: boolean;
  onComplete?: (score: number, total: number) => void;
}

type ConnectionMode = 'apps-script' | 'oauth';

export const QuizSection: React.FC<QuizSectionProps> = ({
  title,
  subtitle,
  questions,
  mode,
  googleUser,
  accessToken,
  spreadsheetId,
  onSpreadsheetIdChange,
  onGoogleLogin,
  onGoogleLogout,
  isLoggingIn,
  onComplete,
}) => {
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('apps-script');
  const [webAppUrl, setWebAppUrl] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get('sheetUrl') ||
      localStorage.getItem('mpi_tik7_apps_script_url') ||
      ''
    );
  });
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('7A');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [isSendingToSheet, setIsSendingToSheet] = useState(false);
  const [sheetStatus, setSheetStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const sheetName = mode === 'diagnostic' ? 'Asesmen Awal' : 'Asesmen Akhir';
  const answeredCount = Object.keys(selectedAnswers).length;
  const allAnswered = answeredCount === questions.length;

  const correctCount = questions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);

  const scorePercent = Math.round((correctCount / questions.length) * 100);

  const handleWebAppUrlChange = (val: string) => {
    setWebAppUrl(val);
    localStorage.setItem('mpi_tik7_apps_script_url', val);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedScript(true);
    window.setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSelect = (questionId: string, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const canSendToSheet =
    connectionMode === 'apps-script'
      ? Boolean(webAppUrl.trim())
      : Boolean(accessToken && spreadsheetId.trim());

  const sendResultsToGoogleSheets = async (
    currentScore: number,
    currentAnswers: Record<string, number>
  ) => {
    if (!canSendToSheet) return;

    setIsSendingToSheet(true);
    setSheetStatus(null);
    try {
      const details = questions
        .map((q, idx) => {
          const ans = currentAnswers[q.id];
          const letter = ans !== undefined ? String.fromCharCode(65 + ans) : '-';
          const mark = ans === q.correctIndex ? 'Benar' : 'Salah';
          return `No.${idx + 1}:${letter}(${mark})`;
        })
        .join(', ');

      if (connectionMode === 'apps-script') {
        await sendQuizResultViaAppsScript({
          webAppUrl,
          sheetName,
          studentName: studentName.trim() || 'Siswa Kelas 7',
          studentClass: studentClass.trim() || '7A',
          score: currentScore,
          total: questions.length,
          details,
        });
      } else if (accessToken) {
        const cleanId = extractSpreadsheetId(spreadsheetId);
        await appendQuizResultToSheet({
          accessToken,
          spreadsheetId: cleanId,
          sheetName,
          studentName: studentName.trim() || 'Siswa Kelas 7',
          studentClass: studentClass.trim() || '7A',
          score: currentScore,
          total: questions.length,
          details,
        });
      }

      setSheetStatus({
        type: 'success',
        message: `Nilai ${sheetName} berhasil dikirim ke Google Sheets!`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal mengirim data ke Google Sheets.';
      setSheetStatus({ type: 'error', message: msg });
    } finally {
      setIsSendingToSheet(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    if (onComplete) {
      onComplete(correctCount, questions.length);
    }
    if (canSendToSheet) {
      await sendResultsToGoogleSheets(correctCount, selectedAnswers);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setSheetStatus(null);
  };

  const handleCreateNewSheet = async () => {
    if (!accessToken) return;
    setIsCreatingSheet(true);
    setSheetStatus(null);
    try {
      const { spreadsheetId: newId } = await createQuizSpreadsheet(accessToken);
      onSpreadsheetIdChange(newId);
      setSheetStatus({
        type: 'success',
        message:
          'Spreadsheet baru berhasil dibuat dengan tab "Asesmen Awal" dan "Asesmen Akhir"!',
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Gagal membuat Spreadsheet baru.';
      setSheetStatus({ type: 'error', message: msg });
    } finally {
      setIsCreatingSheet(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
          Terjawab: {answeredCount} / {questions.length}
        </div>
      </div>

      {/* Google Sheets Connection & Student Identity Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Rekap Nilai ke Google Sheets ({sheetName})
              </h3>
              <p className="text-xs text-slate-500">
                {connectionMode === 'apps-script'
                  ? 'Mode Tanpa Login Siswa: Siswa cukup isi Nama & Kelas, nilai langsung masuk ke Spreadsheet Guru.'
                  : 'Mode Login Guru: Hubungkan akun Google Guru untuk membuat atau memilih Spreadsheet.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start shrink-0">
            <button
              type="button"
              onClick={() => setConnectionMode('apps-script')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                connectionMode === 'apps-script'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tanpa Login Siswa
            </button>
            <button
              type="button"
              onClick={() => setConnectionMode('oauth')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                connectionMode === 'oauth'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login Google Guru
            </button>
          </div>
        </div>

        {/* Student Name & Class */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100">
          <div className="sm:col-span-4">
            <label
              htmlFor={`name-${mode}`}
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Nama Siswa
            </label>
            <input
              id={`name-${mode}`}
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label
              htmlFor={`class-${mode}`}
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Kelas
            </label>
            <input
              id={`class-${mode}`}
              type="text"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value)}
              placeholder="7A"
              className="w-full px-3 py-2 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
            />
          </div>

          {connectionMode === 'apps-script' ? (
            <div className="sm:col-span-6">
              <label
                htmlFor={`webapp-${mode}`}
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                URL Web App Google Apps Script (Diisi Guru)
              </label>
              <input
                id={`webapp-${mode}`}
                type="url"
                value={webAppUrl}
                onChange={(e) => handleWebAppUrlChange(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-3 py-2 text-xs font-mono bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>
          ) : (
            <div className="sm:col-span-6">
              <label
                htmlFor={`sheet-${mode}`}
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                ID atau URL Google Spreadsheet
              </label>
              <div className="flex gap-2">
                <input
                  id={`sheet-${mode}`}
                  type="text"
                  value={spreadsheetId}
                  onChange={(e) => onSpreadsheetIdChange(e.target.value)}
                  placeholder="Tempel URL/ID Spreadsheet atau klik Buat Baru"
                  className="flex-1 px-3 py-2 text-xs font-mono bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
                {googleUser && accessToken ? (
                  <button
                    type="button"
                    onClick={handleCreateNewSheet}
                    disabled={isCreatingSheet}
                    className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    {isCreatingSheet ? 'Membuat...' : 'Buat Baru'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onGoogleLogin}
                    disabled={isLoggingIn}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    {isLoggingIn ? 'Masuk...' : 'Sign in with Google'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Collapsible Teacher Guide for Apps Script */}
        {connectionMode === 'apps-script' && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowScriptGuide((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 hover:text-sky-800"
            >
              {showScriptGuide ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
              Panduan &amp; Kode Apps Script untuk Guru (Klik untuk melihat)
            </button>

            {showScriptGuide && (
              <div className="mt-3 p-4 bg-[#F8FAFC] border border-slate-200 rounded-lg space-y-3 text-xs text-slate-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Buka <strong>Google Sheets</strong> baru di akun Google Guru, lalu klik menu{' '}
                    <strong>Ekstensi (Extensions) → Apps Script</strong>.
                  </li>
                  <li>Hapus kode lama, lalu tempel kode di bawah ini dan klik ikon Simpan.</li>
                  <li>
                    Klik <strong>Deploy → New deployment → Web app</strong>. Pada bagian{' '}
                    <em>Who has access</em>, pilih <strong>Anyone (Siapa saja)</strong>, lalu klik{' '}
                    <strong>Deploy</strong>.
                  </li>
                  <li>
                    Salin <strong>Web app URL</strong> yang muncul dan tempelkan ke kolom URL di atas.
                  </li>
                </ol>

                <div className="relative">
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-[11px] font-mono leading-relaxed">
                    {APPS_SCRIPT_TEMPLATE}
                  </pre>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3 h-3" /> Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Salin Kode
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {connectionMode === 'oauth' && googleUser && accessToken && (
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <span>Akun: {googleUser.email}</span>
              <button
                type="button"
                onClick={onGoogleLogout}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 underline"
              >
                <LogOut className="w-3 h-3" /> Keluar
              </button>
            </div>
            {spreadsheetId.trim() && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${extractSpreadsheetId(
                  spreadsheetId
                )}/edit`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sky-600 hover:underline font-medium"
              >
                Buka Google Sheets <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {sheetStatus && (
          <div
            className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
              sheetStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {sheetStatus.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{sheetStatus.message}</span>
          </div>
        )}
      </div>

      {isSubmitted && (
        <div className="p-5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              {mode === 'diagnostic' ? 'Hasil Pemetaan Awal' : 'Hasil Evaluasi Akhir'}
            </p>
            <p className="text-lg font-semibold text-slate-900 mt-0.5 tabular-nums">
              Skor Kamu: {correctCount} dari {questions.length} Benar ({scorePercent}%)
            </p>
            <p className="text-sm text-slate-600 mt-1">
              {mode === 'diagnostic'
                ? scorePercent >= 75
                  ? 'Pemahaman awalmu sudah sangat baik! Lanjutkan ke Materi Pokok dan Simulasi untuk memperdalam konsep routing.'
                  : 'Tidak apa-apa! Asesmen awal ini membantu kita mengetahui bagian mana yang perlu kamu pelajari lebih fokus di Materi Pokok.'
                : scorePercent >= 80
                ? 'Luar biasa! Kamu sudah memahami perbedaan Jaringan Lokal, Internet, dan cara kerja Routing dengan sangat baik.'
                : 'Bagus! Periksa kembali pembahasan di bawah ini atau coba ulangi Simulasi Routing untuk memperkuat pemahamanmu.'}
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {canSendToSheet && (
              <button
                type="button"
                onClick={() => sendResultsToGoogleSheets(correctCount, selectedAnswers)}
                disabled={isSendingToSheet}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap"
              >
                {isSendingToSheet ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Kirim ke Sheets
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Ulangi Kuis
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q, qIdx) => {
          const userChoice = selectedAnswers[q.id];
          const isCorrect = userChoice === q.correctIndex;

          return (
            <div
              key={q.id}
              className="bg-white border border-slate-200 rounded-xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                  <span className="font-mono text-slate-400 mr-2 tabular-nums">
                    {String(qIdx + 1).padStart(2, '0')}.
                  </span>
                  {q.question}
                </p>
                {isSubmitted && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 ${
                      isCorrect ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Benar
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Kurang Tepat
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, oIdx) => {
                  const isSelected = userChoice === oIdx;
                  const isRightOption = q.correctIndex === oIdx;

                  let buttonStyle =
                    'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/70';

                  if (isSubmitted) {
                    if (isRightOption) {
                      buttonStyle =
                        'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium';
                    } else if (isSelected && !isRightOption) {
                      buttonStyle = 'bg-red-50 border-red-300 text-red-900';
                    } else {
                      buttonStyle = 'bg-slate-50 border-slate-200 text-slate-400';
                    }
                  } else if (isSelected) {
                    buttonStyle = 'bg-sky-50 border-sky-500 text-sky-900 font-medium';
                  }

                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelect(q.id, oIdx)}
                      className={`text-left px-4 py-3 rounded-lg border text-xs sm:text-sm transition-colors flex items-start gap-2.5 ${buttonStyle}`}
                    >
                      <span className="font-mono text-xs opacity-70 shrink-0 mt-0.5">
                        {String.fromCharCode(65 + oIdx)}.
                      </span>
                      <span className="leading-snug">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isSubmitted && (
                <div className="pt-2 text-xs text-slate-600 border-t border-slate-100">
                  <span className="font-semibold text-slate-800">Pembahasan: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSubmitted && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={!allAnswered}
            onClick={handleSubmit}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {allAnswered
              ? 'Periksa Jawaban'
              : `Jawab Semua Soal (${answeredCount}/${questions.length})`}
          </button>
        </div>
      )}
    </div>
  );
};
