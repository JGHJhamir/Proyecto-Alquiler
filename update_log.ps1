
$path = "c:\Users\JHAMIR\OneDrive\Escritorio\Proyecto Alquiler\src\pages\PanelAdministrador.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

# Define the pattern to find the existing logAction function (robust regex)
# Matches: const logAction = async (action, details) => { ... } catch (e) { console.error("Log failed", e); };
$pattern = 'const logAction = async \(action, details\) => \{[\s\S]*?\} catch \(e\) \{ console\.error\("Log failed", e\); \};'

# Define the new content with logging
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
        }
    } catch (e) { console.error("Log failed", e); }
};'

# Perform replacement
if ($content -match $pattern) {
    $newContent = [Regex]::Replace($content, $pattern, $replacement)
    Set-Content $path $newContent -Encoding UTF8
    Write-Host "SUCCESS: logAction updated with logging."
} else {
    Write-Host "ERROR: Could not find logAction pattern."
    # Debug: Print a snippet where it should be
    $start = $content.IndexOf("const logAction")
    if ($start -ge 0) {
        Write-Host "Found 'const logAction' at index $start"
        Write-Host "Next 200 chars: " $content.Substring($start, 200)
    } else {
        Write-Host "Could not even find 'const logAction'"
    }
}
