'use client';
import { useState } from 'react';
import Reveal from './Reveal';
import { WhatsAppIcon } from '@/components/Icons';
import { SITE_CONFIG } from '@/config/site';
import { waLink } from '@/lib/whatsapp';

function isValidContact(val) {
  const trimmed = String(val || '').trim();
  if (!trimmed) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const digits = trimmed.replace(/\D/g, '');
  const isPhone = digits.length >= 10 && digits.length <= 15;
  return emailRegex.test(trimmed) || isPhone;
}

export default function WhatsAppSignup({ whatsapp }) {
  const cfg = SITE_CONFIG.newsletter;
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!cfg) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const cleaned = contact.trim();
    if (!isValidContact(cleaned)) {
      setError('Please enter a valid 10-digit WhatsApp number or email address.');
      return;
    }
    setError('');
    setSubmitted(true);

    const msg = `${cfg.prefillMessagePrefix} ${cleaned}`;
    const targetUrl = waLink(whatsapp || SITE_CONFIG.whatsapp, msg);
    if (typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <Reveal as="section" className="container-x pb-10 pt-4 md:pb-14">
      <div className="border border-gold/40 bg-ivory-deep px-6 py-10 text-center md:px-12 md:py-14">
        {cfg.eyebrow && (
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-burgundy">
            {cfg.eyebrow}
          </p>
        )}
        <h2 className="mx-auto mt-2 max-w-xl font-serif text-3xl text-burgundy md:text-4xl">
          {cfg.heading}
        </h2>
        {cfg.description && (
          <p className="mx-auto mt-2.5 max-w-xl text-sm leading-relaxed text-espresso/80 md:text-base">
            {cfg.description}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mx-auto mt-6 flex max-w-lg flex-col gap-3 sm:flex-row"
        >
          <div className="flex-1 text-left">
            <label htmlFor="vip-signup-input" className="sr-only">
              WhatsApp number or email address
            </label>
            <input
              id="vip-signup-input"
              type="text"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (error) setError('');
              }}
              placeholder={cfg.inputPlaceholder}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'vip-signup-error' : undefined}
              className="field w-full bg-white"
            />
          </div>
          <button type="submit" className="btn btn-primary shrink-0">
            <WhatsAppIcon className="h-4 w-4" />
            {cfg.buttonLabel}
          </button>
        </form>

        {error && (
          <p id="vip-signup-error" role="alert" className="mt-2.5 text-xs font-medium text-burgundy">
            {error}
          </p>
        )}

        {submitted && !error && (
          <p role="status" className="mt-3 text-xs font-medium text-[#1F7A4C]">
            Opening WhatsApp with your pre-filled signup request—just tap Send in WhatsApp!
          </p>
        )}

        {cfg.privacyNote && (
          <p className="mt-3 text-xs text-espresso/65">{cfg.privacyNote}</p>
        )}
      </div>
    </Reveal>
  );
}
