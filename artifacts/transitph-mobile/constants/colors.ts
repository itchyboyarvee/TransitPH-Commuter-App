/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // TransitPH brand aliases.
    text: '#17383d',
    tint: '#3c8b78',

    // Core surfaces
    background: '#f8f5ed',
    foreground: '#17383d',

    // Cards / elevated surfaces
    card: '#fbf9f3',
    cardForeground: '#17383d',

    // Primary action color (buttons, links, active states)
    primary: '#17383d',
    primaryForeground: '#f8f5ed',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#dbe9df',
    secondaryForeground: '#275158',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#ebe6da',
    mutedForeground: '#6d8580',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#e8bf32',
    accentForeground: '#17383d',

    // Destructive actions (delete, error states)
    destructive: '#ec633c',
    destructiveForeground: '#f8f5ed',

    // Borders and input outlines
    border: '#ded9c9',
    input: '#ded9c9',

    // Product-specific brand tokens.
    brandDeep: '#17383d',
    brandTeal: '#3c8b78',
    brandInk: '#275158',
    brandGold: '#e8bf32',
    brandCream: '#f8f5ed',
    brandCoral: '#ec633c',
    brandSage: '#dbe9df',
    brandMist: '#c4d4cd',
    brandWarning: '#fff0dc',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
