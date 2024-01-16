-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_clientId_fkey";

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
