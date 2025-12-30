
$path = "c:\Users\JHAMIR\OneDrive\Escritorio\Proyecto Alquiler\src\pages\PanelAdministrador.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$startMarker = "const logAction = async"
$startIndex = $content.IndexOf($startMarker)

if ($startIndex -ge 0) {
    Write-Host "Found start at $startIndex"
    
    $nextMarker = "const PanelAdministrador"
    $nextIndex = $content.IndexOf($nextMarker, $startIndex)
    
    if ($nextIndex -gt $startIndex) {
        # Restore the CLEAN function without alerts
        $cleanFunction = 'const logAction = async (action, details) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
             await supabase.from("audit_logs").insert([{
                user_id: user.id,
                action,
                details
            }]);
        }
    } catch (e) { console.error("Log failed", e); }
};

'
        $part1 = $content.Substring(0, $startIndex)
        $part3 = $content.Substring($nextIndex)
        
        $newContent = $part1 + $cleanFunction + $part3
        
        Set-Content $path $newContent -Encoding UTF8
        Write-Host "SUCCESS: Restored clean logAction."
    }
    else {
        Write-Host "ERROR: Could not find 'const PanelAdministrador' after logAction."
    }
}
else {
    Write-Host "ERROR: Could not find 'const logAction'."
}
