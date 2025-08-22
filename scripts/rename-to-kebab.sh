#!/usr/bin/env bash
set -euo pipefail

REPORT="${REPORT:-kebab-scan-report.csv}"

if [[ ! -f "$REPORT" ]]; then
  echo "Report $REPORT not found. Run scripts/scan-kebab.sh first." >&2
  exit 1
fi

command -v rg >/dev/null || { echo "ripgrep (rg) is required"; exit 1; }

# macOS vs Linux sed -i
if sed --version >/dev/null 2>&1; then
  SED_INPLACE=(-i)
else
  SED_INPLACE=(-i '')
fi

is_tracked() { git ls-files --error-unmatch "$1" >/dev/null 2>&1; }

# ข้าม header
tail -n +2 "$REPORT" | while IFS=, read -r scope file current_name suggested_name; do
  # ข้ามพื้นที่ไม่เกี่ยว
  [[ "$file" == *node_modules/* ]] && { echo "skip (node_modules): $file"; continue; }
  [[ "$file" == *dist/* ]] && { echo "skip (dist): $file"; continue; }
  [[ "$file" == *.next/* ]] && { echo "skip (.next): $file"; continue; }
  [[ "$file" == *.turbo/* ]] && { echo "skip (.turbo): $file"; continue; }

  base="$(basename "$file")"
  # ข้ามไฟล์ทดสอบ
  if [[ "$file" == *"__tests__/"* ]] \
    || [[ "$base" =~ \.test\.(ts|tsx)$ ]] \
    || [[ "$base" =~ \.spec\.(ts|tsx)$ ]] \
    || [[ "$base" == "setupTests.ts" ]] \
    || [[ "$base" == "setup-tests.ts" ]] \
    || [[ "$base" == "test-setup.ts" ]] \
    || [[ "$base" == "tests-setup.ts" ]]; then
    echo "skip (test file): $file"
    continue
  fi

  dirpath="$(dirname "$file")"
  old_stem="${current_name%.*}"
  new_stem="${suggested_name%.*}"

  # ถ้าชื่อเดิมกับชื่อใหม่เหมือนกัน ให้ข้าม
  if [[ "$file" == "$dirpath/$suggested_name" ]]; then
    echo "skip (already kebab-case): $file"
    continue
  fi

  [[ -f "$file" ]] || { echo "skip (missing): $file"; continue; }
  is_tracked "$file" || { echo "skip (not tracked by git): $file"; continue; }

  echo "Renaming: $file -> $dirpath/$suggested_name"
  git mv "$file" "$dirpath/$suggested_name"

  # อัปเดต relative imports/re-exports (ถ้าไม่เจอให้ไม่ถือว่า error)
  rg -l "from ['\"]/\\./${old_stem}['\"]" . | xargs -r sed "${SED_INPLACE[@]}" "s|from '\\./${old_stem}'|from '\\./${new_stem}'|g" || true
  rg -l "from ['\"]/\\./${old_stem}['\"]" . | xargs -r sed "${SED_INPLACE[@]}" "s|from \"\\./${old_stem}\"|from \"\\./${new_stem}\"|g" || true
  rg -l "export \\* from ['\"]/\\./${old_stem}['\"]" . | xargs -r sed "${SED_INPLACE[@]}" "s|export \\* from '\\./${old_stem}'|export * from '\\./${new_stem}'|g" || true
  rg -l "export \\* from ['\"]/\\./${old_stem}['\"]" . | xargs -r sed "${SED_INPLACE[@]}" "s|export \\* from \"\\./${old_stem}\"|export * from \"\\./${new_stem}\"|g" || true
done
