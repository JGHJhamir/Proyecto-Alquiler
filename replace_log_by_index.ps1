
$path = "c:\Users\JHAMIR\OneDrive\Escritorio\Proyecto Alquiler\src\pages\PanelAdministrador.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$startMarker = "const logAction = async"
$startIndex = $content.IndexOf($startMarker)

if ($startIndex -ge 0) {
    Write-Host "Found start at $startIndex"
    
    # Find the end of the function. It ends with }; (semicolon usually)
    # But to be safe, let's find the position of "const PanelAdministrador" which follows it.
    $nextMarker = "const PanelAdministrador"
    $nextIndex = $content.IndexOf($nextMarker, $startIndex)
    
    if ($nextIndex -gt $startIndex) {
        # The area to replace is roughly from $startIndex to just before $nextIndex
        # But we need to be careful about whitespace between them.
        # Let's verify what's between them.
        
        # New function logic
        $replacement = 'const logAction = async (action, details) => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
             const { error } = await supabase.from("audit_logs").insert([{
                user_id: user.id,
                action,
                details
            }]);
            
            if (error) {
                console.error("❌ AUDIT ERROR:", error);
                alert("Error Auditoria: " + error.message);
            } else {
                console.log("✅ AUDIT SUCCESS:", action);
            }
        } else {
            console.warn("⚠️ No user for audit");
        }
    } catch (e) { console.error("Log failed", e); }
};

'
        # Construct new content: 
        # [0...startIndex] + [replacement] + [nextIndex...]
        
        # NOTE: This replaces EVERYTHING between 'const logAction' and 'const PanelAdministrador'.
        # This includes the old function body and any spacing between them.
        # My replacement includes a trailing newline to keep separation.
        
        $part1 = $content.Substring(0, $startIndex)
        $part3 = $content.Substring($nextIndex)
        
        $newContent = $part1 + $replacement + $part3
        
        Set-Content $path $newContent -Encoding UTF8
        Write-Host "SUCCESS: Replaced logAction region."
    }
    else {
        Write-Host "ERROR: Could not find 'const PanelAdministrador' after logAction."
    }
}
else {
    Write-Host "ERROR: Could not find 'const logAction'."
}
