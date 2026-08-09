export const HOME_WELCOME_TEXT = {
  greeting: (name = '') => `Good morning${name ? `, ${name}` : ''}!`,
  subtitle: 'Ready to move?',
} as const;
