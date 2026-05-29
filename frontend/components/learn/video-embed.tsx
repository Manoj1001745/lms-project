type VideoEmbedProps = {
  url: string;
  title?: string;
};

function parseEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }

    if (parsed.hostname.includes("vimeo.com")) {
      const segments = parsed.pathname.split("/").filter(Boolean);
      const videoId = segments.at(-1);
      if (videoId) return `https://player.vimeo.com/video/${videoId}`;
    }
  } catch {
    return null;
  }

  return null;
}

export function VideoEmbed({ url, title = "Lesson video" }: VideoEmbedProps) {
  const embedUrl = parseEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-800">Video resource</p>
        <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-block font-semibold text-brand-blue underline">
          Open video in a new tab
        </a>
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-black">
      <iframe
        src={embedUrl}
        title={title}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
