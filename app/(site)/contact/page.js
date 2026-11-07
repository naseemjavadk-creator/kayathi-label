import { getSettings } from '@/lib/data';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';
import { WhatsAppIcon, InstagramIcon, PhoneIcon, MailIcon, MapPinIcon } from '@/components/Icons';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Contact us',
  description: 'Contact KAYATHI LABEL by WhatsApp, phone, email or Instagram.',
};

export default async function Contact() {
  const s = await getSettings();
  const address = s.address.trim();
  const mapsUrl = s.maps_url.trim();
  const q = encodeURIComponent(address);

  // Only show a map when the owner has supplied a real location.
  const embedSrc = mapsUrl.includes('google.com/maps/embed')
    ? mapsUrl
    : address
      ? `https://www.google.com/maps?q=${q}&output=embed`
      : null;
  const directions = address
    ? `https://www.google.com/maps/dir/?api=1&destination=${q}`
    : mapsUrl && !mapsUrl.includes('/maps/embed')
      ? mapsUrl
      : null;

  const row = 'flex items-start gap-3';
  return (
    <div className="container-x py-12 md:py-20">
      <h1 className="text-5xl md:text-6xl">Contact us</h1>
      <p className="mt-3 max-w-xl text-espresso/75">
        The quickest way to reach KAYATHI LABEL, ask about a piece or place an order is WhatsApp.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div className="space-y-7">
          <div className="flex flex-wrap gap-3">
            <a href={waLink(s.whatsapp, GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><WhatsAppIcon /> Message on WhatsApp</a>
            <a href={`tel:${s.phone}`} className="btn btn-outline"><PhoneIcon /> Call now</a>
          </div>

          <ul className="space-y-5">
            <li className={row}><MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" />
              <span><span className="block text-sm text-espresso/60">Email</span><a href={`mailto:${s.email}`} className="break-all hover:text-burgundy">{s.email}</a></span></li>
            <li className={row}><WhatsAppIcon className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" />
              <span><span className="block text-sm text-espresso/60">WhatsApp</span><a href={waLink(s.whatsapp, GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" className="hover:text-burgundy">{s.whatsapp}</a></span></li>
            <li className={row}><PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" />
              <span><span className="block text-sm text-espresso/60">Phone</span><a href={`tel:${s.phone}`} className="hover:text-burgundy">{s.phone}</a></span></li>
            <li className={row}><InstagramIcon className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" />
              <span><span className="block text-sm text-espresso/60">Instagram</span><a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:text-burgundy">{s.instagram_handle}</a></span></li>
            <li className={row}><MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-burgundy" />
              <span><span className="block text-sm text-espresso/60">Address</span>
                {address ? <span className="whitespace-pre-line">{address}</span> : <span className="text-espresso/70">Our shop address is not listed yet. Message us on WhatsApp for details.</span>}
              </span></li>
          </ul>

          {s.opening_hours.trim() && (
            <div>
              <h2 className="mb-2 text-2xl">Opening hours</h2>
              <p className="whitespace-pre-line">{s.opening_hours}</p>
            </div>
          )}
        </div>

        <div>
          {embedSrc ? (
            <>
              <iframe
                title="KAYATHI LABEL location on Google Maps"
                src={embedSrc}
                className="h-80 w-full border border-espresso/15 md:h-[26rem]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              {directions && (
                <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-outline mt-4"><MapPinIcon /> Get directions</a>
              )}
            </>
          ) : (
            <div className="flex h-80 items-center justify-center border border-dashed border-espresso/30 bg-white p-8 text-center text-espresso/70 md:h-[26rem]">
              The map will appear here once the shop location is added.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
