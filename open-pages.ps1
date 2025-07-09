# Open all page files in VS Code
$files = @(
    "./app/case/page.tsx",
    "./app/es/new/page.tsx",
    "./app/es/page.tsx",
    "./app/es/[id]/page.tsx",
    "./app/general/page.tsx",
    "./app/history/page.tsx",
    "./app/login/page.tsx",
    "./app/page.tsx",
    "./app/result/page.tsx",
    "./app/session/page.tsx"
)

foreach ($file in $files) {
    code $file
}