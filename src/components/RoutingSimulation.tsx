import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Laptop,
  Pause,
  Play,
  Printer,
  RotateCcw,
  Router as RouterIcon,
  Server,
  SkipForward,
} from 'lucide-react';

type NetworkMode = 'lan' | 'internet';

interface SimNode {
  id: string;
  label: string;
  ip: string;
  x: number;
  y: number;
  kind: 'pc' | 'switch' | 'router' | 'server' | 'printer';
}

interface SimEdge {
  from: string;
  to: string;
  label: string;
  isPrimary?: boolean;
  isBackup?: boolean;
}

const LAN_NODES: SimNode[] = [
  { id: 'pc1', label: 'PC Siswa 1', ip: '192.168.1.10', x: 110, y: 110, kind: 'pc' },
  { id: 'pc2', label: 'PC Siswa 2', ip: '192.168.1.11', x: 110, y: 290, kind: 'pc' },
  { id: 'switch', label: 'Switch Lab', ip: 'L2-Switch', x: 340, y: 200, kind: 'switch' },
  { id: 'printer', label: 'Printer Lab', ip: '192.168.1.20', x: 570, y: 110, kind: 'printer' },
  { id: 'server', label: 'Server Tugas', ip: '192.168.1.5', x: 570, y: 290, kind: 'server' },
];

const LAN_EDGES: SimEdge[] = [
  { from: 'pc1', to: 'switch', label: 'UTP 1 Gbps' },
  { from: 'pc2', to: 'switch', label: 'UTP 1 Gbps' },
  { from: 'switch', to: 'printer', label: 'UTP 1 Gbps' },
  { from: 'switch', to: 'server', label: 'UTP 1 Gbps' },
];

const INTERNET_NODES: SimNode[] = [
  { id: 'laptop', label: 'Laptop Siswa', ip: '192.168.1.10', x: 90, y: 200, kind: 'pc' },
  { id: 'r-sekolah', label: 'Router Sekolah', ip: '10.1.1.1', x: 230, y: 200, kind: 'router' },
  { id: 'r-kota-a', label: 'Router Kota A', ip: '10.2.1.1', x: 375, y: 105, kind: 'router' },
  { id: 'r-cadangan', label: 'Router Cadangan', ip: '10.4.1.1', x: 375, y: 295, kind: 'router' },
  { id: 'r-kota-b', label: 'Router Kota B', ip: '10.3.1.1', x: 520, y: 200, kind: 'router' },
  { id: 'web-server', label: 'Server Web', ip: '203.0.113.50', x: 640, y: 200, kind: 'server' },
];

const INTERNET_EDGES: SimEdge[] = [
  { from: 'laptop', to: 'r-sekolah', label: 'Wi-Fi' },
  { from: 'r-sekolah', to: 'r-kota-a', label: 'Fiber 1 Gbps', isPrimary: true },
  { from: 'r-kota-a', to: 'r-kota-b', label: 'Fiber 1 Gbps', isPrimary: true },
  { from: 'r-sekolah', to: 'r-cadangan', label: 'Backup 500 Mbps', isBackup: true },
  { from: 'r-cadangan', to: 'r-kota-b', label: 'Backup 500 Mbps', isBackup: true },
  { from: 'r-kota-b', to: 'web-server', label: 'Fiber 10 Gbps' },
];

