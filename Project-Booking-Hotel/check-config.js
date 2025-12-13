/**
 * Script kiểm tra cấu hình (KHÔNG hiển thị keys thực tế)
 * Chạy: node check-config.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Kiểm tra cấu hình dự án...\n');

// Kiểm tra .env
console.log('📄 Frontend (.env):');
try {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  
  const checks = {
    'VITE_SUPABASE_URL': envContent.includes('VITE_SUPABASE_URL=') && !envContent.includes('YOUR_PROJECT_REF'),
    'VITE_SUPABASE_ANON_KEY': envContent.includes('VITE_SUPABASE_ANON_KEY=') && !envContent.includes('YOUR_SUPABASE_ANON_KEY'),
    'VITE_API_URL': envContent.includes('VITE_API_URL='),
  };
  
  Object.entries(checks).forEach(([key, isValid]) => {
    const status = isValid ? '✅' : '❌';
    const value = isValid ? 'Đã config' : 'Chưa config hoặc còn placeholder';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  if (Object.values(checks).every(v => v)) {
    console.log('  ✅ Tất cả biến môi trường đã được config!\n');
  } else {
    console.log('  ⚠️  Một số biến môi trường chưa được config đúng\n');
  }
} catch (error) {
  console.log('  ❌ Không tìm thấy file .env');
  console.log('  💡 Tạo file .env từ env.example\n');
}

// Kiểm tra appsettings.json
console.log('📄 Backend (appsettings.json):');
try {
  const appsettingsPath = join(__dirname, 'Backend', 'HotelBooking.API', 'appsettings.json');
  const appsettingsContent = readFileSync(appsettingsPath, 'utf-8');
  const config = JSON.parse(appsettingsContent);
  
  const checks = {
    'Supabase.Url': config.Supabase?.Url && !config.Supabase.Url.includes('YOUR_SUPABASE_URL'),
    'Supabase.Key': config.Supabase?.Key && !config.Supabase.Key.includes('YOUR_SUPABASE_ANON_KEY'),
    'OAuth.Google.ClientId': config.OAuth?.Google?.ClientId && !config.OAuth.Google.ClientId.includes('YOUR_GOOGLE_CLIENT_ID'),
    'OAuth.Google.ClientSecret': config.OAuth?.Google?.ClientSecret && !config.OAuth.Google.ClientSecret.includes('YOUR_GOOGLE_CLIENT_SECRET'),
    'OAuth.Facebook.AppId': config.OAuth?.Facebook?.AppId && !config.OAuth.Facebook.AppId.includes('YOUR_FACEBOOK_APP_ID'),
    'OAuth.Facebook.AppSecret': config.OAuth?.Facebook?.AppSecret && !config.OAuth.Facebook.AppSecret.includes('YOUR_FACEBOOK_APP_SECRET'),
    'Email.SmtpUser': config.Email?.SmtpUser && !config.Email.SmtpUser.includes('YOUR_EMAIL'),
  };
  
  Object.entries(checks).forEach(([key, isValid]) => {
    const status = isValid ? '✅' : '❌';
    const value = isValid ? 'Đã config' : 'Chưa config hoặc còn placeholder';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  if (Object.values(checks).every(v => v)) {
    console.log('  ✅ Tất cả config đã được thiết lập!\n');
  } else {
    console.log('  ⚠️  Một số config chưa được thiết lập đúng\n');
  }
} catch (error) {
  console.log('  ❌ Không tìm thấy file appsettings.json');
  console.log('  💡 Tạo file appsettings.json từ appsettings.json.template\n');
}

// Kiểm tra .gitignore
console.log('🔒 Bảo mật (.gitignore):');
try {
  const gitignorePath = join(__dirname, '.gitignore');
  const gitignoreContent = readFileSync(gitignorePath, 'utf-8');
  
  const checks = {
    '.env': gitignoreContent.includes('.env'),
    'appsettings.json': gitignoreContent.includes('appsettings.json'),
  };
  
  Object.entries(checks).forEach(([key, isIgnored]) => {
    const status = isIgnored ? '✅' : '❌';
    const value = isIgnored ? 'Đã được bảo vệ' : 'CHƯA được bảo vệ - NGUY HIỂM!';
    console.log(`  ${status} ${key}: ${value}`);
  });
  
  if (Object.values(checks).every(v => v)) {
    console.log('  ✅ Các file nhạy cảm đã được bảo vệ khỏi Git!\n');
  } else {
    console.log('  ⚠️  Cần cập nhật .gitignore để bảo vệ keys!\n');
  }
} catch (error) {
  console.log('  ❌ Không tìm thấy file .gitignore\n');
}

console.log('✨ Hoàn tất kiểm tra!\n');
console.log('💡 Lưu ý:');
console.log('   - KHÔNG commit file .env và appsettings.json vào Git');
console.log('   - KHÔNG chia sẻ keys với bất kỳ ai');
console.log('   - Nếu keys bị lộ, hãy regenerate ngay lập tức');

