"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Shuffle, SkipBack, SkipForward } from "lucide-react";
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
}: {
  track: YouTubeTrack | null;
  onPrevious?: () => void;
  onNext?: () => void;
  canNavigatePrevious?: boolean;
  canNavigateNext?: boolean;
  onShuffle?: () => void;
  canShuffle?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playlistReady, setPlaylistReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const playlistId = track ? extractYouTubePlaylistId(track.url) : null;
  const videoId = track ? extractYouTubeVideoId(track.url) : null;
  const supported = Boolean(playlistId || videoId);

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

  return (
    <section className="fixed bottom-24 left-1/2 z-50 w-[min(26rem,calc(100vw-1.5rem))] -translate-x-1/2 overflow-hidden rounded-full border border-primary/20 bg-card/95 shadow-xl backdrop-blur lg:bottom-6">
      <div ref={mountRef} className="absolute h-px w-px overflow-hidden opacity-0" aria-hidden />
      <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3">
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-neutral-950 bg-neutral-950 shadow-inner">
          <div
            className={`absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,_transparent_0_18%,_#171717_19%_20%,_transparent_21%_31%,_#242424_32%_33%,_transparent_34%_45%,_#1a1a1a_46%_47%,_transparent_48%_60%,_#292929_61%_62%,_#090909_63%)] ${playing ? "animate-[spin_2.8s_linear_infinite]" : ""}`}
          />
          <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-[#ff0033] text-white shadow-md">
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
          </div>
        </div>
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
        </div>
      </div>
    </section>
  );
}
