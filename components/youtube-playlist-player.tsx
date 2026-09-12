"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Shuffle, SkipBack, SkipForward, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractYouTubePlaylistId, extractYouTubeVideoId } from "@/lib/youtube";

interface YouTubePlayer {
  destroy: () => void;
  getPlayerState: () => number;
  loadPlaylist: (options: { list: string }) => void;
  loadVideoById: (videoId: string) => void;
  nextVideo: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  previousVideo: () => void;
  setVolume: (volume: number) => void;
}

interface YouTubeNamespace {
  Player: new (
    element: HTMLElement,
    options: {
      height: string;
      width: string;
      videoId?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady: (event: { target: YouTubePlayer }) => void;
        onStateChange: (event: { data: number }) => void;
      };
    },
  ) => YouTubePlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; CUED: number };
}

declare global {
  interface Window {
    YT?: YouTubeNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YouTubeNamespace> | null = null;

function loadYouTubeApi() {
  if (window.YT) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YouTubeNamespace>((resolve) => {
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
  return apiPromise;
}

export interface YouTubeTrack {
  title: string;
  artist?: string;
  url: string;
}

export function YouTubePlaylistPlayer({
  track,
  onPrevious,
  onNext,
  canNavigatePrevious = false,
  canNavigateNext = false,
  onShuffle,
  canShuffle = false,
  onClose,
}: {
  track: YouTubeTrack | null;
  onPrevious?: () => void;
  onNext?: () => void;
  canNavigatePrevious?: boolean;
  canNavigateNext?: boolean;
  onShuffle?: () => void;
  canShuffle?: boolean;
  onClose?: () => void;
}) {
const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const barRef = useRef<HTMLElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [playlistReady, setPlaylistReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [miniFrom, setMiniFrom] = useState<{ x: number; y: number } | null>(null);
  const [expanding, setExpanding] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);
  const playlistId = track ? extractYouTubePlaylistId(track.url) : null;
  const videoId = track ? extractYouTubeVideoId(track.url) : null;
  const supported = Boolean(playlistId || videoId);

  const barW = 416;
  const barH = 72;
  const naturalBar = (() => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const bottomGap = window.innerWidth < 768 ? 96 : 24;
    const w = Math.min(barW, window.innerWidth - 24);
    return { x: (window.innerWidth - w) / 2, y: window.innerHeight - barH - bottomGap };
  })();

  const getCornerPos = () => {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    const size = 56;
    const bottomGap = window.innerWidth < 768 ? 96 : 24;
    return { x: window.innerWidth - size - 16, y: window.innerHeight - size - bottomGap };
  };

  useEffect(() => {
    if (pos !== null) return;
    setPos(getCornerPos());
  }, [pos]);

  useEffect(() => {
    if (!minimized || miniFrom === null) return;
    const frame = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => setMiniFrom(null));
      return () => cancelAnimationFrame(frame2);
    });
    return () => cancelAnimationFrame(frame);
  }, [minimized, miniFrom]);

  const minimizePlayer = () => {
    const rect = barRef.current?.getBoundingClientRect();
    let start: { x: number; y: number } | null = null;
    if (rect) {
      start = {
        x: rect.left + rect.width / 2 - 28,
        y: rect.top + rect.height / 2 - 28,
      };
    }
    setMiniFrom(start);
    setPos(getCornerPos());
    setMinimized(true);
  };

  const expandPlayer = () => {
    if (expanding) return;
    setExpanding(true);

    const actualBarW = Math.min(barW, (typeof window !== "undefined" ? window.innerWidth : barW) - 24);
    const targetCirclePos = {
      x: naturalBar.x + actualBarW / 2 - 28,
      y: naturalBar.y + barH / 2 - 28,
    };

    setPos(targetCirclePos);

    setTimeout(() => {
      setMinimized(false);
      setExpanding(false);
    }, 400);
  };

  useEffect(() => {
    if (!track || !mountRef.current) return;
    let cancelled = false;
    setPlaylistReady(false);
    if (!playlistId && !videoId) return;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      playerRef.current?.destroy();
      playerRef.current = new YT.Player(mountRef.current, {
        height: "1",
        width: "1",
        playerVars: { autoplay: 0, controls: 0, playsinline: 1, rel: 0 },
        events: {
          onReady: ({ target }) => {
            playerRef.current = target;
            setReady(true);
            setPlaylistReady(Boolean(playlistId));
            if (playlistId) {
              target.loadPlaylist({ list: playlistId });
            }
            else if (videoId) target.loadVideoById(videoId);
            target.setVolume(75);
            // Attempt autoplay, then rely on the Play button if the browser blocks audio.
            window.setTimeout(() => {
              if (!cancelled) {
                target.playVideo();
                setPlaying(true);
              }
            }, 250);
          },
          onStateChange: ({ data }) => {
            if (!window.YT) return;
            if (
              data === window.YT.PlayerState.PLAYING ||
              data === window.YT.PlayerState.PAUSED ||
              data === window.YT.PlayerState.ENDED ||
              data === window.YT.PlayerState.CUED
            ) {
              setPlaylistReady(true);
            }
            setPlaying(data === window.YT.PlayerState.PLAYING);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
      setPlaylistReady(false);
      setPlaying(false);
    };
  }, [track, playlistId, videoId]);

  if (!track) return null;

  const togglePlayback = () => {
    if (!ready || !playerRef.current) return;
    if (playing) {
      playerRef.current.pauseVideo();
      setPlaying(false);
    } else {
      playerRef.current.playVideo();
      setPlaying(true);
    }
  };

  const canNavigateInternal = ready && playlistReady && Boolean(playlistId);

  const moveTrack = (direction: "previous" | "next") => {
    if (!playerRef.current) return;
    const wasPlaying = playing;
    if (direction === "previous" && onPrevious && canNavigatePrevious) {
      onPrevious();
      return;
    }
    if (direction === "next" && onNext && canNavigateNext) {
      onNext();
      return;
    }
    if (!canNavigateInternal) return;
    window.setTimeout(() => {
      if (direction === "previous") playerRef.current?.previousVideo();
      else playerRef.current?.nextVideo();
      if (wasPlaying) window.setTimeout(() => playerRef.current?.playVideo(), 250);
    }, 500);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const startX = event.clientX;
    const startY = event.clientY;
    dragRef.current = {
      startX,
      startY,
      originX: pos?.x ?? 0,
      originY: pos?.y ?? 0,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !pos) return;
    let nx = drag.originX + (event.clientX - drag.startX);
    let ny = drag.originY + (event.clientY - drag.startY);
    if (Math.abs(event.clientX - drag.startX) + Math.abs(event.clientY - drag.startY) > 4) {
      drag.moved = true;
    }
    nx = Math.min(Math.max(nx, 0), window.innerWidth - 56);
    ny = Math.min(Math.max(ny, 0), window.innerHeight - 56);
    setPos({ x: nx, y: ny });
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && !drag.moved) {
      expandPlayer();
    }
  };

  return (
    <>
      <div ref={mountRef} className="fixed left-0 top-0 h-px w-px overflow-hidden opacity-0" aria-hidden />
      {track && pos && !minimized && (
        <section
          ref={barRef}
          className="fixed z-50 overflow-hidden rounded-full border border-primary/20 bg-card/95 shadow-xl backdrop-blur animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: naturalBar.x,
            top: naturalBar.y,
            width: Math.min(barW, (typeof window !== "undefined" ? window.innerWidth : barW) - 24),
          }}
        >
          <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3">
            <button
              type="button"
              onClick={togglePlayback}
              disabled={!ready || !supported}
              className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-neutral-950 bg-neutral-950 shadow-inner transition hover:scale-105 active:scale-95 disabled:opacity-50"
              aria-label={playing ? "Pause" : "Play"}
            >
              <div
                className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_transparent_0_18%,_#171717_19%_20%,_transparent_21%_31%,_#242424_32%_33%,_transparent_34%_45%,_#1a1a1a_46%_47%,_transparent_48%_60%,_#292929_61%_62%,_#090909_63%)] ${playing ? "animate-[spin_2.8s_linear_infinite]" : ""}`}
              />
              <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff0033] text-white shadow-md">
                {playing ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" />
                )}
              </div>
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{track.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {track.artist ?? "YouTube playlist"}
                {!supported && " · URL tidak didukung"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onShuffle}
                disabled={!canShuffle}
                aria-label="Shuffle songs"
                title="Shuffle songs"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => moveTrack("previous")} disabled={!canNavigatePrevious && !canNavigateInternal} aria-label="Previous">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="default" size="icon" onClick={togglePlayback} disabled={!ready || !supported} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" fill="currentColor" />}
              </Button>
              <Button variant="ghost" size="icon-sm" onClick={() => moveTrack("next")} disabled={!canNavigateNext && !canNavigateInternal} aria-label="Next">
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
                aria-label="Keluar dari lagu"
                title="Keluar dari lagu"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={minimizePlayer}
                aria-label="Minimize player"
                title="Perkecil player"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {track && pos && minimized && (() => {
      const current = miniFrom ?? pos;
      const pointerHandlers: React.HTMLAttributes<HTMLDivElement> = {
        onPointerDown: (e) => {
          setDragging(true);
          onPointerDown(e);
        },
        onPointerMove: (e) => onPointerMove(e),
        onPointerUp: () => {
          setDragging(false);
          onPointerUp();
        },
      };
      return (
        <div
          ref={circleRef}
          role="button"
          tabIndex={0}
          {...pointerHandlers}
          className="fixed z-50 touch-none rounded-full select-none focus:outline-none"
          style={{
            left: current.x,
            top: current.y,
            width: 56,
            height: 56,
            transition: dragging ? "none" : "left .45s cubic-bezier(.22,1,.36,1), top .45s cubic-bezier(.22,1,.36,1)",
          }}
          aria-label="Buka lagi player"
          title={track.title}
        >
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border-4 border-neutral-950 bg-neutral-950 shadow-xl">
            <div
              className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_transparent_0_18%,_#171717_19%_20%,_transparent_21%_31%,_#242424_32%_33%,_transparent_34%_45%,_#1a1a1a_46%_47%,_transparent_48%_60%,_#292929_61%_62%,_#090909_63%)] ${playing ? "animate-[spin_2.8s_linear_infinite]" : ""}`}
            />
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onClick={(e) => {
                e.stopPropagation();
                togglePlayback();
              }}
              className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#ff0033] text-white shadow-md"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}
            </button>
          </div>
        </div>
      );
    })()}
    </>
  );
}
