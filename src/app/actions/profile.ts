"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { isAvatarUrlAllowed } from "@/constants/avatar-catalog";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";

interface UpdateAvatarInput {
  imageUrl: string;
}

export async function updateOwnAvatar(input: UpdateAvatarInput) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Faça login para alterar o avatar.");
  }

  const imageUrl = input.imageUrl?.trim();
  if (!imageUrl || !isAvatarUrlAllowed(imageUrl)) {
    throw new Error("Avatar inválido.");
  }

  await db
    .update(user)
    .set({
      image: imageUrl,
    })
    .where(eq(user.id, session.user.id));

  revalidatePath(`/profile/${session.user.id}`);
  revalidatePath("/players");
  revalidatePath("/register");
}
