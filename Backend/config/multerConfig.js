import multer from "multer";

const storage = multer.memoryStorage(); // stores file in memory
const upload = multer({ storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
 });

export default upload;