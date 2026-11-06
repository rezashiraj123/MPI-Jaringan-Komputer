import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Sheets.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => cachedAccessToken;

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};

export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : trimmed;
}

export async function createQuizSpreadsheet(accessToken: string): Promise<{
  spreadsheetId: string;
  spreadsheetUrl: string;
}> {
  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: 'Rekap Nilai TIK Kelas 7 - Jaringan & Routing',
      },
      sheets: [
        { properties: { title: 'Asesmen Awal' } },
        { properties: { title: 'Asesmen Akhir' } },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Gagal membuat Google Spreadsheet.');
  }

  const data = await res.json();
  const spreadsheetId = data.spreadsheetId as string;
  const spreadsheetUrl = data.spreadsheetUrl as string;

  const headers = [
    [
      'Waktu',
      'Nama Siswa',
      'Kelas',
      'Skor Benar',
      'Total Soal',
      'Nilai (%)',
      'Ringkasan Jawaban',
    ],
  ];

  // Add headers to both sheets
  await Promise.all([
    fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Asesmen Awal'!A1:G1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: headers }),
      }
    ),
    fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/'Asesmen Akhir'!A1:G1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: headers }),
      }
    ),
  ]);

  return { spreadsheetId, spreadsheetUrl };
}

export async function appendQuizResultToSheet(params: {
  accessToken: string;
  spreadsheetId: string;
  sheetName: 'Asesmen Awal' | 'Asesmen Akhir';
  studentName: string;
  studentClass: string;
  score: number;
  total: number;
  details: string;
}): Promise<void> {
  const {
    accessToken,
    spreadsheetId,
    sheetName,
    studentName,
    studentClass,
    score,
    total,
    details,
  } = params;

  const percentage = Math.round((score / total) * 100);
  const timestamp = new Date().toLocaleString('id-ID');

  const row = [
    timestamp,
    studentName,
    studentClass,
    score,
    total,
    percentage,
    details,
  ];

  const encodedRange = encodeURIComponent(`'${sheetName}'!A:G`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err?.error?.message ||
        'Gagal mengirim nilai ke Google Sheets. Pastikan ID Spreadsheet benar dan Anda memiliki akses edit.'
    );
  }
}

export async function sendQuizResultViaAppsScript(params: {
  webAppUrl: string;
  sheetName: 'Asesmen Awal' | 'Asesmen Akhir';
  studentName: string;
  studentClass: string;
  score: number;
  total: number;
  details: string;
}): Promise<void> {
  const {
    webAppUrl,
    sheetName,
    studentName,
    studentClass,
    score,
    total,
    details,
  } = params;

  const percentage = Math.round((score / total) * 100);
  const timestamp = new Date().toLocaleString('id-ID');

  await fetch(webAppUrl.trim(), {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
    },
    body: JSON.stringify({
      sheetName,
      timestamp,
      studentName,
      studentClass,
      score,
      total,
      percentage,
      details,
    }),
  });
}

export const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  var sheetName = data.sheetName || "Asesmen Awal";
  var sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(["Waktu", "Nama Siswa", "Kelas", "Skor Benar", "Total Soal", "Nilai (%)", "Ringkasan Jawaban"]);
  }
  
  sheet.appendRow([
    data.timestamp,
    data.studentName,
    data.studentClass,
    data.score,
    data.total,
    data.percentage,
    data.details
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}`;
