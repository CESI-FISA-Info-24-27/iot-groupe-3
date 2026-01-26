# Compiler ESP32
Write-Host "`n========== COMPILATION ESP32 ==========" -ForegroundColor Cyan
Set-Location ./ESP32/ESP32
Write-Host "Compilation en cours..." -ForegroundColor Yellow
& pio run
if ($LASTEXITCODE -ne 0) { Write-Host "Compilation ESP32 échouée"; exit 1 }
Write-Host "Upload en cours..." -ForegroundColor Yellow
& pio run --target upload
if ($LASTEXITCODE -ne 0) { Write-Host "Upload ESP32 échoué"; exit 1 }
Write-Host "ESP32 compilé et uploadé" -ForegroundColor Green
Set-Location ../../

# Compiler ESP32_CAM
Write-Host "`n========== COMPILATION ESP32_CAM ==========" -ForegroundColor Cyan
Set-Location ./ESP32_CAM/ESP32_CAM
Write-Host "Compilation en cours..." -ForegroundColor Yellow
& pio run
if ($LASTEXITCODE -ne 0) { Write-Host "Compilation ESP32_CAM échouée"; exit 1 }
Write-Host "Upload en cours..." -ForegroundColor Yellow
& pio run --target upload
if ($LASTEXITCODE -ne 0) { Write-Host "Upload ESP32_CAM échoué"; exit 1 }
Write-Host "ESP32_CAM compilé et uploadé" -ForegroundColor Green
Set-Location ../../

Write-Host "`n========== SUCCES ==========" -ForegroundColor Green
Write-Host "Tous les firmwares compilés et uploadés" -ForegroundColor Green
Write-Host "Lancement des ports série dans 2 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Lancer les moniteurs série
Write-Host "Ouverture des moniteurs série..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @('-NoExit', '-Command', 'cd ''.\ESP32\ESP32''; pio device monitor')
Start-Process powershell -ArgumentList @('-NoExit', '-Command', 'cd ''.\ESP32_CAM\ESP32_CAM''; pio device monitor')
Write-Host "Moniteurs ouverts" -ForegroundColor Green