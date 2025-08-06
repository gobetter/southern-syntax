import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";

/**
 * PostCSS configuration used by Next.js to process global CSS.
 *
 * Using an explicit plugin array ensures that Tailwind's PostCSS plugin is
 * executed correctly, which is necessary for generating utility classes. The
 * previous object syntax could fail to load the plugin in some environments,
 * resulting in Tailwind styles not being applied.
 */
export default {
  plugins: [tailwindcss, autoprefixer],
};
