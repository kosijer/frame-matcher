# Frame search requirements

This document defines the behaviour of the “Find matching frames” feature: an **intelligent frame matcher** that uses AI (Gemini with search) to recommend picture frames for the user’s scenario, not a plain Google search.

## Inputs

- **Frame size** (target outer frame): width × height (mm).
- **Image/photo size** (optional): width × height (mm). When present, only frames that can fit this image (inner opening ≥ image size) are relevant.
- **Image count:** When the user has more than one image in the frame (image count > 1), do not use image size for search—use frame size only. The frontend omits `defaultImageWidth`/`defaultImageHeight` from the payload when image count > 1.

All size logic is **relative to these dimensions**. No hardcoded sizes (e.g. “23×35 cm” or “32×45 cm”) should be enforced so that the same logic works for any frame/image combination (small or large).

## Result logic (four bands)

Return **up to 5 results** by covering these bands. **At most one result per band** for bands 1 and 2, so the response is spread across bands (e.g. not three “exact frame size” results). Use the AI to decide which frames fit best and to run searches that actually find “in between” and “bigger” sizes.

1. **Exact or near frame size (≥ image)**  
   Match the exact target frame size, or something slightly near it, but still bigger than the image.  
   **Target:** 1 result (at most one).

2. **Exact or near image size**  
   Frames that fit the exact image size (or slightly bigger).  
   **Target:** 1 result (at most one).  
   *(Omit if no image size is given, or if frame size = image size.)*

3. **In between image and frame size**  
   Frames whose size is **strictly between** the image size and the frame size. The AI must search for this band (e.g. derived sizes between image and frame); do not return only “exact frame” and “exact image” matches.  
   **Target:** 1–2 results.  
   *(Omit or reduce if frame size = image size, or if there is no meaningful “in between”.)*

4. **Bigger than frame size**  
   Frames **strictly larger** than the target frame size (still fitting the image if given). The AI must search for sizes above the target.  
   **Target:** 1–2 results.

## Flexibility

- We won’t always find exact matches or in-between sizes (e.g. when frame and image are the same size).
- When a band has no good match, the AI can fill with results from other bands (e.g. more “bigger” options).
- **Returning no results** is acceptable only when the requested frame/image is so large that no realistic retail options exist.
- The implementation uses a **step-by-step prompt** (search for band 1, then band 2, then band 3, then band 4, then combine) so the model runs all bands and compiles one response. If the model finds fewer than 5 products, it should still output what it found (e.g. 3 or 4 objects), not an empty array.

## Output

- **Source:** eBay UK and Amazon UK only.
- **Format:** Each result must be a real product page (URL with valid eBay item id or Amazon ASIN).
- **Content:** title, url, reason (why it fits the scenario), widthMm, heightMm.

## Debug

- **Frame search debug panel:** The debug panel (payload, response, prompt) is shown only when the env variable **`VITE_DEBUG=true`** is set (client). Set in `.env` or when starting the dev server.
- **API debug field:** When `DEBUG=true` (server) and the API returns fewer than 5 results, the response includes a `debug` object (`parsedCount`, `responsePreview`) for troubleshooting.

## Rules to extend

- New rules (e.g. prefer UK sellers, exclude certain brands, or add more retailers) should be added here and reflected in the implementation.
- The prompt in `server/find-frames.ts` should follow this document and avoid hardcoded sizes; derive search intent from frame and image dimensions only.
