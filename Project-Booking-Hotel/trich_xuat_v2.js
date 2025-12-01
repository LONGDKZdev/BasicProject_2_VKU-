import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// --- CẤU HÌNH ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tên file kết quả
const OUTPUT_FILE = 'CODE_NGUON_V2.txt';

// ĐƯỜNG DẪN MỤC TIÊU: Đi vào folder V2 nằm trong Project_Demo
// Dựa trên ảnh bạn gửi: Project_Demo > Project-Booking-Hotel
const TARGET_PATH = path.join(__dirname, 'Project_Demo', 'Project-Booking-Hotel');

// Các thư mục cần bỏ qua
const IGNORE_DIRS = ['node_modules', '.git', '.vscode', 'dist', 'build', 'public'];

// Các file cần bỏ qua
const IGNORE_FILES = [
    'package-lock.json', 'yarn.lock', '.DS_Store', 
    'README.md', 'OUTPUT_FILE'
];

// Các đuôi file sẽ lấy (Code quan trọng)
const ALLOWED_EXTS = [
    '.js', '.jsx', '.ts', '.tsx', // Logic React
    '.css', '.scss',              // Giao diện
    '.json',                      // Cấu hình
    '.sql'                        // Database (nếu có)
];

function getAllFiles(dirPath, arrayOfFiles) {
    if (!fs.existsSync(dirPath)) {
        console.log(`⚠️ Không tìm thấy đường dẫn: ${dirPath}`);
        return arrayOfFiles || [];
    }

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
        console.log(`🎯 Đang nhắm vào folder V2: ${TARGET_PATH}`);
        console.log('⏳ Đang quét toàn bộ code trong đó...');
        
        const allFiles = getAllFiles(TARGET_PATH);
        
        if (allFiles.length === 0) {
            console.log("❌ Không tìm thấy file nào! Hãy kiểm tra lại tên folder trong Project_Demo.");
            return;
        }

        let content = `=== SOURCE CODE FROM V2 (Project-Booking-Hotel) ===\n`;
        content += `Path: Project_Demo/Project-Booking-Hotel\n\n`;
        
        allFiles.forEach(filePath => {
            // Lấy đường dẫn tương đối tính từ folder V2 cho gọn
            const relativePath = path.relative(TARGET_PATH, filePath);
            
            console.log(`📄 Đọc: ${relativePath}`);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            
            content += `\n\n=================================================================\n`;
            content += `FILE PATH (V2): ${relativePath}\n`;
            content += `=================================================================\n`;
            content += fileContent;
        });

        fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
        console.log(`\n✅ THÀNH CÔNG!`);
        console.log(`👉 Đã trích xuất ${allFiles.length} file từ V2.`);
        console.log(`👉 File kết quả: ${OUTPUT_FILE}`);
        
    } catch (err) {
        console.error('❌ Lỗi:', err);
    }
}

mergeFiles();