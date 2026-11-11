import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export const FAVORITE_CONTENT_BYTES = 1024 * 1024;
const shortText = z.string().max(500);
const content = z.string().max(FAVORITE_CONTENT_BYTES).refine(value => Buffer.byteLength(value, 'utf8') <= FAVORITE_CONTENT_BYTES);
export const favoriteSchema = z.object({
  id: z.string().uuid(), sessionId: shortText, projectId: z.string().nullable(),
  projectTitle: z.string().nullable(), sessionTitle: shortText,
  sourceKey: shortText.min(1), turn: z.number().int().nonnegative(), seq: z.number().int().nonnegative().optional(), content,
  title: shortText, note: z.string().max(32768), createdAt: z.number().int().nonnegative(),
  revision: z.number().int().positive(),
});
export const favoriteActions = ['favorite_list', 'favorite_save', 'favorite_update', 'favorite_remove'];
export const favoriteInput = {
  sourceKey: shortText.min(1).optional(), turn: z.number().int().nonnegative().optional(), seq: z.number().int().nonnegative().optional(),
  content: content.optional(), sessionTitle: shortText.optional(),
  note: z.string().max(32768).optional(), projectId: z.string().max(500).nullable().optional(),
};
function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }

/** Shares the project's queue and whole-global snapshot to avoid lost updates. */
export function operateFavorite(manager, args, session) {
  return manager.run(async () => {
    const state = manager.snapshot();
    const favorites = state.favorites ?? [];
    if (args.action === 'favorite_list') {
      return { favorites: favorites.filter(item => args.projectId === undefined || item.projectId === args.projectId)
        .sort((a, b) => b.createdAt - a.createdAt) };
    }
    if (args.action === 'favorite_save') {
      const sessionId = session?.header.id ?? session?.id;
      if (!sessionId) fail('需要活动会话', 409);
      if (!args.sourceKey || !Number.isInteger(args.turn) || args.turn < 0 || typeof args.content !== 'string') fail('收藏快照参数无效');
      const previous = favorites.find(item => item.sessionId === sessionId && item.sourceKey === args.sourceKey);
      if (previous) return { favorite: previous, duplicate: true };
      const project = manager.projectFor(session, state);
      const favorite = favoriteSchema.parse({
        id: randomUUID(), sessionId, projectId: project?.id ?? null, projectTitle: project?.title ?? null,
        sessionTitle: args.sessionTitle ?? '', sourceKey: args.sourceKey, turn: args.turn,
        ...(args.seq !== undefined ? { seq: args.seq } : {}), content: args.content,
        title: args.title ?? '', note: '', createdAt: Date.now(), revision: 1,
      });
      state.favorites = [...favorites, favorite];
      await manager.store.set(state);
      return { favorite, duplicate: false };
    }
    if (!args.id) fail('收藏 ID 不能为空');
    const previous = favorites.find(item => item.id === args.id);
    if (args.action === 'favorite_remove' && !previous) return { id: args.id, removed: false };
    if (!previous) fail('收藏不存在，请刷新列表', 404);
    if (args.action === 'favorite_update' || args.revision !== undefined) {
      if (args.revision !== previous.revision) fail('收藏已在其他窗口更新，请刷新后重试', 409);
    }
    if (args.action === 'favorite_remove') {
      state.favorites = favorites.filter(item => item.id !== args.id);
      await manager.store.set(state);
      return { id: args.id, removed: true };
    }
    if (args.action !== 'favorite_update') fail('未知收藏操作');
    if (args.title === undefined && args.note === undefined) fail('请提供收藏标题或备注');
    const favorite = favoriteSchema.parse({ ...previous,
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.note !== undefined ? { note: args.note } : {}), revision: previous.revision + 1,
    });
    state.favorites = favorites.map(item => item.id === args.id ? favorite : item);
    await manager.store.set(state);
    return { favorite };
  });
}
