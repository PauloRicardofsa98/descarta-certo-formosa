import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { getSession } from "@/app/_lib/auth";

const f = createUploadthing();

export const uploadRouter = {
  pointPhotos: f({
    image: { maxFileSize: "4MB", maxFileCount: 3 },
  })
    .middleware(async () => {
      const session = await getSession();
      if (!session) {
        throw new UploadThingError("Sessão expirada. Faça login novamente.");
      }
      return { adminId: session.adminId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { adminId: metadata.adminId, url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;
