import React, { useState } from 'react';
import { RESEARCH_NOTES, ResearchNote } from '../data/researchData';
import { X, ArrowUpRight, BookOpen } from 'lucide-react';

const BlueprintIllustration: React.FC<{ type: ResearchNote['blueprintType'] }> = ({
  type,
}) => {
  switch (type) {
    case 'turbine':
      // Isometric multi-stage cylindrical filter assembly (matching 00:30 top-left)
      return (
        <svg
          viewBox="0 0 320 180"
          className="w-full h-full"
          aria-hidden="true"
        >
          {/* Yellow technical highlight zone */}
          <ellipse
            cx="155"
            cy="90"
            rx="46"
            ry="62"
            fill="rgba(234, 179, 8, 0.16)"
            transform="rotate(-12 155 90)"
          />
          {/* Isometric axis line */}
          <line
            x1="30"
            y1="125"
            x2="290"
            y2="55"
            stroke="#1d4ed8"
            strokeWidth="0.9"
            strokeDasharray="4 3"
          />
          {[0, 1, 2, 3, 4].map((idx) => {
            const cx = 85 + idx * 36;
            const cy = 110 - idx * 10;
            const rx = 26 + (idx % 2) * 8;
            const ry = 44 + (idx % 2) * 10;
            return (
              <g key={idx}>
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="1"
                />
                <ellipse
                  cx={cx}
                  cy={cy}
                  rx={rx * 0.6}
                  ry={ry * 0.6}
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="0.7"
                  strokeDasharray="2 2"
                />
              </g>
            );
          })}
          {/* Technical callout lines */}
          <polyline
            points="120,45 145,25 210,25"
            fill="none"
            stroke="#1d4ed8"
            strokeWidth="0.8"
          />
          <rect x="210" y="18" width="54" height="14" fill="rgba(234,179,8,0.28)" stroke="#1d4ed8" strokeWidth="0.7" />
        </svg>
      );

    case 'radial':
      // Radial burst with concentric rings and yellow nodes (matching 00:30 top-center)
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden="true">
          <circle cx="160" cy="90" r="68" fill="none" stroke="#1d4ed8" strokeWidth="0.6" strokeDasharray="3 3" />
          <circle cx="160" cy="90" r="42" fill="none" stroke="#1d4ed8" strokeWidth="0.6" />
          {Array.from({ length: 28 }).map((_, i) => {
            const angle = (i / 28) * Math.PI * 2;
            const r = 35 + ((i * 17) % 45);
            const x2 = 160 + Math.cos(angle) * r;
            const y2 = 90 + Math.sin(angle) * r;
            return (
              <g key={i}>
                <line x1="160" y1="90" x2={x2} y2={y2} stroke="#1d4ed8" strokeWidth="0.75" />
                <circle
                  cx={x2}
                  cy={y2}
                  r={i % 4 === 0 ? 4.5 : 2}
                  fill={i % 4 === 0 ? 'rgba(234,179,8,0.65)' : '#1d4ed8'}
                  stroke="#1d4ed8"
                  strokeWidth="0.7"
                />
              </g>
            );
          })}
        </svg>
      );

    case 'funnel':
      // Converging spline funnel through a vertical gate (matching 00:30 top-right)
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden="true">
          <rect x="188" y="20" width="8" height="140" fill="rgba(234,179,8,0.35)" stroke="#1d4ed8" strokeWidth="0.9" />
          {[-65, -45, -25, -10, 10, 25, 45, 65].map((offset, idx) => (
            <path
              key={idx}
              d={`M 20 ${90 + offset} C 100 ${90 + offset}, 140 90, 192 90 L 295 ${90 + offset * 0.25}`}
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="0.85"
            />
          ))}
          <circle cx="192" cy="90" r="6" fill="#eab308" stroke="#1d4ed8" strokeWidth="1" />
        </svg>
      );

    case 'circuit':
      // Orthogonal CAD circuit routing schematic (matching 00:32 bottom-left)
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden="true">
          <rect x="45" y="36" width="60" height="42" fill="none" stroke="#1d4ed8" strokeWidth="0.9" />
          <rect x="135" y="65" width="52" height="52" fill="rgba(234,179,8,0.22)" stroke="#1d4ed8" strokeWidth="1" />
          <rect x="225" y="32" width="55" height="45" fill="none" stroke="#1d4ed8" strokeWidth="0.9" />
          <rect x="225" y="102" width="55" height="42" fill="none" stroke="#1d4ed8" strokeWidth="0.9" />
          <polyline points="105,57 160,57 160,65" fill="none" stroke="#1d4ed8" strokeWidth="0.9" />
          <polyline points="187,82 208,82 208,54 225,54" fill="none" stroke="#1d4ed8" strokeWidth="0.9" />
          <polyline points="187,100 208,100 208,124 225,124" fill="none" stroke="#1d4ed8" strokeWidth="0.9" />
          <polyline points="75,78 75,135 160,135 160,117" fill="none" stroke="#1d4ed8" strokeWidth="0.8" strokeDasharray="3 2" />
        </svg>
      );

    case 'grid-matrix':
      // Architectural state matrix with yellow zones (matching 00:32 bottom-center)
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden="true">
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => {
              const x = 44 + col * 60;
              const y = 26 + row * 44;
              const isHighlighted = (row === 0 && col === 1) || (row === 1 && col === 2) || (row === 2 && col === 0);
              return (
                <g key={`${row}-${col}`}>
                  <rect
                    x={x}
                    y={y}
                    width="48"
                    height="32"
                    fill={isHighlighted ? 'rgba(234,179,8,0.28)' : 'none'}
                    stroke="#1d4ed8"
                    strokeWidth="0.85"
                  />
                  <line x1={x + 8} y1={y + 16} x2={x + 40} y2={y + 16} stroke="#1d4ed8" strokeWidth="0.6" />
                </g>
              );
            })
          )}
        </svg>
      );

    case 'horizon':
    default:
      // Perspective vanishing grid horizon (matching 00:32 bottom-right)
      return (
        <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden="true">
          <line x1="0" y1="88" x2="320" y2="88" stroke="#1d4ed8" strokeWidth="1" />
          {[-140, -90, -45, 0, 45, 90, 140].map((offset, i) => (
            <g key={i}>
              <line x1="160" y1="88" x2={160 + offset * 2.2} y2="180" stroke="#1d4ed8" strokeWidth="0.7" />
              <line x1="160" y1="88" x2={160 + offset * 2.2} y2="0" stroke="#1d4ed8" strokeWidth="0.5" strokeDasharray="2 3" />
            </g>
          ))}
          {[108, 132, 160].map((y, i) => (
            <line key={i} x1="0" y1={y} x2="320" y2={y} stroke="#1d4ed8" strokeWidth="0.65" />
          ))}
          <circle cx="160" cy="88" r="14" fill="rgba(234,179,8,0.3)" stroke="#1d4ed8" strokeWidth="0.9" />
        </svg>
      );
  }
};

