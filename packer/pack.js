// pack.js
const fs = require('fs');
const path = require('path');
const pako = require('pako');

console.log('Bắt đầu quá trình đóng gói Playable Ad...');

// --- CẤU HÌNH ---
const buildDir = path.join('..', 'build', 'web-mobile'); // Thư mục build của Cocos
const outputDir = path.join('..', 'playable_output'); // Thư mục chứa file ouput
const templateFile = 'template.html';
const bootstrapperFile = 'bootstrapper.js';
const pakoInflateFile = 'pako.inflate.min.js';
// --- KẾT THÚC CẤU HÌNH ---

// Đảm bảo thư mục output tồn tại
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 1. Đọc tệp template HTML
let templateHtml = fs.readFileSync(path.join(__dirname, templateFile), 'utf-8');
console.log('Đã đọc xong template.html.');

// 2. Đọc và nội tuyến CSS
const stylePath = path.join(buildDir, 'style.css');
if (fs.existsSync(stylePath)) {
    const cssContent = fs.readFileSync(stylePath, 'utf-8');
    templateHtml = templateHtml.replace('', `<style>${cssContent}</style>`);
    console.log('Đã nội tuyến style.css.');
}

// 3. Đọc và nội tuyến main.js
const mainJsPath = path.join(buildDir, 'main.js');
if (fs.existsSync(mainJsPath)) {
    const mainJsContent = fs.readFileSync(mainJsPath, 'utf-8');
    templateHtml = templateHtml.replace('', mainJsContent);
    console.log('Đã nội tuyến main.js.');
} else {
    console.error('LỖI: Không tìm thấy main.js. Hãy chắc chắn bạn đã build dự án.');
    return;
}

// 4. Đọc và nội tuyến các thư viện cần thiết
const pakoInflateContent = fs.readFileSync(path.join(__dirname, pakoInflateFile), 'utf-8');
templateHtml = templateHtml.replace('', pakoInflateContent);
console.log('Đã nội tuyến pako.inflate.min.js.');

const bootstrapperContent = fs.readFileSync(path.join(__dirname, bootstrapperFile), 'utf-8');
templateHtml = templateHtml.replace('', bootstrapperContent);
console.log('Đã nội tuyến bootstrapper.js.');

// 5. Quét, nén và mã hóa tất cả tài sản
const assetsDir = path.join(buildDir, 'assets');
const compressedAssets = {};
let totalOriginalSize = 0;
let totalCompressedSize = 0;

function discoverAssets(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            discoverAssets(fullPath);
        } else {
            const relativePath = path.relative(buildDir, fullPath).replace(/\\/g, '/');
            const rawBuffer = fs.readFileSync(fullPath);
            
            // Nén bằng pako
            const compressed = pako.deflate(rawBuffer);
            
            // Mã hóa Base64
            const base64String = Buffer.from(compressed).toString('base64');
            
            compressedAssets[relativePath] = base64String;
            
            totalOriginalSize += rawBuffer.length;
            totalCompressedSize += base64String.length;
        }
    }
}

if (fs.existsSync(assetsDir)) {
    console.log('Bắt đầu nén tài sản...');
    discoverAssets(assetsDir);
    const assetsJsonString = JSON.stringify(compressedAssets);
    templateHtml = templateHtml.replace("'{{PASTE_ASSETS_HERE}}'", assetsJsonString);
    console.log('Đã nén và nhúng tất cả tài sản.');
    console.log(`Kích thước tài sản gốc: ${(totalOriginalSize / 1024).toFixed(2)} KB`);
    console.log(`Kích thước sau khi nén + Base64: ${(totalCompressedSize / 1024).toFixed(2)} KB`);
}

// 6. Ghi tệp HTML cuối cùng
const finalHtmlPath = path.join(outputDir, 'index.html');
fs.writeFileSync(finalHtmlPath, templateHtml);

console.log('--- HOÀN TẤT! ---');
console.log(`Tệp Playable Ad đã được tạo tại: ${finalHtmlPath}`);
const finalSize = fs.statSync(finalHtmlPath).size;
console.log(`Kích thước tệp cuối cùng: ${(finalSize / (1024 * 1024)).toFixed(2)} MB`);
if (finalSize > 5 * 1024 * 1024) {
    console.warn('CẢNH BÁO: Kích thước tệp cuối cùng lớn hơn 5MB, có thể bị Mintegral từ chối.');
}