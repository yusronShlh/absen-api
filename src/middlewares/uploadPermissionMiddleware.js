import multer from "multer";
import fs from "fs";
import path from "path";
import console from "console";

const uploadDir =
  process.env.UPLOAD_TEACHER || path.join("uploads", "teacher-permissions");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Folder upload dibuat:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📥 Upload destination triggered");
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    console.log("📄 File name generated:", uniqueName);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("🔍 File type:", file.mimetype);

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "video/mp4",
    "video/quicktime",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("File type tidak didukung"), false);
  }
};

const uploadPermission = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default uploadPermission;
