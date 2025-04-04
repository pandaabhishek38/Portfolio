-- CreateTable
CREATE TABLE "ContactItem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "url" TEXT,

    CONSTRAINT "ContactItem_pkey" PRIMARY KEY ("id")
);
