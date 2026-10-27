"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  Headphones,
  Loader2,
  Mic,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Search,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ReciterItem, SurahListItem } from "@/db/queries";
import { surahDisplayName, toArabicDigits } from "@/lib/arabic";
import { cn } from "@/lib/utils";

function pad3(n: number) {
  return String(n).padStart(3, "0");
}

function formatTime(sec: number) {
  if (isNaN(sec) || sec < 0) return "00:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ReciterPlayer({
  reciters,
  surahs,
}: {
  reciters: ReciterItem[];
  surahs: SurahListItem[];
}) {
  const [selectedReciterId, setSelectedReciterId] = useState<number>(
    reciters[0]?.id ?? 1
  );
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [query, setQuery] = useState("");
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const reciter =
    reciters.find((r) => r.id === selectedReciterId) ?? reciters[0];
  const surah = surahs.find((s) => s.id === selectedSurahId) ?? surahs[0];

  const audioUrl = `${reciter.serverUrl}${pad3(surah.id)}.mp3`;

  // MediaSession API integration
  const updateMediaSession = useCallback(() => {
    if ("mediaSession" in navigator && reciter && surah) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${surahDisplayName(surah.name)}`,
        artist: reciter.name,
        album: "نور | Noor — مكتبة التلاوات",
        artwork: [
          { src: "/og.jpg", sizes: "1200x630", type: "image/jpeg" },
          { src: "/icon.svg", sizes: "96x96", type: "image/svg+xml" },
        ],
      });
      navigator.mediaSession.setActionHandler("play", () => {
        audioRef.current?.play();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        audioRef.current?.pause();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        if (selectedSurahId > 1) setSelectedSurahId((s) => s - 1);
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        if (selectedSurahId < 114) setSelectedSurahId((s) => s + 1);
      });
    }
  }, [reciter, surah, selectedSurahId]);

  useEffect(() => {
    updateMediaSession();
  }, [updateMediaSession]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
  };

  const handleNextSurah = () => {
    if (selectedSurahId < 114) {
      setSelectedSurahId((s) => s + 1);
    } else {
      setSelectedSurahId(1);
    }
  };

  const handlePrevSurah = () => {
    if (selectedSurahId > 1) {
      setSelectedSurahId((s) => s - 1);
    } else {
      setSelectedSurahId(114);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 0.75];
    const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.nameSimple.includes(query.trim()) ||
      s.englishName.toLowerCase().includes(query.trim().toLowerCase()) ||
      String(s.id).includes(query.trim())
  );

  return (
    <div className="space-y-8">
      {/* Audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        loop={isLooping}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
            audioRef.current.playbackRate = playbackRate;
            if (isPlaying) audioRef.current.play().catch(() => {});
          }
        }}
        onEnded={() => {
          if (!isLooping) handleNextSurah();
        }}
      />

      {/* Main Player Box */}
      <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-navy p-6 text-ivory shadow-2xl sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 pattern-geo opacity-[0.06]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -end-20 -top-20 size-64 rounded-full bg-gold/10 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-start">
          {/* Track Info */}
          <div className="flex items-center gap-4">
            <span className="relative inline-flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              <Headphones className="size-10" aria-hidden />
              {isPlaying && (
                <span className="absolute -bottom-1 -start-1 flex size-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                  <span className="relative inline-flex size-4 rounded-full bg-teal-bright" />
                </span>
              )}
            </span>
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal/20 px-3 py-1 text-xs font-bold text-gold">
                <Mic className="size-3.5" aria-hidden />
                {reciter.name}
              </span>
              <h2 className="quran-font mt-2 text-2xl font-bold sm:text-3xl">
                سورة {surahDisplayName(surah.name)}
              </h2>
              <p className="mt-1 text-xs font-medium text-ivory/70">
                {surah.revelation === "meccan" ? "مكية" : "مدنية"} ·{" "}
                {toArabicDigits(surah.ayahCount)} آية · {reciter.rewaya}
              </p>
            </div>
          </div>

          {/* Quick External Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href={`/quran/${surah.id}`}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-ivory/20 bg-surface-2/20 px-4 text-xs font-bold text-ivory transition-colors hover:bg-surface-2/40"
            >
              <BookOpen className="size-4" aria-hidden />
              قراءة السورة
            </Link>
            <a
              href={audioUrl}
              download={`Surah-${pad3(surah.id)}-${reciter.slug}.mp3`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-ivory/20 bg-surface-2/20 px-4 text-xs font-bold text-ivory transition-colors hover:bg-surface-2/40"
            >
              <Download className="size-4" aria-hidden />
              تحميل MP3
            </a>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mt-8">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const next = Number(e.target.value);
              setCurrentTime(next);
              if (audioRef.current) audioRef.current.currentTime = next;
            }}
            aria-label="شريط تقدم التلاوة"
            className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-ivory/20 accent-[#D4AF6A] focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between text-xs font-semibold text-ivory/70">
            <span dir="ltr">{formatTime(currentTime)}</span>
            <span dir="ltr">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="relative mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cyclePlaybackRate}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-ivory/10 px-3 text-xs font-bold text-gold hover:bg-ivory/20"
              title="سرعة التلاوة"
            >
              {playbackRate}x
            </button>
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              className={cn(
                "inline-flex size-10 items-center justify-center rounded-xl transition-colors",
                isLooping
                  ? "bg-gold text-navy"
                  : "bg-ivory/10 text-ivory hover:bg-ivory/20"
              )}
              title={isLooping ? "تكرار السورة مفعل" : "تكرار السورة"}
            >
              <Repeat className="size-4.5" aria-hidden />
            </button>
          </div>

          {/* Core Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrevSurah}
              aria-label="السورة السابقة"
              className="inline-flex size-11 items-center justify-center rounded-2xl bg-ivory/10 text-ivory transition-colors hover:bg-ivory/20"
            >
              <SkipForward className="size-5" aria-hidden />
            </button>

            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
              className="inline-flex size-16 items-center justify-center rounded-full bg-gold text-navy shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="size-7 animate-spin" aria-hidden />
              ) : isPlaying ? (
                <Pause className="size-7" aria-hidden />
              ) : (
                <Play className="size-7 translate-x-0.5" aria-hidden />
              )}
            </button>

            <button
              type="button"
              onClick={handleNextSurah}
              aria-label="السورة التالية"
              className="inline-flex size-11 items-center justify-center rounded-2xl bg-ivory/10 text-ivory transition-colors hover:bg-ivory/20"
            >
              <SkipBack className="size-5" aria-hidden />
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextMute = !isMuted;
                setIsMuted(nextMute);
                if (audioRef.current) audioRef.current.muted = nextMute;
              }}
              className="inline-flex size-10 items-center justify-center rounded-xl bg-ivory/10 text-ivory hover:bg-ivory/20"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="size-4.5" />
              ) : (
                <Volume2 className="size-4.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const next = Number(e.target.value);
                setVolume(next);
                setIsMuted(false);
                if (audioRef.current) {
                  audioRef.current.volume = next;
                  audioRef.current.muted = false;
                }
              }}
              aria-label="مستوى الصوت"
              className="hidden h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-ivory/20 accent-[#D4AF6A] sm:inline-block"
            />
          </div>
        </div>
      </div>

      {/* Reciters Selector */}
      <section aria-labelledby="reciters-heading">
        <h2
          id="reciters-heading"
          className="text-lg font-bold text-navy dark:text-ink sm:text-xl"
        >
          اختر القارئ
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {reciters.map((r) => {
            const isSelected = r.id === selectedReciterId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelectedReciterId(r.id);
                  if (isPlaying && audioRef.current) {
                    audioRef.current.play().catch(() => {});
                  }
                }}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-3.5 text-start transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5",
                  isSelected
                    ? "border-brand bg-brand-soft shadow-md ring-1 ring-brand"
                    : "border-line bg-surface hover:border-brand/40"
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-11 shrink-0 items-center justify-center rounded-xl font-bold",
                    isSelected
                      ? "bg-brand text-brand-fg"
                      : "bg-surface-2 text-sub"
                  )}
                >
                  <Mic className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-sm font-bold",
                      isSelected ? "text-brand" : "text-ink"
                    )}
                  >
                    {r.name}
                  </p>
                  <p className="mt-0.5 truncate text-[0.7rem] text-sub">
                    {r.rewaya}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Surahs Grid with Search */}
      <section aria-labelledby="surahs-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="surahs-heading"
              className="text-lg font-bold text-navy dark:text-ink sm:text-xl"
            >
              قائمة سور القرآن الكريم
            </h2>
            <p className="mt-0.5 text-xs text-sub">
              اضغط على أي سورة للاستماع بصوت {reciter.name}
            </p>
          </div>

          <div className="relative min-w-56">
            <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-sub" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن سورة…"
              className="h-10 w-full rounded-xl border border-line bg-surface ps-10 pe-3 text-xs text-ink focus:border-brand focus:outline-2 focus:outline-brand"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {filteredSurahs.map((s) => {
            const isSelected = s.id === selectedSurahId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSurahId(s.id);
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(() => {});
                  }
                }}
                className={cn(
                  "group flex items-center justify-between rounded-xl border p-3 text-start transition-[transform,border-color,background-color] duration-150 hover:-translate-y-0.5",
                  isSelected
                    ? "border-gold/60 bg-gold/10 font-bold"
                    : "border-line bg-surface hover:border-brand/40"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={cn(
                      "inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                      isSelected
                        ? "bg-gold text-navy"
                        : "bg-surface-2 text-sub"
                    )}
                  >
                    {toArabicDigits(s.id)}
                  </span>
                  <span
                    className={cn(
                      "quran-font truncate text-base leading-6",
                      isSelected ? "text-gold-deep dark:text-gold" : "text-ink"
                    )}
                  >
                    سورة {surahDisplayName(s.name)}
                  </span>
                </div>
                {isSelected && isPlaying ? (
                  <span className="flex size-2 shrink-0 rounded-full bg-teal-bright animate-ping" />
                ) : (
                  <Play className="size-3.5 shrink-0 text-sub/40 group-hover:text-brand" />
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
