// bootstrapper.js
(function () {
    // Chờ pako và đối tượng assets sẵn sàng
    if (!window.pako ||!window.PAKO_ASSETS) {
        console.error("Pako hoặc PAKO_ASSETS chưa được tải.");
        return;
    }

    console.log("Bootstrapper: Bắt đầu giải nén tài sản...");
    const decompressedAssets = {};

    // Giải nén tất cả tài sản từ bộ nhớ
    for (const path in window.PAKO_ASSETS) {
        try {
            const base64String = window.PAKO_ASSETS[path];
            
            // Chuyển Base64 về chuỗi nhị phân
            const binaryString = atob(base64String);
            
            // Chuyển chuỗi nhị phân về Uint8Array
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Giải nén bằng pako.inflate
            const decompressed = pako.inflate(bytes);
            decompressedAssets[path] = decompressed;

        } catch (e) {
            console.error(`Lỗi giải nén tệp: ${path}`, e);
        }
    }
    console.log("Bootstrapper: Đã giải nén xong. Can thiệp vào trình tải của Cocos...");

    // Can thiệp vào quá trình tải của Cocos Engine
    // Ghi đè phương thức tải mặc định để nó lấy tài sản từ bộ nhớ thay vì từ mạng
    // Điều này áp dụng cho Cocos Creator 2.4.x và 3.x với assetManager
    if (window.cc && cc.assetManager && cc.assetManager.downloader) {
        const downloader = cc.assetManager.downloader;
        const originalDownload = downloader.download.bind(downloader);

        // Ghi đè hàm download chính
        downloader.download = function(id, url, ext, options, onComplete) {
            // Nếu tài sản có trong bộ nhớ đã giải nén của chúng ta
            if (decompressedAssets[url]) {
                // console.log(`Tải từ bộ nhớ: ${url}`);
                // Trả về dữ liệu đã giải nén ngay lập tức
                onComplete(null, decompressedAssets[url]);
            } else {
                // Nếu không có, gọi hàm download gốc (trường hợp dự phòng, không nên xảy ra trong playable ad)
                console.warn(`Không tìm thấy tài sản trong bộ nhớ, thử tải gốc: ${url}`);
                originalDownload(id, url, ext, options, onComplete);
            }
        };

        // Ghi đè thêm các hàm tải file cụ thể để chắc chắn
        const originalDownloadFile = downloader.downloadFile.bind(downloader);
        downloader.downloadFile = function(url, options, onComplete) {
             if (decompressedAssets[url]) {
                // console.log(`Tải file từ bộ nhớ: ${url}`);
                onComplete(null, decompressedAssets[url]);
            } else {
                console.warn(`Không tìm thấy file trong bộ nhớ, thử tải gốc: ${url}`);
                originalDownloadFile(url, options, onComplete);
            }
        };

        console.log("Bootstrapper: Đã can thiệp thành công vào cc.assetManager.downloader.");
    } else {
        console.error("Bootstrapper: Không tìm thấy cc.assetManager.downloader để can thiệp.");
    }

    // Dọn dẹp để giải phóng bộ nhớ
    window.PAKO_ASSETS = null;
})();