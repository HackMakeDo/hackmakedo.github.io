A click-to-load YouTube video: a 16:9 poster with a pink play button; YouTube loads only when it is clicked.

Markup: `<hmd-video class="hmd-video" video-id="MZfeUKSO8h4" label="ContentLock: reactive options with SignalR"><a class="hmd-video__fallback" href="https://www.youtube.com/watch?v=MZfeUKSO8h4">Watch on YouTube ↗</a></hmd-video>`.

- The consumer provides the video id, a label that names the video, and the fallback link (shown without JavaScript and to crawlers).
- Poster defaults to YouTube's `hqdefault.jpg`; pass `poster="/images/…"` for your own still, or `poster="none"` for a flat panel.
- The play button carries a notice, "Plays from YouTube, which may set cookies" (override with `notice="…"`), and the privacy notice explains it. YouTube's player can store data on the device even on the no-cookie domain, so nothing loads until the person chooses to play.
- On click it swaps in a `youtube-nocookie.com` iframe with autoplay and moves focus to it. Nothing is requested from YouTube before then, which keeps pages fast and cookie-free.
- Replaces every migrated WordPress YouTube embed. Add `VideoObject` structured data for videos that are the main content of a page.
- The play overlay uses fixed light text on a navy scrim because it sits on a photo, not on a theme surface.
