import { useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Appearance } from 'react-native';
import type { ColorSchemeName } from 'react-native';
import { useAppSelector } from '@R/typed-hooks';
import useAppInitializationBase from './use-app-initialization-base';

const THEME_ATTRIBUTE = 'data-theme';
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

function getSystemColorScheme(): 'light' | 'dark' {
  return window.matchMedia(DARK_MODE_QUERY).matches ? 'dark' : 'light';
}

function getWebColorScheme(): 'light' | 'dark' {
  const userTheme = document.documentElement.getAttribute(THEME_ATTRIBUTE);
  return userTheme === 'dark' || userTheme === 'light' ? userTheme : getSystemColorScheme();
}

export default function useAppInitialization() {
  useAppInitializationBase();
  const { theme } = useAppSelector(({ language }) => language);
  const [isCustomAppearanceLoaded, setIsCustomAppearanceLoaded] = useState(false);

  useEffect(() => {
    Appearance.setColorScheme = (scheme: ColorSchemeName) => {
      if (scheme === 'light' || scheme === 'dark') {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, scheme);
      } else {
        document.documentElement.removeAttribute(THEME_ATTRIBUTE);
      }
    };

    Appearance.getColorScheme = getWebColorScheme;

    Appearance.addChangeListener = (listener) => {
      const systemTheme = window.matchMedia(DARK_MODE_QUERY);
      const systemThemeListener = () => listener({ colorScheme: getWebColorScheme() });

      systemTheme.addEventListener('change', systemThemeListener);

      const observer = new MutationObserver((mutationsList) => {
        if (mutationsList.some(({ attributeName }) => attributeName === THEME_ATTRIBUTE)) {
          listener({ colorScheme: getWebColorScheme() });
        }
      });
      observer.observe(document.documentElement, { attributeFilter: [THEME_ATTRIBUTE], attributes: true });

      return {
        remove: () => {
          systemTheme.removeEventListener('change', systemThemeListener);
          observer.disconnect();
        },
      };
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCustomAppearanceLoaded(true);
  }, []);

  useEffect(() => {
    if (isCustomAppearanceLoaded) {
      Appearance.setColorScheme(theme ?? 'unspecified');
    }
  }, [isCustomAppearanceLoaded, theme]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.EXPO_PUBLIC_MAPBOX_TOKEN || '';
  }, []);
}
