import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supportedLanguages } from '@/i18n';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];

  return (
    <Select value={currentLang} onValueChange={(value) => i18n.changeLanguage(value)}>
      <SelectTrigger 
        className="w-auto bg-white/10 border-white/20 text-white hover:bg-white/20"
        aria-label="Select language"
      >
        <Globe className="mr-2 h-4 w-4" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <span className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
