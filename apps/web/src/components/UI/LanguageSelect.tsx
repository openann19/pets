'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales } from '@/i18n';

interface LanguageSelectProps {
  compact?: boolean;
}

export default function LanguageSelect({ compact = false }: LanguageSelectProps) {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = () => {
    const newLocale = locale === 'en' ? 'bg' : 'en';
    
    // Remove current locale from pathname and add new locale
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '') || '/';
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    
    router.push(newPath);
  };

  const isBG = locale === 'bg';

  return (
    <div className={compact ? 'relative z-50 inline-flex' : 'inline-flex'}>
      <div className={`inline-flex items-center rounded-full border border-white/40 backdrop-blur-sm shadow ring-1 ring-white/20 ${isBG ? 'bg-primary-500/90' : 'bg-white/30'} transition-colors`}> 
        <button
          type="button"
          aria-label={t('navigation.language')}
          onClick={handleLanguageChange}
          className={`px-3 py-1 text-sm font-medium ${isBG ? 'text-white' : 'text-gray-800'}`}
        >
          {isBG ? 'BG' : 'EN'}
        </button>
      </div>
    </div>
  );
}

