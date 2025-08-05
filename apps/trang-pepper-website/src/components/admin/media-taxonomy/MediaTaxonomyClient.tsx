// src/components/admin/media-taxonomy/MediaTaxonomyClient.tsx
"use client";

import { useTranslations } from "next-intl";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@southern-syntax/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@southern-syntax/ui/card";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

import { CategoryManager } from "./_components/CategoryManager";
import { TagManager } from "./_components/TagManager";
import { useForm } from "react-hook-form";
import {
  MediaCategoryInput,
  mediaCategoryInputSchema,
  MediaTagInput,
  mediaTagInputSchema,
} from "@/schemas/media-taxonomy";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCategoryManager } from "@/hooks/useCategoryManager";
import { useTagManager } from "@/hooks/useTagManager";
import { Button } from "@southern-syntax/ui/button";
import { PlusCircle } from "lucide-react";

export default function MediaTaxonomyClient() {
  const t = useTranslations("admin_media_taxonomy");

  const categoryForm = useForm<MediaCategoryInput>({
    resolver: zodResolver(mediaCategoryInputSchema),
  });
  const categoryManager = useCategoryManager({ formMethods: categoryForm });

  const tagForm = useForm<MediaTagInput>({
    resolver: zodResolver(mediaTagInputSchema),
  });
  const tagManager = useTagManager({ formMethods: tagForm });

  return (
    <>
      <AdminPageHeader title={t("title")} />

      <div className="mt-4">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">{t("tabs.categories")}</TabsTrigger>
            <TabsTrigger value="tags">{t("tabs.tags")}</TabsTrigger>
          </TabsList>
          <TabsContent value="categories">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("categories.manage_title")}</CardTitle>
                {/* ✅ 3. สร้าง Action Button ที่นี่โดยใช้ handler จาก hook */}
                <Button onClick={categoryManager.handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("categories.add_button")}
                </Button>
              </CardHeader>
              <CardContent>
                {/* ✅ 4. ส่ง props ที่จำเป็นลงไปให้ CategoryManager */}
                <CategoryManager
                  manager={categoryManager}
                  formMethods={categoryForm}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("tags.manage_title")}</CardTitle>
                <Button onClick={tagManager.handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("tags.add_button")}
                </Button>
              </CardHeader>
              <CardContent>
                <TagManager manager={tagManager} formMethods={tagForm} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
