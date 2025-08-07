// src/components/common/DataTablePagination.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { useUpdateQuery } from "@southern-syntax/hooks";

import {
  Button,
  Pagination,
  PaginationContent,
  PaginationItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@southern-syntax/ui";

interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  pageSizeOptions?: number[];
}

export function DataTablePagination({
  page,
  pageSize,
  totalCount,
  pageSizeOptions,
}: DataTablePaginationProps) {
  const t = useTranslations("common.pagination");
  const updateQuery = useUpdateQuery();
  const totalPages = Math.ceil(totalCount / pageSize);

  const options = useMemo(
    () => pageSizeOptions ?? [10, 25, 50, 100],
    [pageSizeOptions]
  );

  useEffect(() => {
    // ถ้าค่า pageSize ที่ใช้อยู่ปัจจุบันไม่มีอยู่ในรายการ options ที่ถูกต้อง
    if (!options.includes(pageSize)) {
      // ให้สั่งอัปเดต URL โดยใช้ค่าแรกของ options เป็นค่าใหม่
      updateQuery({ pageSize: options[0] });
    }
    // เราใส่ options ใน dependency array ไม่ได้ตรงๆ เพราะเป็น object
    // แต่การใช้ useMemo ข้างบนช่วยแก้ปัญหานี้แล้ว
  }, [pageSize, options, updateQuery]);

  const getPageNumbers = (
    current: number,
    total: number
  ): (number | "...")[] => {
    const delta = 2;
    const range: (number | "...")[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push("...");
    if (total > 1) range.push(total);

    return range;
  };

  // เราอาจจะยังเห็นหน้ากระพริบสั้นๆ 1 ครั้งขณะที่ component กำลัง "แก้ไขตัวเอง"
  // การเช็กแบบนี้จะช่วยให้ UI ไม่แสดงผลด้วยค่าที่ผิดพลาด
  if (!options.includes(pageSize)) {
    return null; // หรือแสดง <Spinner /> ก็ได้
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground flex-1 text-sm whitespace-nowrap">
        {t("page_info", { page, totalPages, totalCount })}
      </div>

      <div className="flex items-center gap-6 lg:gap-8">
        {/* rows per page */}
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium whitespace-nowrap">
            {t("rows_per_page")}
          </p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) =>
              updateQuery({ page: 1, pageSize: Number(value) })
            }
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {options.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pagination controls */}
        <Pagination>
          <PaginationContent>
            {/* First */}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuery({ page: 1 })}
                disabled={page === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>

            {/* Previous */}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuery({ page: page - 1 })}
                disabled={page === 1}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                <span>{t("previous")}</span>
              </Button>
            </PaginationItem>

            {/* Page Numbers */}
            {getPageNumbers(page, totalPages).map((p, i) => (
              <PaginationItem key={i}>
                {p === "..." ? (
                  <span className="text-muted-foreground px-2 select-none">
                    …
                  </span>
                ) : (
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateQuery({ page: Number(p) })}
                  >
                    {p}
                  </Button>
                )}
              </PaginationItem>
            ))}

            {/* Next */}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuery({ page: page + 1 })}
                disabled={page >= totalPages}
              >
                <span>{t("next")}</span>
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </PaginationItem>

            {/* Last */}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuery({ page: totalPages })}
                disabled={page >= totalPages}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
