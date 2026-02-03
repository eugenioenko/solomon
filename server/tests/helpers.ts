import { prisma } from "../src/prisma.js";
import { signToken } from "../src/middleware/auth.js";

export async function createTestUser(username = "testuser") {
  const user = await prisma.user.create({
    data: { username },
  });
  const token = signToken({ userId: user.id, username: user.username });
  return { user, token };
}

export async function createTestLevel(
  createdById: string,
  overrides: {
    title?: string;
    data?: string;
    published?: boolean;
  } = {}
) {
  return prisma.level.create({
    data: {
      title: overrides.title ?? "Test Level",
      data: overrides.data ?? '{"tiles":[]}',
      published: overrides.published ?? false,
      createdById,
    },
  });
}
