/*
  Warnings:

  - You are about to drop the column `chatroomId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerifiedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fullname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `rememberToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Chatroom` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChatroomUsers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChatroomUsers` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `chatRoomId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatroomUsers" DROP CONSTRAINT "ChatroomUsers_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "ChatroomUsers" DROP CONSTRAINT "ChatroomUsers_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatroomId_fkey";

-- DropForeignKey
ALTER TABLE "_ChatroomUsers" DROP CONSTRAINT "_ChatroomUsers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatroomUsers" DROP CONSTRAINT "_ChatroomUsers_B_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "chatroomId",
ADD COLUMN     "chatRoomId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerifiedAt",
DROP COLUMN "fullname",
DROP COLUMN "rememberToken",
ADD COLUMN     "fullName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Chatroom";

-- DropTable
DROP TABLE "ChatroomUsers";

-- DropTable
DROP TABLE "_ChatroomUsers";

-- CreateTable
CREATE TABLE "ChatRoom" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChatRoomUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatRoomUser_AB_unique" ON "_ChatRoomUser"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatRoomUser_B_index" ON "_ChatRoomUser"("B");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomUser" ADD CONSTRAINT "_ChatRoomUser_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatRoomUser" ADD CONSTRAINT "_ChatRoomUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
