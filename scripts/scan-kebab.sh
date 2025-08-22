#!/usr/bin/env bash
set -euo pipefail

# พื้นที่ที่ตรวจ: packages/**/src และ apps/**
GLOBS=(
  "packages/**/src/**/*.ts"
  "packages/**/src/**/*.tsx"
  "apps/**/*.ts"
  "apps/**/*.tsx"
)

is_kebab_or_index() {
  local stem="$1"
  [[ "$stem" == "index" ]] && return 0
  [[ "$stem" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]] && return 0
  return 1
}

kebabize() {
  # CamelCase / camelCase / snake_case -> kebab-case
  perl -pe 's/_/-/g; s/([a-z0-9])([A-Z])/\1-\2/g; s/([A-Z]+)([A-Z][a-z])/\1-\2/g; $_=lc' <<< "$1"
}

echo "scope,file,current_name,suggested_name"

shopt -s globstar nullglob
for g in "${GLOBS[@]}"; do
  for f in $g; do
    # ข้ามพื้นที่ที่ไม่เกี่ยว
    [[ "$f" == *.d.ts ]] && continue
    [[ "$f" == *node_modules/* ]] && continue
    [[ "$f" == *dist/* ]] && continue
    [[ "$f" == *.next/* ]] && continue
    [[ "$f" == *.turbo/* ]] && continue

    # ✅ ข้ามไฟล์ทดสอบทั่วไป
    base="$(basename "$f")"
    if [[ "$f" == *"__tests__/"* ]] \
      || [[ "$base" =~ \.test\.(ts|tsx)$ ]] \
      || [[ "$base" =~ \.spec\.(ts|tsx)$ ]] \
      || [[ "$base" == "setupTests.ts" ]] \
      || [[ "$base" == "setup-tests.ts" ]] \
      || [[ "$base" == "test-setup.ts" ]] \
      || [[ "$base" == "tests-setup.ts" ]] ; then
      continue
    fi

    stem="${base%.*}"
    if ! is_kebab_or_index "$stem"; then
      sugg="$(kebabize "$stem")"
      # ถ้าชื่อที่แนะนำออกมาตรงกับปัจจุบันอยู่แล้ว ให้ข้าม (กัน noise)
      [[ "${sugg}.${f##*.}" == "$base" ]] && continue
      echo "auto,$f,$base,${sugg}.${f##*.}"
    fi
  done
done
