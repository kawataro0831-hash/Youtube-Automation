// Remotion CLI config (applies to `npx remotion render` / `remotion studio`).
// https://www.remotion.dev/docs/config
import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

// Use the pre-installed Chromium instead of letting Remotion download
// chrome-headless-shell (the download host is blocked in this container).
// Override with REMOTION_BROWSER_EXECUTABLE; if neither exists, Remotion falls
// back to its own download (works on a normal dev machine).
const candidates = [
  process.env.REMOTION_BROWSER_EXECUTABLE,
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
].filter((p): p is string => Boolean(p));
const browser = candidates.find((p) => fs.existsSync(p));
if (browser) {
  Config.setBrowserExecutable(browser);
}

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
