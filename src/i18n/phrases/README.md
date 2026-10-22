One file per product area (e.g. `couple.ts`). Default-export `Record<string, readonly [ko, zh, ja, es]>` keyed by the English string passed to `t()`.
Files are merged after the base `phrases` map in `../product-translations.ts`, so a key here overrides the base map.
