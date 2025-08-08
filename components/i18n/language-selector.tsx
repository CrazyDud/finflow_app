'use client';

import React from 'react';
import { useI18n } from './i18n-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSelector({ size = 'sm' }: { size?: 'sm' | 'default' }) {
  const { language, setLanguage, languages } = useI18n();
  const current = languages.find(l => l.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={size} className="flex items-center space-x-2">
          <span>{current.flag}</span>
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{current.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map(({ code, name, flag }) => (
          <DropdownMenuItem key={code} onClick={() => setLanguage(code)} className="flex items-center space-x-2">
            <span>{flag}</span>
            <span>{name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


