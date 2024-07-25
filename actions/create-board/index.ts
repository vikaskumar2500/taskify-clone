"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

import { InputType, ReturnType } from "./types";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { CreateBoard } from "./schema";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { hasAvailableCount, incrementAvailableCount } from "@/lib/org-limit";
import { checkSubscription } from "@/lib/subscription";

const handler = async (data: InputType): Promise<ReturnType> => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    return {
      error: "UnuseAuthorized",
    };
  }

  const canCreate = await hasAvailableCount();
  const isPro = await checkSubscription();

  if (!canCreate && !isPro)
    return {
      error:
        "You have reached the maximum limit, Please upgrade to create more",
    };

  const { title, image } = data;

  const [imageId, imageThumbUrl, imageFullUrl, imageUserName, imageLinkHtml] =
    image.split("|");

  console.log({
    imageId,
    imageThumbUrl,
    imageFullUrl,
    imageUserName,
    imageLinkHtml,
  });
  if (
    !imageId ||
    !imageThumbUrl ||
    !imageFullUrl ||
    !imageUserName ||
    !imageLinkHtml
  )
    return {
      error: "Missing fileds, Failed to create board.",
    };

  let board;

  try {
    board = await db.board.create({
      data: {
        title,
        imageFullUrl,
        imageId,
        imageLinkHtml,
        imageThumbUrl,
        imageUserName,
        orgId,
      },
    });

    if (!isPro) await incrementAvailableCount();

    await createAuditLog({
      entityId: board.id,
      entityTitle: board.title,
      entityType: ENTITY_TYPE.BOARD,
      action: ACTION.CREATE,
    });
  } catch (error) {
    return {
      error: "DataBase Error!",
    };
  }
  revalidatePath(`/board/${board.id}`);
  return { data: board };
};

export const createBoard = createSafeAction(CreateBoard, handler);
