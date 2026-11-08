import { WhatsAppIcon, InstagramIcon } from '@/components/Icons';
import { FloatingCartButton } from './Cart';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';

const ring =
  'fixed right-4 md:right-5 z-40 flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-burgundy text-ivory shadow-lg ring-2 ring-gold transition-colors hover:bg-burgundy-dark';
const waRing =
  'fixed right-4 md:right-5 bottom-4 md:bottom-5 z-40 flex h-13 w-13 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#1F7A4C] text-ivory shadow-lg ring-2 ring-gold transition-colors hover:bg-[#17603B] p-3';

export default function FloatingWhatsApp({ number, instagram }) {
  return (
    <>
      <FloatingCartButton />
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow KAYATHI LABEL on Instagram" className={`${ring} bottom-[4.75rem] md:bottom-[5.25rem]`}>
          <InstagramIcon className="h-6 w-6 md:h-7 md:w-7" />
        </a>
      )}
      <a href={waLink(number, GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" aria-label="Order or chat with KAYATHI LABEL on WhatsApp" className={waRing}>
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </>
  );
}
