-- AlterTable
ALTER TABLE "ForumPost" ADD COLUMN     "userForumPostId" TEXT,
ALTER COLUMN "forumId" DROP NOT NULL,
ALTER COLUMN "topic" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ForumPost" ADD CONSTRAINT "ForumPost_userForumPostId_fkey" FOREIGN KEY ("userForumPostId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
