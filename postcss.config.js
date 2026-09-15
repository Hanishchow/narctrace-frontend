// Explicit empty PostCSS config so the build does not walk up the directory
// tree and pick up an unrelated Tailwind/PostCSS config from a parent folder.
// This project uses plain CSS + design tokens (PRD §7); no PostCSS plugins needed.
export default {
  plugins: {},
};
