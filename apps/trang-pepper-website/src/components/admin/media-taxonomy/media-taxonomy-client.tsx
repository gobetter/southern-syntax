"use client";

import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@southern-syntax/ui";
import type {
  MediaCategoryInput,
  MediaTagInput,
} from "@southern-syntax/schemas/media-taxonomy";
import {
  mediaCategoryInputSchema,
  mediaTagInputSchema,
} from "@southern-syntax/schemas/media-taxonomy";
import { Button } from "@southern-syntax/ui";

import { useCategoryManager } from "@/hooks/use-category-manager";
import { useTagManager } from "@/hooks/use-tag-manager";
import AdminPageHeader from "@/components/admin/admin-page-header";

import { CategoryManager } from "./_components/category-manager";
import { TagManager } from "./_components/tag-manager";

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
                <Button onClick={categoryManager.handleAddNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {t("categories.add_button")}
                </Button>
              </CardHeader>
              <CardContent>
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
