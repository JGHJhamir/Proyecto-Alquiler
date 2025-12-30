
$path = "c:\Users\JHAMIR\OneDrive\Escritorio\Proyecto Alquiler\src\pages\PanelAdministrador.jsx"
$content = Get-Content $path -Raw -Encoding UTF8
$start = $content.IndexOf("const logAction")
if ($start -ge 0) {
    Write-Host "FOUND at $start"
    Write-Host "CONTENT STARTS:"
    Write-Host $content.Substring($start, 500)
    Write-Host "CONTENT ENDS"
}
else {
    Write-Host "NOT FOUND"
}
