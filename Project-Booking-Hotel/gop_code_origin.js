import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CẤU HÌNH ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = 'GIAO_DIEN_GOC_DEMO.txt'; // Tên file đầu ra mới
const TARGET_FOLDER = 'Project_Demo';         // Chỉ quét folder này

// Các file/folder cần loại bỏ NẾU NÓ NẰM TRONG Project_Demo
const IGNORE_DIRS = ['node_modules', '.git', '.vscode', 'dist', 'build'];
const IGNORE_FILES = ['.DS_Store', 'package-lock.json', 'yarn.lock'];

// Các đuôi file giao diện cần lấy
const ALLOWED_EXTS = [
    '.html', '.css', '.scss', 
    '.js', '.jsx', '.ts', '.tsx', // Lấy cả JS trong demo vì có thể chứa logic giao diện cũ
    '.json' // Đôi khi cấu hình giao diện nằm ở json
];

function getAllFiles(dirPath, arrayOfFiles) {
    // Kiểm tra xem thư mục có tồn tại không
    if (!fs.existsSync(dirPath)) {
        return arrayOfFiles || [];
    }

    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        
        // 1. Nếu là thư mục
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } 
        // 2. Nếu là file
        else {
            if (!IGNORE_FILES.includes(file)) {
                const ext = path.extname(file).toLowerCase();
                if (ALLOWED_EXTS.includes(ext)) {
                    arrayOfFiles.push(fullPath);
                }
            }
        }
    });

    return arrayOfFiles;
}

function mergeFiles() {
    try {
        console.log(`🎯 Đang quét thư mục gốc: ${TARGET_FOLDER}...`);
        
        // Chỉ trỏ thẳng vào folder Project_Demo
        const targetPath = path.join(__dirname, TARGET_FOLDER);
        const allFiles = getAllFiles(targetPath);
        
        if (allFiles.length === 0) {
            console.log(`⚠️ Không tìm thấy file nào trong ${TARGET_FOLDER}! Hãy kiểm tra lại tên thư mục.`);
            return;
        }

        let content = `=== ORIGINAL UI SOURCE FROM: ${TARGET_FOLDER} ===\n\n`;
        
        allFiles.forEach(filePath => {
            // Lấy đường dẫn tương đối
            const relativePath = path.relative(__dirname, filePath);
            
            console.log(`📄 Đọc: ${relativePath}`);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            content += `\n\n=================================================================\n`;
            content += `FILE PATH: ${relativePath}\n`;
            content += `=================================================================\n`;
            content += fileContent;
        });

        fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
        console.log(`\n✅ Xong! Tìm thấy ${allFiles.length} file giao diện gốc.`);
        console.log(`👉 File kết quả: ${OUTPUT_FILE}`);
        
    } catch (err) {
        console.error('❌ Lỗi:', err);
    }
}

mergeFiles();