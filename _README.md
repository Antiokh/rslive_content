# DokuWiki Migration Corpus

This directory contains MDX sources generated from the archived DokuWiki pages in `www/doku-secure/data/pages`.

Guidance:

- preserve footnotes as `[^n]` blocks
- preserve callouts with Astro/Starlight admonitions when possible
- keep unsupported plugin payloads as HTML comments with the original intent
- treat these files as the future Astro content source, not as the final rendered output yet
