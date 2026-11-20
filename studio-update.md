# FanFuse studio update — 20 November 2026

The final direction takes inspiration from Onevia's restrained editorial presentation: natural resort-fashion photography, serif headlines, clean sans-serif supporting text, generous spacing and consistent charcoal, ivory and champagne colours. FanFuse branding and the existing cinematic services and process-album interactions remain.

## Media provenance

- All 20 active photographic assets are original images generated with OpenAI image_gen in this conversation, depicting fictional clearly adult models. No active photo is a stock image or a copied portrait from another site.
- The 10 newest editorial images use natural professional resort-fashion and behind-the-scenes settings, appropriate to each section and destination, without copying reference-image files. The footer uses its own newly generated wide editorial image.
- ai-media-manifest.json lists exactly the 20 active images with source filenames, dimensions, SHA-256 checksums, encoding and available original generation prompts/metadata. Source PNGs are retained in the working source; only optimised WebPs are staged for publication.
- The hero remains the existing AI-generated clip converted from HEVC to browser-compatible H.264 with faststart and a generated poster fallback.
- The 13 destination films are the original brand-reference videos from fanfuse.ai reused at the owner's request. They are not claimed to be newly AI-generated or stock-photo replacements. film-manifest.json preserves original source mappings, encoding, checksums and full-decode results. Destination films are uploaded separately from the source/photo package.

## Functional changes

- Native on-demand destination-film playback, fullscreen controls and media unload on close replace external Drive embeds. Rapid close/reopen preserves the newly opened player.
- Application links lead to the original FanFuse application page. Call requests use the studio email because the original booking page contains a calendar placeholder; no booking confirmation is simulated.
- FAQ expanded states, keyboard navigation, reduced-motion visibility, hero pause/poster fallback and deep-link settling are supported.
- Footer destination links select the requested carousel destination. Footer social links follow the original brand's published destinations. Privacy enquiries use the studio email because the original privacy page still contains company/address/email placeholders.
- Unsubstantiated partner, award and statistic placeholders were removed. Earning ranges include a results-vary explanation. Retained short testimonial quotes follow the original brand site.

## Validation and delivery

- The active-image manifest is derived from the final HTML and three linked local stylesheets; all 20 files decode as WebP and have corresponding original generated PNG sources.
- The final publication staging folder contains source, metadata, the optimised hero and the 20 active WebPs. It excludes source PNGs, obsolete stock photographs and destination films; the 13 films use the separate upload batches.
- Every staged file is below GitHub's 25 MB web-upload limit. The external publication manifest lists staged file bytes and SHA-256/Git-blob SHA-1 checksums.
- Final browser and deployment verification is recorded by the publishing owner. No fictional application is submitted during testing.
