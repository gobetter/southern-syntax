"use client";

import { useTranslations } from "next-intl";
import { Upload } from "lucide-react";

import { Button } from "@southern-syntax/ui";

import { useMediaLibrary } from "@/hooks/use-media-library";

import AdminPageHeader from "@/components/admin/admin-page-header";
import Spinner from "@/components/common/spinner";
import { DataTablePagination } from "@/components/common/data-table-pagination";
import ErrorDisplay from "@/components/common/error-display";

import SortDropdown from "../../../common/sort-dropdown";

import UploadDialog from "../upload-dialog";
import MediaGrid from "../media-grid";
import EditMediaDialog from "../edit-media-dialog";
import MediaDetailSidebar from "../media-detail-sidebar";
import ImagePreviewDialog from "../image-preview-dialog";

import Filters from "./_components/filters";

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
        onUpdateQueryAction={updateQuery}
      />
      <SortDropdown
        sortBy={sortBy}
        sortOrder={sortOrder}
        onUpdateQueryAction={updateQuery}
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
              onEditAction={setEditingMedia}
              onViewDetailsAction={setViewingMedia}
              onPreviewAction={setPreviewingMedia}
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
        onOpenChangeAction={setUploadDialogOpen}
        onUploadSuccessAction={handleUploadSuccess}
      />

      <EditMediaDialog
        isOpen={!!editingMedia}
        onOpenChangeAction={(isOpen) => !isOpen && setEditingMedia(null)}
        media={editingMedia}
      />

      <MediaDetailSidebar
        media={viewingMedia}
        onOpenChangeAction={(isOpen) => !isOpen && setViewingMedia(null)}
        onEditAction={() => handleEditRequest(viewingMedia)}
      />

      <ImagePreviewDialog
        media={previewingMedia}
        isOpen={!!previewingMedia}
        onOpenChangeAction={() => setPreviewingMedia(null)}
      />
    </>
  );
}
