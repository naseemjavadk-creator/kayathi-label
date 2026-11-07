# Test checklist

Run through this after setup (`npm run dev`) and again after deploying. Tick each line.

| # | Test | How | Expected |
|---|---|---|---|
| 1 | Owner login | `/admin/login` with the owner account | Lands on Dashboard |
| 2 | Wrong password | Try a wrong password | "Email or password is incorrect." |
| 3 | Dashboard access | Open `/admin` while signed out | Redirects to login |
| 4 | Add a saree | Products > Add product, category Sarees | Fabric, length, blouse piece, pattern, care fields appear; saves |
| 5 | Add jewellery / accessory | Add one in Jewellery and one in Other Accessories | Correct extra fields; saves |
| 6 | Multiple photos | Upload 3 photos, make the 2nd the cover | All appear on the product page, cover is first |
| 7 | Bad upload | Try a PDF and a photo over 5 MB | Both rejected with a message |
| 8 | Edit details | Change name and description, save | Public page shows the change on refresh |
| 9 | Update price | Set price 8000, original 10000 | Page shows 20% off, struck-through price |
| 10 | Update stock | Inventory: set stock to 0 | Marked out of stock; Order button disabled on the product page |
| 11 | Restock | Set stock to 4 | Available again; "Only 4 left" shows if at or under the low-stock number |
| 12 | Delete product | Delete a sample product | Gone from admin and website; its photos removed |
| 13 | Categories | Add a category and a subcategory, assign a product | Appears on the website; visit `/category/<slug>` |
| 14 | Browsing | Search, price filter, colour, size, sort | Results change correctly |
| 15 | Size / colour | On a bangle, try Order before choosing | Button disabled with a hint; enabled after choosing |
| 16 | WhatsApp message | Choose options and click Order on WhatsApp | WhatsApp opens with the full message and a product link |
| 17 | Floating button | Check every page | Button visible; opens WhatsApp |
| 18 | Email and call | Contact page | `mailto:` and `tel:+917907139297` work |
| 19 | Instagram | Header, footer, home, contact | All open https://www.instagram.com/kayathilabel/ |
| 20 | Maps | Contact page with no address | Placeholder, no map. Enter an address in settings: map and Get directions appear |
| 21 | Mobile | Phone or browser dev tools at 375 px | No sideways scrolling; dashboard works; photo upload works from phone |
| 22 | Persistence | Restart the dev server | All data still there |
| 23 | Customer read-only | Signed out, run in the browser console on the site: `await fetch(SUPABASE_URL + '/rest/v1/products?id=neq.0', {method:'DELETE', headers:{apikey: ANON_KEY}})` | Rejected (error), nothing deleted |
| 24 | Non-owner account | Create a second test user (not in admin_users) and log in | "This account does not have owner access." |
| 25 | Hidden product | Untick "Visible on the website" | Product disappears for visitors, still in admin |

## Animations and Fun zone

| # | Test | Expected |
|---|---|---|
| 26 | Open the site in a fresh browser tab | Logo opening screen, then it lifts away upward. Tap skips it. Reloading in the same tab does not show it again |
| 27 | Scroll the homepage | Sections glide up into place; sparkles drift behind the headline |
| 28 | Hover over a product photo (computer) | Soft shine sweep and gentle zoom |
| 29 | Scroll down a long page | Back-to-top arrow appears at bottom-left and scrolls smoothly up |
| 30 | `/play/quiz` | Three questions, then up to 3 in-stock suggestions and a WhatsApp button |
| 31 | `/play/spin` | Wheel spins and stops on a collection, shows one in-stock piece |
| 32 | `/play/memory` | Cards flip, pairs stay open, win message appears with sparkles |
| 33 | Turn on "reduce motion" in your device settings | Opening screen, sparkles and animations are skipped |

## Coming soon

| # | Test | Expected |
|---|---|---|
| 34 | Dashboard > Coming soon > add "Nose Pins" with a note | Gold ticker appears at the very top of every page and a "Coming soon" row appears on the homepage |
| 35 | Tap Notify me on a card | WhatsApp opens with "Please let me know when … arrives" |
| 36 | Hide or delete the entry | Ticker and row disappear (with none left, nothing is shown) |
