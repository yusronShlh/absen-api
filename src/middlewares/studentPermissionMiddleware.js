import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath =
  process.env.UPLOAD_STUDENTS || path.join("uploads", "student-permissions");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 Folder upload dibuat:", uploadPath);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const studentId = req.user?.student?.id || "unknown";
    const ext = path.extname(file.originalname);
    cb(null, `student-${studentId}-${Date.now()}${ext}`);
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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export default upload;
