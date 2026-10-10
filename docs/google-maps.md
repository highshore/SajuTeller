# Google Maps setup

The active `/map` route uses **Google Maps Embed API**, with a pin for the selected studio's stored coordinates. The map follows the site's language, including Simplified Chinese. Demo coordinates remain illustrative. Google controls and attribution are unobstructed; the studio card sits below the map.

## Get the key

1. Open https://console.cloud.google.com/ and select or create your Google Cloud project. Complete the Maps Platform account/billing prerequisites.
2. Under **APIs & Services → Library**, enable **Maps Embed API**.
3. Under **APIs & Services → Credentials → Create credentials → API key**, create a dedicated SajuTeller browser key.
4. Edit the key: set **Application restrictions → Websites (HTTP referrers)** to `https://sajuteller.vercel.app/*`.
5. Set **API restrictions → Restrict key → Maps Embed API**, then save.

This implementation does not require Places, Geocoding, or Maps JavaScript API. Browser map keys are visible in requests by design; website and API restrictions are essential. Do not use a server credential or service-account key.

## Put it in Vercel

Open https://vercel.com/1-cup-english/saju/settings/environment-variables and add:

| Setting | Value |
| --- | --- |
| Name | `VITE_GOOGLE_MAPS_API_KEY` |
| Value | Your restricted Google Maps browser API key |
| Environment | Production |

Save, then **Deployments → latest production deployment → Redeploy**. Vite reads this value at build time, so saving alone does not update an existing deployment. No Supabase secret is needed.

For Preview, add the variable to Preview and allow the specific preview hostname in Google Cloud; do not allow all `*.vercel.app` websites. For local development, use a separate restricted key with `http://localhost:5173/*`, put it in `.env.local`, and restart Vite. Never commit real keys.

## Verify

Visit https://sajuteller.vercel.app/map after redeployment. Select two studios and switch language. Confirm the map pin and language update, and the Google Maps link opens the same coordinates. Without a key, the page still provides studio selection, details, and an external Google Maps link without issuing an unauthenticated embed request.

If Google displays an authorization error, check Maps Embed API is enabled in the key's project, billing/account prerequisites are complete, the referrer matches the current hostname, and the production deployment was rebuilt after saving the variable. Cross-origin iframe errors cannot be read by the app; the external link remains available.

References: https://developers.google.com/maps/documentation/embed/get-api-key · https://developers.google.com/maps/documentation/embed/embedding-map · https://developers.google.com/maps/api-security-best-practices
