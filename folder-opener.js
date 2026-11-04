import { spawn } from 'node:child_process';
import { realpath, stat } from 'node:fs/promises';
import { dirname, extname, isAbsolute, resolve } from 'node:path';

/** Launch the OS file manager with one literal path argument, never a shell. */
export function openDirectory(path, platform = process.platform, launch = spawn) {
  const command = platform === 'win32' ? 'explorer.exe' : platform === 'darwin' ? 'open' : 'xdg-open';
  return new Promise((resolve, reject) => {
    const child = launch(command, [path], { shell: false, detached: true, stdio: 'ignore', windowsHide: false });
    child.once('error', reject);
    child.once('spawn', () => { child.unref(); resolve(); });
  });
}

function validatePath(path) {
  if (typeof path !== 'string' || !path.trim() || path.length > 32768 || /[\x00-\x1f\x7f-\x9f]/.test(path)) {
    throw new Error('本地文件路径无效');
  }
  // A drive letter must be followed by a separator: C:foo is drive-relative,
  // and all other schemes (including file:, javascript: and https:) are URLs.
  if (/^[a-z][a-z\d+.-]*:/i.test(path) && !/^[a-z]:[\\/]/i.test(path)) {
    throw new Error('只支持本地文件路径，不支持 URL 或盘符相对路径');
  }
  if (/^[\\/]{2}[?.][\\/]/.test(path)) throw new Error('不支持设备路径');
  if (process.platform === 'win32' && /^[\\/](?![\\/])/.test(path)) throw new Error('路径必须包含完整盘符，不能依赖主机当前盘符');
}

/** Resolve against an actual session, never the host process working directory. */
export async function resolveLocalPath(input, agent) {
  validatePath(input);
  // Colons cannot be part of a normal Windows filename; strip editor locations
  // before the alternate-data-stream guard (never pass a stream to Explorer).
  if (process.platform === 'win32') input = input.replace(/:\d+(?::\d+)?$/, '');
  let base;
  if (!isAbsolute(input)) {
    if (!agent?.session) throw new Error('相对路径需要活动聊天会话');
    base = await agent.ctx?.get('workingDirectory')?.get(agent.session);
    if (typeof base !== 'string' || !isAbsolute(base)) base = agent.session.header?.cwd;
    if (typeof base !== 'string' || !isAbsolute(base)) throw new Error('当前聊天没有有效的工作目录');
    validatePath(base);
  }
  const canonical = async candidate => {
    // Reject NTFS alternate data streams; the drive colon alone is allowed.
    if (process.platform === 'win32' && candidate.replace(/^[a-z]:/i, '').includes(':')) throw new Error('不支持文件流路径');
    const path = await realpath(isAbsolute(candidate) ? candidate : resolve(base, candidate));
    validatePath(path);
    const info = await stat(path);
    if (!info.isFile() && !info.isDirectory()) throw new Error('路径不是普通文件或目录');
    return { path, isDirectory: info.isDirectory() };
  };
  // Real names win, including POSIX filenames that end in :12 or #L12.
  try { return await canonical(input); }
  catch (error) {
    if (!['ENOENT', 'ENOTDIR'].includes(error.code)) throw error;
    const stripped = input.replace(/#L\d+(?:-L?\d+)?$/i, '').replace(/:\d+(?::\d+)?$/, '');
    if (stripped === input || !stripped) throw error;
    return canonical(stripped);
  }
}

const unsafeWindowsExtensions = new Set([
  '.exe', '.cmd', '.bat', '.ps1', '.psm1', '.psd1', '.com', '.lnk', '.url',
  '.msi', '.msp', '.msix', '.appx', '.appxbundle', '.msixbundle', '.application',
  '.vbs', '.vbe', '.js', '.jse', '.wsf', '.wsh', '.hta', '.scr', '.cpl', '.reg',
  '.jar', '.py', '.pyw', '.sh', '.pif', '.scf', '.gadget', '.inf', '.sct',
  '.mjs', '.cjs', '.ts', '.pl', '.rb', '.php', '.lua', '.ahk', '.au3', '.chm',
  '.msh', '.msh1', '.msh2', '.mshxml', '.msh1xml', '.msh2xml', '.psc1', '.psc2',
]);

/** Open only existing paths; tests inject launch to avoid opening real OS apps. */
export async function openLocalPath(action, input, agent, { platform = process.platform, launch = spawn } = {}) {
  if (!['open_file', 'reveal_file'].includes(action)) throw new Error('未知文件操作');
  const target = await resolveLocalPath(input, agent);
  if (action === 'open_file' && !target.isDirectory && platform === 'win32' &&
      unsafeWindowsExtensions.has(extname(target.path.replace(/[ .]+$/, '')).toLowerCase())) {
    throw new Error('为避免执行代码，不支持直接打开可执行文件或脚本；请打开所在文件夹');
  }
  const path = action === 'reveal_file' && !target.isDirectory ? dirname(target.path) : target.path;
  await openDirectory(path, platform, launch);
  return { path: target.path, openedPath: path };
}
