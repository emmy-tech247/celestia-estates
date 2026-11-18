import prisma from "./prisma";

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.systemSetting.findUnique({ where: { key } }).catch(() => null);
  return row ? (row.value as T) : fallback;
}
