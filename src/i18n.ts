import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['pt', 'en'];

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;

  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale)) {
    locale = 'pt';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});