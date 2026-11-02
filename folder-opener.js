import { spawn } from 'node:child_process';

/** Launch the OS file manager with one literal path argument, never a shell. */
export function openDirectory(path, platform = process.platform, launch = spawn) {
  const command = platform === 'win32' ? 'explorer.exe' : platform === 'darwin' ? 'open' : 'xdg-open';
  return new Promise((resolve, reject) => {
    const child = launch(command, [path], { shell: false, detached: true, stdio: 'ignore', windowsHide: false });
    child.once('error', reject);
    child.once('spawn', () => { child.unref(); resolve(); });
  });
}
