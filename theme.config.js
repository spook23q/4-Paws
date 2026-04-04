/** @type {const} */
const themeColors = {
  // Primary brand — 4 Paws green (Base44: --green-primary)
  primary: { light: '#2ECC71', dark: '#2ECC71' },
  // Secondary accent — sky blue (Base44: --blue-paw)
  secondary: { light: '#5DADE2', dark: '#5DADE2' },
  // Main background — warm cream / dark navy (Base44: --cream / --dark-bg)
  background: { light: '#FEF3E2', dark: '#0F1923' },
  // Card/surface — white / dark card (Base44: white / --dark-card)
  surface: { light: '#FFFFFF', dark: '#1A2332' },
  // Primary text (Base44: --text-dark / green-on-dark)
  foreground: { light: '#2C3E50', dark: '#ECEDEE' },
  // Muted text (Base44: --text-muted)
  muted: { light: '#7F8C8D', dark: '#9BA1A6' },
  // Borders
  border: { light: '#E5E7EB', dark: '#334155' },
  // Status colors
  success: { light: '#2ECC71', dark: '#4ADE80' },
  warning: { light: '#E67E22', dark: '#FBBF24' },
  error: { light: '#EF4444', dark: '#F87171' },
};

module.exports = { themeColors };
