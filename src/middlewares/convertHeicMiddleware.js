import fs from "fs/promises";
import convert from "heic-convert";
import path from "path";
import sharp from "sharp";

const convertHeicMiddleware = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }
    const ext = path.extname(req.file.filename).toLocaleLowerCase();
    if (ext !== ".heic" && ext !== "heif") {
      return next();
    }

    console.log("HEIC detected:", req.file.filename);

    const inputBuffer = await fs.readFile(req.file.path);

    const outpuBuffer = await convert({
      buffer: inputBuffer,
      format: "JPEG",
      quality: 0.9,
    });

    const jpgName = path.basename(req.file.filename, ext) + ".jpg";
    const jpgPath = path.join(path.dirname(req.file.path), jpgName);

    await sharp(outpuBuffer).jpeg({ quality: 90 }).toFile(jpgPath);

    await fs.unlink(req.file.path);

    req.file.filename = jpgName;
    req.file.path = jpgPath;
    req.file.mimetype = "image/jpeg";

    console.log("Converted:", jpgName);

    next();
  } catch (err) {
    console.log("HEIC convert error:", err);

    next(err);
  }
};

export default convertHeicMiddleware;
