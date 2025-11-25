# 🚀 QUICK DEPLOY SCRIPT
# Copy và paste toàn bộ script này vào PowerShell

Write-Host "🎯 BƯỚC 1: Khởi tạo Git..." -ForegroundColor Green
git init

Write-Host "`n🎯 BƯỚC 2: Thêm tất cả file..." -ForegroundColor Green
git add .

Write-Host "`n🎯 BƯỚC 3: Commit..." -ForegroundColor Green
git commit -m "Initial commit - Ready for deployment"

Write-Host "`n🎯 BƯỚC 4: Đổi branch sang main..." -ForegroundColor Green
git branch -M main

Write-Host "`n✅ GIT ĐÃ SẴN SÀNG!" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 BƯỚC TIẾP THEO:" -ForegroundColor Yellow
Write-Host "1. Tạo repository trên GitHub: https://github.com/new" -ForegroundColor White
Write-Host "2. Copy URL repo (dạng: https://github.com/USERNAME/REPO.git)" -ForegroundColor White  
Write-Host "3. Chạy 2 lệnh sau (THAY YOUR_GITHUB_URL):" -ForegroundColor White
Write-Host ""
Write-Host "   git remote add origin YOUR_GITHUB_URL" -ForegroundColor Magenta
Write-Host "   git push -u origin main" -ForegroundColor Magenta
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
