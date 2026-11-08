const base = { 'aria-hidden': true, focusable: false };

export const WhatsAppIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const InstagramIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
  </svg>
);

export const PhoneIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" />
  </svg>
);

export const MailIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);

export const MenuIcon = ({ className = 'h-6 w-6' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = ({ className = 'h-6 w-6' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const MapPinIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const BagIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M6 8h12l1 12H5L6 8z" />
    <path d="M9 8V6a3 3 0 016 0v2" />
  </svg>
);

export const ShieldCheckIcon = ({ className = 'h-6 w-6' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const RefreshIcon = ({ className = 'h-6 w-6' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M4 12a8 8 0 0114-5.3L20 9" />
    <path d="M20 4v5h-5" />
    <path d="M20 12a8 8 0 01-14 5.3L4 15" />
    <path d="M4 20v-5h5" />
  </svg>
);

export const PackageIcon = ({ className = 'h-6 w-6' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
    <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    <path d="M8 5.25l8 4.5" />
  </svg>
);

export const TruckIcon = ({ className = 'h-6 w-6' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <rect x="2" y="6" width="13" height="10" rx="1" />
    <path d="M15 9h4l3 3v4h-7V9z" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const StarIcon = ({ className = 'h-4 w-4' }) => (
  <svg {...base} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l2.9 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l7.1-1.01L12 2z" />
  </svg>
);

export const ZoomInIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5M11 8v6M8 11h6" />
  </svg>
);

export const ChevronLeftIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

export const ChevronRightIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export const SearchIcon = ({ className = 'h-5 w-5' }) => (
  <svg {...base} viewBox="0 0 24 24" {...stroke} className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.8-3.8" />
  </svg>
);

export const HeartIcon = ({ className = 'h-5 w-5', filled = false }) => (
  <svg
    {...base}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 20.5s-7-4.35-9.2-8.4C1.1 8.9 3.1 5 6.9 5c2.1 0 3.7 1.1 5.1 2.8C13.4 6.1 15 5 17.1 5c3.8 0 5.8 3.9 4.1 7.1-2.2 4.05-9.2 8.4-9.2 8.4z" />
  </svg>
);

