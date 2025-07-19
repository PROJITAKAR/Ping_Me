// getOtherUser.js
export function getOtherUser(chat, currentUserId) {
  if (!chat || !chat.members || chat.isGroup) return null;
  return chat.members.find((member) => member._id !== currentUserId) || null;
}
