//File gop_code.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CẤU HÌNH ĐỂ CHẠY TRÊN NODEJS MỚI (ES MODULE) ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CẤU HÌNH FILE ---
const OUTPUT_FILE = 'TOAN_BO_DU_AN.txt';

// Các thư mục BỎ QUA (Đã cập nhật theo yêu cầu của bạn)
const IGNORE_DIRS = [
    'node_modules', '.git', '.vscode', 'dist', 'build', 'public', 
    'Project_Demo', 'Query', // Đã thêm Query
    '.md' // Lưu ý: Cái này chỉ bỏ qua nếu có THƯ MỤC tên là .md
];

// Các file BỎ QUA cụ thể
const IGNORE_FILES = [
    'package-lock.json', 'yarn.lock', OUTPUT_FILE, 
    '.DS_Store', 'STRUCTURE.md', 'USAGE_GUIDE.md', 
    'gop_code.js', 'README.md'
];

// Các đuôi file sẽ ĐỌC (Code + Config + SQL)
// Lưu ý: File .md không có trong này nên mặc định đã bị bỏ qua rồi
const ALLOWED_EXTS = [
    '.js', '.jsx', '.ts', '.tsx', // React code
    '.css', '.scss',              // Style
    '.json',                      // Config
    '.sql',                       // SQL
    '.env', '.env.local', '.env.example' // Môi trường
];

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        
        // 1. Xử lý thư mục
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } 
        // 2. Xử lý file
        else {
            if (!IGNORE_FILES.includes(file)) {
                const ext = path.extname(file).toLowerCase();
                // Chỉ lấy file có đuôi cho phép HOẶC là file .env
                if (ALLOWED_EXTS.includes(ext) || file.startsWith('.env')) {
                    arrayOfFiles.push(fullPath);
                }
            }
        }
    });

    return arrayOfFiles;
}

function mergeFiles() {
    try {
        console.log('⏳ Đang quét file...');
        const allFiles = getAllFiles(__dirname);
        
        if (allFiles.length === 0) {
            console.log("⚠️ Không tìm thấy file nào! Hãy kiểm tra lại cấu hình ALLOWED_EXTS.");
            return;
        }

        let content = `PROJECT STRUCTURE:\n(See attached image provided by user)\n\n`;
        
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
        console.log(`\n✅ Xong! Tổng cộng ${allFiles.length} file.`);
        console.log(`👉 File kết quả: ${OUTPUT_FILE}`);
        
    } catch (err) {
        console.error('❌ Lỗi:', err);
    }
}

mergeFiles();