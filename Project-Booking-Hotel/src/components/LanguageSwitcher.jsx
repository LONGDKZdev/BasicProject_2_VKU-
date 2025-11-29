import { useLanguage } from '../context/LanguageContext';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();
  const options = [
    { code: 'en', label: t('languageSwitcher.english') },
    { code: 'vi', label: t('languageSwitcher.vietnamese') },
  ];

  return (
    <div className='flex items-center border border-current/20 rounded-full overflow-hidden text-xs uppercase tracking-[2px]'>
      {options.map((option) => (
        <button
          key={option.code}
          onClick={() => setLanguage(option.code)}
          className={`px-2 py-1 transition ${
            language === option.code ? 'bg-accent text-white' : 'bg-transparent'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;

