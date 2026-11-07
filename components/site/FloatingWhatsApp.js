import { WhatsAppIcon, InstagramIcon } from '@/components/Icons';
import { FloatingCartButton } from './Cart';
import { waLink, GENERAL_MESSAGE } from '@/lib/whatsapp';

const ring =
  'fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-burgundy text-ivory shadow-lg ring-2 ring-gold transition-colors hover:bg-burgundy-dark';

export default function FloatingWhatsApp({ number, instagram }) {
  return (
    <>
      <FloatingCartButton />
      {instagram && (
        <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow KAYATHI LABEL on Instagram" className={`${ring} bottom-[5.25rem]`}>
          <InstagramIcon className="h-7 w-7" />
        </a>
      )}
      <a href={waLink(number, GENERAL_MESSAGE)} target="_blank" rel="noopener noreferrer" aria-label="Chat with KAYATHI LABEL on WhatsApp" className={`${ring} bottom-5`}>
        <WhatsAppIcon className="h-7 w-7" />
      </a>
    </>
  );
}
