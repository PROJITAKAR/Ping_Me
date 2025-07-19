const extractPublicId = (url) => {
  // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/chat-attachments/filename.jpg
  try {
    const parts = url.split("/");
    const folderIndex = parts.findIndex((part) => part === "chat-attachments");
    const publicIdWithExtension = parts.slice(folderIndex).join("/"); // chat-attachments/filename.jpg

    // Remove file extension
    return publicIdWithExtension.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

export default extractPublicId;