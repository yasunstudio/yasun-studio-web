/** Turns common video links into an embeddable player URL. */
function toEmbed(url: string): { kind: "iframe" | "video"; src: string } {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v") ?? u.pathname.split("/").pop();
      return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${id}?rel=0` };
    }
    if (host === "youtu.be") return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed${u.pathname}?rel=0` };
    if (host === "vimeo.com") return { kind: "iframe", src: `https://player.vimeo.com/video${u.pathname}` };
    if (host.endsWith("player.vimeo.com") || host.includes("youtube-nocookie.com")) return { kind: "iframe", src: url };
  } catch {
    /* fall through */
  }
  return { kind: "video", src: url };
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const { kind, src } = toEmbed(url);
  return (
    <div className="bg-navy-950 relative aspect-video w-full overflow-hidden rounded-xl border shadow-sm">
      {kind === "iframe" ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <video src={src} controls className="absolute inset-0 size-full" preload="metadata">
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}
