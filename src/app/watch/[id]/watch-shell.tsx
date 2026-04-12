"use client";

import { useCallback } from "react";
import { VideoPlayer } from "@/components/video-player";

type Props = {
  movieId: string;
  src: string;
  poster?: string;
  subtitleUrl: string;
  title: string;
};

export function WatchShell({ movieId, src, poster, subtitleUrl, title }: Props) {
  const onPlayStart = useCallback(() => {
    void fetch("/api/watch/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movieId }),
    });
  }, [movieId]);

  return (
    <VideoPlayer
      movieId={movieId}
      src={src}
      poster={poster}
      subtitleUrl={subtitleUrl}
      title={title}
      onPlayStart={onPlayStart}
    />
  );
}
