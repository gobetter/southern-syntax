// src/components/admin/media/MediaLibraryClient/MediaLibraryClient.tsx
"use client";

import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";

import { useMediaLibrary } from "@/hooks/useMediaLibrary";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import Spinner from "@/components/common/Spinner";
import { Button } from "@southern-syntax/ui";
import { DataTablePagination } from "@/components/common/DataTablePagination";
import ErrorDisplay from "@/components/common/ErrorDisplay";

import UploadDialog from "../UploadDialog";
import MediaGrid from "../MediaGrid/";
import EditMediaDialog from "../EditMediaDialog/";
import MediaDetailSidebar from "../MediaDetailSidebar";
import ImagePreviewDialog from "../ImagePreviewDialog";

import SortDropdown from "../../../common/SortDropdown";
import Filters from "./_components/Filters";

export default function MediaLibraryClient() {
  const t = useTranslations("admin_media");
  const t_common = useTranslations("common");

  // เรียกใช้ Hook เพื่อดึง Logic และ State ทั้งหมด
  const {
    isLoading,
    isError,
    error,
    mediaItems,
    page,
    pageSize,
    totalCount,
    inputValue,
    setInputValue,
    searchInputRef,
    categoryId,
    tagId,
    categoryOptions,
    tagOptions,
    updateQuery,
    sortBy,
    sortOrder,
    mediaSortOptions,
    isUploadDialogOpen,
    setUploadDialogOpen,
    handleUploadSuccess,
    editingMedia,
    setEditingMedia,
    viewingMedia,
    setViewingMedia,
    previewingMedia,
    setPreviewingMedia,
    handleEditRequest,
  } = useMediaLibrary();

  // เช็ก isError และ error ไปพร้อมกัน
  if (isError) {
    // ถ้า isError เป็น true, object `error` จะมีค่าเสมอ แต่เราเช็กเพื่อความปลอดภัย
    return (
      <ErrorDisplay
        message={error?.message ?? t_common("errors.unknown_error")}
      />
    );
  }

  const uploadButton = (
    <Button
      onClick={() => setUploadDialogOpen(true)}
      className="flex items-center"
    >
      <Upload className="mr-2 h-4 w-4" />
      {t("upload_button")}
    </Button>
  );

  const filterControls = (
    <div className="flex flex-wrap items-center gap-2">
      <Filters
        search={{
          value: inputValue,
          onChange: (v) => setInputValue(v),
          inputRef: searchInputRef,
        }}
        categoryId={categoryId}
        tagId={tagId}
        categoryOptions={categoryOptions}
        tagOptions={tagOptions}
        onUpdateQuery={updateQuery}
      />
      <SortDropdown
        sortBy={sortBy}
        sortOrder={sortOrder}
        onUpdateQuery={updateQuery}
        sortOptions={mediaSortOptions}
      />
    </div>
  );

  return (
    <>
      <AdminPageHeader title={t("title")} actionButton={uploadButton} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          {filterControls}
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner className="h-8 w-8" />
          </div>
        ) : mediaItems?.length ? (
          <div className="space-y-4">
            <MediaGrid
              mediaItems={mediaItems}
              onEdit={setEditingMedia}
              onViewDetails={setViewingMedia}
              onPreview={setPreviewingMedia}
            />
            <DataTablePagination
              page={page}
              pageSize={pageSize}
              totalCount={totalCount}
              // pageSizeOptions={[2, 4, 6, 8]}
            />
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
            <p>{t("no_media_found")}</p>
          </div>
        )}
      </div>

      <UploadDialog
        isOpen={isUploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      <EditMediaDialog
        isOpen={!!editingMedia}
        onOpenChange={(isOpen) => !isOpen && setEditingMedia(null)}
        media={editingMedia}
      />

      <MediaDetailSidebar
        media={viewingMedia}
        onOpenChange={(isOpen) => !isOpen && setViewingMedia(null)}
        onEdit={() => handleEditRequest(viewingMedia)}
      />

      <ImagePreviewDialog
        media={previewingMedia}
        isOpen={!!previewingMedia}
        onOpenChange={() => setPreviewingMedia(null)}
      />
    </>
  );
}
