const fs = require('fs');
const path = require('path');

// --- CẤU HÌNH ---
const OUTPUT_FILE = 'project_full_context.txt'; // Tên file kết quả
const MAX_FILE_SIZE_KB = 500; // Bỏ qua file lớn hơn 500KB để tránh bị nặng

// Các thư mục cần BỎ QUA (Quan trọng để không bị treo máy)
const IGNORE_DIRS = [
    'node_modules',
    '.git',
    '.vscode',
    'dist',
    'build',
    'coverage',
    'Storage_File_md', // Dựa trên ảnh của bạn
    'Storage_File_txt', // Dựa trên ảnh của bạn
];

// Các file cần BỎ QUA
const IGNORE_FILES = [
    'package-lock.json',
    'yarn.lock',
    '.env', // QUAN TRỌNG: Không gửi file chứa mật khẩu/key
    '.DS_Store',
    OUTPUT_FILE,
    'export-project-snapshot.cjs', // Bỏ qua chính file script này
    'project-snapshot.txt'
];

// Chỉ đọc các định dạng file code này
const ALLOWED_EXTENSIONS = [
    '.js', '.jsx', '.ts', '.tsx', 
    '.scss', '.html', 
    '.json', '.sql', 
    '.toml',
];

// --- HÀM XỬ LÝ ---

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);

    arrayOfFiles = arrayOfFiles || [];

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        
        if (fs.statSync(fullPath).isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
            }
        } else {
            if (!IGNORE_FILES.includes(file)) {
                const ext = path.extname(file).toLowerCase();
                // Kiểm tra đuôi file có nằm trong danh sách cho phép không
                if (ALLOWED_EXTENSIONS.includes(ext)) {
                    arrayOfFiles.push(fullPath);
                }
            }
        }
    });

    return arrayOfFiles;
}

function generateSnapshot() {
    console.log('🔄 Đang bắt đầu quét dự án...');
    const rootDir = __dirname; // Thư mục hiện tại
    const allFiles = getAllFiles(rootDir, []);
    
    let content = `PROJECT SNAPSHOT\nGenerated at: ${new Date().toISOString()}\n\n`;
    content += `Total files found: ${allFiles.length}\n`;
    content += `==================================================\n\n`;

    let processedCount = 0;

    allFiles.forEach(filePath => {
        try {
            const stats = fs.statSync(filePath);
            const fileSizeInBytes = stats.size;
            const fileSizeInKilobytes = fileSizeInBytes / 1024;

            // Bỏ qua file quá lớn
            if (fileSizeInKilobytes > MAX_FILE_SIZE_KB) {
                console.log(`⚠️ Bỏ qua file lớn: ${path.relative(rootDir, filePath)}`);
                return;
            }

            const relativePath = path.relative(rootDir, filePath);
            const fileContent = fs.readFileSync(filePath, 'utf8');

            // Định dạng để AI dễ đọc
            content += `--- START FILE: ${relativePath} ---\n`;
            content += fileContent;
            content += `\n--- END FILE: ${relativePath} ---\n\n`;
            
            processedCount++;
        } catch (err) {
            console.error(`❌ Lỗi đọc file ${filePath}:`, err.message);
        }
    });

    fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
    console.log(`✅ Đã hoàn thành!`);
    console.log(`📄 Đã ghi ${processedCount} file vào: ${OUTPUT_FILE}`);
}

// Chạy script
generateSnapshot();