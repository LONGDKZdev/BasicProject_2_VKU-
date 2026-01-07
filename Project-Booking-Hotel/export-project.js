import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Thiết lập __dirname cho ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tên file kết quả
const OUTPUT_FILE = 'FULL_PROJECT_CONTEXT.txt';

// Các thư mục cấm (BỎ QUA)
const IGNORE_DIRS = [
    'node_modules', 
    'bin', 
    'obj', 
    '.git', 
    '.vscode', 
    'dist', 
    'build', 
    'coverage',
    'BAO_CAO_KET_QUA.files',
    '.vs'
];

// Các đuôi file muốn LẤY
const ALLOWED_EXTS = [
    '.cs', 
    '.js', 
    '.jsx', 
    '.ts', 
    '.tsx', 
    '.sql', 
    '.css', 
    '.json', 
    '.md',
    '.html' // Thêm html nếu cần
];

// Hàm xóa file cũ nếu tồn tại
if (fs.existsSync(OUTPUT_FILE)) {
    fs.unlinkSync(OUTPUT_FILE);
    console.log(`Da xoa file cu: ${OUTPUT_FILE}`);
}

function scanFolder(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                scanFolder(fullPath);
            }
        } else {
            const ext = path.extname(file).toLowerCase();
            // Bỏ qua file script này và file output
            if (ALLOWED_EXTS.includes(ext) && !file.includes('export-project') && file !== OUTPUT_FILE) {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    const header = `\n\n================================================\nFILE PATH: ${fullPath}\n================================================\n`;
                    fs.appendFileSync(OUTPUT_FILE, header + content);
                    console.log(`+ Da them: ${file}`);
                } catch (err) {
                    console.error(`! Loi doc file: ${fullPath}`);
                }
            }
        }
    });
}

console.log('--- Bat dau xuat du an ---');
scanFolder(__dirname);
console.log(`--- HOAN TAT! Kiem tra file: ${OUTPUT_FILE} ---`);