export const RoutingSimulation: React.FC = () => {
  const [mode, setMode] = useState<NetworkMode>('internet');
  const [lanTarget, setLanTarget] = useState<'server' | 'printer'>('server');
  const [primaryLinkBroken, setPrimaryLinkBroken] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nodes = mode === 'lan' ? LAN_NODES : INTERNET_NODES;
  const edges = mode === 'lan' ? LAN_EDGES : INTERNET_EDGES;

  const activePath = useMemo<string[]>(() => {
    if (mode === 'lan') {
      return ['pc1', 'switch', lanTarget];
    }
    if (primaryLinkBroken) {
      return ['laptop', 'r-sekolah', 'r-cadangan', 'r-kota-b', 'web-server'];
    }
    return ['laptop', 'r-sekolah', 'r-kota-a', 'r-kota-b', 'web-server'];
  }, [mode, lanTarget, primaryLinkBroken]);

  const maxStep = activePath.length - 1;

  useEffect(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, [mode, lanTarget, primaryLinkBroken]);

  useEffect(() => {
    if (!isPlaying) return;
    if (stepIndex >= maxStep) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, maxStep));
    }, 950);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stepIndex, maxStep]);

  const currentNodeId = activePath[stepIndex];
  const currentNode = nodes.find((n) => n.id === currentNodeId) || nodes[0];
  const sourceNode = nodes.find((n) => n.id === activePath[0]) || nodes[0];
  const destNode = nodes.find((n) => n.id === activePath[maxStep]) || nodes[nodes.length - 1];

  const isDelivered = stepIndex === maxStep;
  const ttlValue = Math.max(64 - stepIndex, 1);

  const stepExplanation = useMemo(() => {
    if (mode === 'lan') {
      if (stepIndex === 0) {
        return `PC Siswa 1 (${sourceNode.ip}) menyiapkan paket data untuk dikirim ke ${destNode.label} (${destNode.ip}) dalam satu jaringan lokal.`;
      }
      if (stepIndex === 1) {
        return `Switch Lab menerima paket dan langsung meneruskannya ke port tujuan tanpa perlu keluar ke internet.`;
      }
      return `Paket data tiba di ${destNode.label} (${destNode.ip}) dengan sangat cepat!`;
    }

    if (stepIndex === 0) {
      return `Laptop Siswa (${sourceNode.ip}) memecah data menjadi paket kecil dan mengirimkannya ke Router Sekolah.`;
    }
    if (stepIndex === 1) {
      return primaryLinkBroken
        ? `Router Sekolah mendeteksi jalur utama ke Kota A sedang putus! Tabel routing otomatis mengalihkan paket ke Router Cadangan.`
        : `Router Sekolah membaca IP tujuan (${destNode.ip}) dan memilih jalur tercepat melalui Router Kota A.`;
    }
    if (stepIndex === 2) {
      return primaryLinkBroken
        ? `Router Cadangan meneruskan paket melalui jalur alternatif menuju Router Kota B.`
        : `Router Kota A meneruskan paket melalui kabel serat optik menuju Router Kota B.`;
    }
    if (stepIndex === 3) {
      return `Router Kota B menerima paket dan mengarahkannya langsung ke jaringan Server Web tujuan.`;
    }
    return `Paket data berhasil sampai di Server Web (${destNode.ip}) setelah melewati ${maxStep} hop!`;
  }, [mode, stepIndex, primaryLinkBroken, sourceNode, destNode, maxStep]);

  const renderNodeIcon = (kind: SimNode['kind']) => {
    switch (kind) {
      case 'pc':
        return <Laptop className="w-5 h-5" />;
      case 'switch':
        return <Cpu className="w-5 h-5" />;
      case 'router':
        return <RouterIcon className="w-5 h-5" />;
      case 'printer':
        return <Printer className="w-5 h-5" />;
      case 'server':
        return <Server className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Simulasi Pengiriman Data &amp; Routing
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Uji coba bagaimana paket data bergerak di Jaringan Lokal (LAN) dan Internet, serta lihat bagaimana Router mencari jalan memutar saat jalur utama terputus.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start shrink-0">
          <button
            type="button"
            onClick={() => setMode('internet')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              mode === 'internet'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Internet (Antar Kota)
          </button>
          <button
            type="button"
            onClick={() => setMode('lan')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              mode === 'lan'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jaringan Lokal (LAN)
          </button>
        </div>
      </div>

      {/* Two-Zone Sandbox Layout: 65% Stage + 35% Control & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Zone: Interactive Network Canvas */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span>Topologi Aktif:</span>
              <span className="text-slate-900 font-semibold">
                {mode === 'lan' ? 'LAN Lab Komputer Sekolah' : 'Jaringan Internet Multi-Router'}
              </span>
            </div>

            {mode === 'internet' ? (
              <button
                type="button"
                onClick={() => setPrimaryLinkBroken((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                  primaryLinkBroken
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                {primaryLinkBroken
                  ? 'Jalur Utama Putus (Klik untuk Perbaiki)'
                  : 'Simulasikan Jalur Utama Putus'}
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600">Tujuan LAN:</span>
                <button
                  type="button"
                  onClick={() => setLanTarget('server')}
                  className={`px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    lanTarget === 'server'
                      ? 'bg-sky-50 border-sky-200 text-sky-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Server Tugas
                </button>
                <button
                  type="button"
                  onClick={() => setLanTarget('printer')}
                  className={`px-2.5 py-1 rounded-md border font-medium transition-colors ${
                    lanTarget === 'printer'
                      ? 'bg-sky-50 border-sky-200 text-sky-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Printer Lab
                </button>
              </div>
            )}
          </div>

          {/* SVG Network Diagram */}
          <div className="relative w-full bg-[#F8FAFC] border border-slate-200/80 rounded-lg overflow-hidden">
            <svg
              viewBox="0 0 720 400"
              className="w-full h-auto block select-none"
              role="img"
              aria-label="Diagram Simulasi Routing Jaringan"
            >
              {/* Edges */}
              {edges.map((edge) => {
                const fromNode = nodes.find((n) => n.id === edge.from);
                const toNode = nodes.find((n) => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                const isBroken = mode === 'internet' && primaryLinkBroken && edge.isPrimary;
                const fromIdx = activePath.indexOf(edge.from);
                const toIdx = activePath.indexOf(edge.to);
                const isOnActivePath =
                  !isBroken && fromIdx !== -1 && toIdx !== -1 && Math.abs(fromIdx - toIdx) === 1;
                const isTraversed =
                  isOnActivePath && Math.max(fromIdx, toIdx) <= stepIndex;

                const midX = (fromNode.x + toNode.x) / 2;
                const midY = (fromNode.y + toNode.y) / 2;

                return (
                  <g key={`${edge.from}-${edge.to}`}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={
                        isBroken
                          ? '#DC2626'
                          : isTraversed
                          ? '#0284C7'
                          : isOnActivePath
                          ? '#7DD3FC'
                          : '#CBD5E1'
                      }
                      strokeWidth={isTraversed ? 4 : isOnActivePath ? 3 : 2}
                      strokeDasharray={isBroken ? '6 6' : edge.isBackup ? '4 4' : undefined}
                    />
                    <rect
                      x={midX - 44}
                      y={midY - 10}
                      width={88}
                      height={18}
                      rx={4}
                      fill="#FFFFFF"
                      stroke="#E2E8F0"
                      strokeWidth={1}
                    />
                    <text
                      x={midX}
                      y={midY + 2}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-600"
                    >
                      {isBroken ? 'PUTUS' : edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node) => {
                const isCurrent = node.id === currentNodeId;
                const isVisited = activePath.indexOf(node.id) !== -1 && activePath.indexOf(node.id) <= stepIndex;
                const isDestination = node.id === destNode.id;

                return (
                  <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                    <circle
                      r={28}
                      fill={isCurrent ? '#0284C7' : isVisited ? '#E0F2FE' : '#FFFFFF'}
                      stroke={
                        isCurrent
                          ? '#0369A1'
                          : isDestination
                          ? '#059669'
                          : isVisited
                          ? '#0284C7'
                          : '#CBD5E1'
                      }
                      strokeWidth={isCurrent ? 3 : 2}
                    />
                    <text
                      y={44}
                      textAnchor="middle"
                      className="text-[12px] font-semibold fill-slate-900"
                    >
                      {node.label}
                    </text>
                    <text
                      y={58}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-slate-500"
                    >
                      {node.ip}
                    </text>
                  </g>
                );
              })}

              {/* Animated Packet Indicator */}
              <g
                transform={`translate(${currentNode.x}, ${currentNode.y - 38})`}
                className="transition-transform duration-500 ease-out"
              >
                <rect
                  x={-34}
                  y={-12}
                  width={68}
                  height={22}
                  rx={6}
                  fill={isDelivered ? '#059669' : '#0284C7'}
                />
                <text
                  x={0}
                  y={3}
                  textAnchor="middle"
                  className="text-[10px] font-mono font-semibold fill-white"
                >
                  {isDelivered ? 'SAMPAI' : 'PAKET #1'}
                </text>
              </g>
            </svg>
          </div>

          {/* Node Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span>Biru: Posisi Paket Saat Ini</span>
              <span aria-hidden="true">·</span>
              <span>Hijau: Tujuan Akhir</span>
              {mode === 'internet' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>Merah Putus-Putus: Jalur Gangguan</span>
                </>
              )}
            </div>
            <span className="font-mono tabular-nums">
              Hop: {stepIndex} / {maxStep}
            </span>
          </div>
        </div>

        {/* Right Zone: Control & Packet Inspector Deck */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-5">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Kontrol Simulasi</h3>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (stepIndex >= maxStep) {
                      setStepIndex(0);
                      setIsPlaying(true);
                    } else {
                      setIsPlaying((prev) => !prev);
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors whitespace-nowrap"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" /> Jeda
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> {stepIndex >= maxStep ? 'Ulangi' : 'Kirim Paket'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIndex((prev) => Math.min(prev + 1, maxStep));
                  }}
                  disabled={stepIndex >= maxStep}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
                >
                  <SkipForward className="w-4 h-4" /> Langkah
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setStepIndex(0);
                  }}
                  aria-label="Reset Simulasi"
                  className="inline-flex items-center justify-center p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Packet Header Inspector */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-900">Inspektor Header Paket</h3>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-medium ${
                    isDelivered ? 'text-emerald-700' : 'text-sky-700'
                  }`}
                >
                  {isDelivered ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terkirim
                    </>
                  ) : (
                    <>
                      {renderNodeIcon(currentNode.kind)} Dalam Perjalanan
                    </>
                  )}
                </span>
              </div>

              <dl className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <dt className="text-slate-500">IP Pengirim</dt>
                  <dd className="font-mono tabular-nums font-medium text-slate-900">
                    {sourceNode.ip}
                  </dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <dt className="text-slate-500">IP Tujuan</dt>
                  <dd className="font-mono tabular-nums font-medium text-slate-900">
                    {destNode.ip}
                  </dd>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <dt className="text-slate-500">Posisi Perangkat</dt>
                  <dd className="font-medium text-slate-900">{currentNode.label}</dd>
                </div>
                <div className="flex justify-between py-1.5">
                  <dt className="text-slate-500">TTL (Batas Hop)</dt>
                  <dd className="font-mono tabular-nums font-medium text-slate-900">{ttlValue}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Live Step Explanation */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs font-semibold text-slate-900 mb-1">
              Proses pada Langkah {stepIndex + 1}:
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">{stepExplanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
