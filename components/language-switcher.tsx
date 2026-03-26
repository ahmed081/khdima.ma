'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check } from 'lucide-react';

const locales = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'ar', label: 'العربية',  flag: '🇲🇦' },
];

interface Props {
  showLabel?: boolean
}

export function LanguageSwitcher({ showLabel = false }: Props) {
  const locale   = useLocale();
  const router   = useRouter();
  const pathname = usePathname();

  const current = locales.find(l => l.code === locale) ?? locales[0];

  const switchLocale = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  if (showLabel) {
    // Inline display for mobile drawer — shows current language with flag
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-700 transition-colors">
            <Globe className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{current.flag} {current.label}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {locales.map((l) => (
            <DropdownMenuItem
              key={l.code}
              onClick={() => switchLocale(l.code)}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex items-center gap-2">
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </span>
              {locale === l.code && <Check className="h-3.5 w-3.5 text-green-600" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-gray-600 hover:text-gray-900 px-2">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase">{locale}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => switchLocale(l.code)}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              <span>{l.flag}</span>
              <span className={locale === l.code ? 'font-semibold text-green-700' : ''}>{l.label}</span>
            </span>
            {locale === l.code && <Check className="h-3.5 w-3.5 text-green-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
