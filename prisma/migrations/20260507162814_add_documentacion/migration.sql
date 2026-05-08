-- CreateTable
CREATE TABLE "CategoriaDocumento" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoriaDocumento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnlaceDocumento" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoriaId" TEXT NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EnlaceDocumento_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnlaceDocumento" ADD CONSTRAINT "EnlaceDocumento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "CategoriaDocumento"("id") ON DELETE CASCADE ON UPDATE CASCADE;
