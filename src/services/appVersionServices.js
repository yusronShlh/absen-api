import fs from "fs";
import path from "path";

class AppVersionService {
  static getVersion() {
    const filePath = path.join(
      process.cwd(),
      "src",
      "config",
      "appVersion.json",
    );

    const data = fs.readFileSync(filePath, "utf8");

    console.log("APP VERSION FILE:");
    console.log(data);

    return JSON.parse(data);
  }
}

export default AppVersionService;
