import fs from "fs";
import path from "path";

// noinspection t
function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith(".js")) {
            let content = fs.readFileSync(fullPath, "utf8");

            content = content.replace(/(from\s+['"])(\.\/[^'"]+)(['"])/g, (_, prefix, importPath, suffix) => {
                const absPath = path.resolve(path.dirname(fullPath), importPath);
                if (fs.existsSync(absPath + ".js")) {
                    return `${prefix}${importPath}.js${suffix}`;
                } else if (fs.existsSync(path.join(absPath, "index.js"))) {
                    return `${prefix}${importPath}/index.js${suffix}`;
                } else {
                    return `${prefix}${importPath}${suffix}`; // leave unchanged
                }
            });

            content = content.replace(/(require\(['"])(\.\/[^'"]+)(['"]\))/g, (_, prefix, importPath, suffix) => {
                const absPath = path.resolve(path.dirname(fullPath), importPath);
                if (fs.existsSync(absPath + ".js")) {
                    return `${prefix}${importPath}.js${suffix}`;
                } else if (fs.existsSync(path.join(absPath, "index.js"))) {
                    return `${prefix}${importPath}/index.js${suffix}`;
                } else {
                    return `${prefix}${importPath}${suffix}`;
                }
            });

            fs.writeFileSync(fullPath, content);
        }
    }
}

walk("./lib");