interface ResearchNotesSectionProps {
  onLoadScenarioInDemo?: () => void;
}

export const ResearchNotesSection: React.FC<ResearchNotesSectionProps> = ({
  onLoadScenarioInDemo,
}) => {
  const [selectedNote, setSelectedNote] = useState<ResearchNote | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const categories = [
    'ALL',
    'METHODOLOGY',
    'RESEARCH',
    'ARCHITECTURE',
    'PROTOCOL',
    'EXPLAINABILITY',
  ];
  const filteredNotes =
    activeFilter === 'ALL'
      ? RESEARCH_NOTES
      : RESEARCH_NOTES.filter((n) => n.category === activeFilter);

  return (
    <section
      id="research-notes"
      aria-label="Research and Evaluation Methodology"
      className="py-24 md:py-32 border-b border-[#141413]/12"
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-14 lg:px-20">
        {/* Top Section Header matching 00:30 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12 md:pb-16">
          <div className="lg:col-span-6">
            <h2 className="font-serif-editorial text-[36px] sm:text-[48px] leading-[1.06] tracking-[-0.02em] text-[#141413] max-w-[460px]">
              Notes from the AI context security frontier.
            </h2>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between gap-6">
            <p className="font-serif-editorial text-[18px] sm:text-[21px] leading-[1.48] text-[#4a4945] max-w-[490px]">
              Research, evaluation methodology, and architectural field notes on
              governing sensitive data before it leaves an AI workflow.
            </p>

            {/* Interactive Category Filter Bar */}
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`px-3 py-1 font-mono-tech text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer ${
                    activeFilter === cat
                      ? 'bg-[#141413] text-[#f4f3ef]'
                      : 'bg-[#d5d3cc] text-[#52514d] hover:text-[#141413]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3x2 Blueprint Research Card Grid matching 00:30-00:34 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <article
              key={note.id}
              onClick={() => setSelectedNote(note)}
              className="group bg-[#d6d4cd]/70 hover:bg-[#d0cebe]/75 border border-[#141413]/10 transition-all duration-200 flex flex-col justify-between cursor-pointer"
            >
              <div>
                {/* Top Blueprint Technical Schematic Frame */}
                <div className="aspect-[16/10] w-full bg-blueprint-grid border-b border-[#141413]/10 overflow-hidden p-3 flex items-center justify-center group-hover:scale-[1.01] transition-transform duration-300">
                  <BlueprintIllustration type={note.blueprintType} />
                </div>

                {/* Card Content */}
                <div className="p-6">
                  {/* Unboxed Monospace Metadata matching 00:30-00:33 */}
                  <div className="flex items-center gap-8 font-mono-tech text-[10px] tracking-[0.12em] uppercase text-[#686762]">
                    <span>{note.category}</span>
                    <span>{note.date}</span>
                  </div>

                  <h3 className="mt-4 font-serif-editorial text-[22px] sm:text-[24px] leading-[1.2] tracking-[-0.015em] text-[#141413] group-hover:underline decoration-[#141413]/40 underline-offset-4">
                    {note.title}
                  </h3>

                  <p className="mt-3 text-[13px] leading-[1.58] text-[#52514d]">
                    {note.summary}
                  </p>
                </div>
              </div>

              {/* Card Bottom Author & Read Time Row matching 00:31-00:33 */}
              <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 bg-[#141413] text-[#f4f3ef] font-mono-tech text-[10px] flex items-center justify-center rounded-xs">
                    {note.author[0].toUpperCase()}
                  </div>
                  <span className="text-[12px] font-medium text-[#141413]">
                    {note.author}
                  </span>
                </div>

                <div className="corner-ticks relative px-2.5 py-1 font-mono-tech text-[9px] tracking-[0.1em] uppercase text-[#52514d]">
                  <span className="corner-ticks-inner" />• {note.readTime}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Research Note Reader Modal */}
      {selectedNote && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="research-modal-title"
          data-lenis-prevent
          className="fixed inset-0 z-50 bg-[#141413]/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedNote(null)}
        >
          <div
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            className="bg-[#eceae4] border border-[#141413]/25 max-w-[720px] w-full max-h-[88vh] overflow-y-auto p-6 sm:p-10 shadow-2xl relative"
          >
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#141413]/12">
              <div className="flex items-center gap-3 font-mono-tech text-[10px] tracking-[0.12em] uppercase text-[#686762]">
                <BookOpen className="w-3.5 h-3.5 text-[#141413]" />
                <span>{selectedNote.category}</span>
                <span>·</span>
                <span>{selectedNote.date}</span>
                <span>·</span>
                <span>{selectedNote.readTime} READ</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                aria-label="Close research note"
                className="p-1.5 text-[#141413] hover:bg-[#141413]/10 rounded-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-6 h-[160px] bg-blueprint-grid border border-[#141413]/15 p-4">
              <BlueprintIllustration type={selectedNote.blueprintType} />
            </div>

            <h3
              id="research-modal-title"
              className="font-serif-editorial text-[28px] sm:text-[34px] leading-[1.15] text-[#141413]"
            >
              {selectedNote.title}
            </h3>

            <div className="mt-2 text-[12px] text-[#686762]">
              By <strong className="text-[#141413]">{selectedNote.author}</strong> ·{' '}
              {selectedNote.authorRole}
            </div>

            <p className="mt-6 font-serif-editorial text-[17px] leading-[1.6] text-[#222220]">
              {selectedNote.fullAbstract}
            </p>

            <div className="mt-6 pt-6 border-t border-[#141413]/12">
              <h4 className="font-mono-tech text-[10px] tracking-[0.14em] uppercase text-[#686762] mb-3">
                KEY EVALUATION &amp; ARCHITECTURAL MECHANISMS
              </h4>
              <ul className="space-y-2.5">
                {selectedNote.methodologyPoints.map((pt, i) => (
                  <li
                    key={i}
                    className="text-[13px] leading-[1.55] text-[#141413] flex items-start gap-2.5"
                  >
                    <span className="font-mono-tech text-[11px] text-[#D94E34] mt-0.5">
                      0{i + 1}.
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 pt-5 border-t border-[#141413]/12 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => {
                  setSelectedNote(null);
                  onLoadScenarioInDemo?.();
                }}
                className="px-5 py-2.5 rounded-full bg-[#141413] text-[#f4f3ef] text-[12px] font-medium flex items-center gap-1.5 hover:bg-[#2a2a28] cursor-pointer"
              >
                Test in Live Evaluator
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedNote(null)}
                className="px-4 py-2 text-[12px] font-mono-tech text-[#52514d] hover:text-[#141413] cursor-pointer"
              >
                Close Note
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
