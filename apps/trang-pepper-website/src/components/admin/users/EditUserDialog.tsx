// src/components/admin/users/EditUserDialog.tsx
"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Controller, useWatch } from "react-hook-form";

// import { UserItem } from "@/types/trpc";
import type { UserItem } from "@/types/user";
import { useEditUserForm } from "@/hooks/useEditUserForm";

import {
  Button,
  Input,
  Label,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@southern-syntax/ui";
import Spinner from "@/components/common/Spinner";
import FormFieldError from "@/components/common/FormFieldError";

interface EditUserDialogProps {
  user: UserItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
}: EditUserDialogProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const t_form_labels = useTranslations("common.form_labels");
  const t_dialog_edit = useTranslations("admin_users.dialog_edit");

  const {
    register,
    handleSubmit,
    control,
    reset,
    errors,
    onSubmit,
    roleOptions,
    isLoading,
  } = useEditUserForm({
    user,
    onSuccess: () => onOpenChange(false),
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
    }
    onOpenChange(open);
  };

  const isActiveValue = useWatch({
    control,
    name: "isActive",
  });

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>{t_dialog_edit("title")}</DialogTitle>
          <DialogDescription>{t_dialog_edit("description")}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="en" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="th">ภาษาไทย</TabsTrigger>
          </TabsList>

          <form
            id="edit-user-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            {/* Tab Content สำหรับภาษาอังกฤษ */}
            <TabsContent value="en" className="m-0 space-y-4">
              <div>
                <Label htmlFor="name_en" className="mb-1 block">
                  {t_form_labels("name_en")}
                </Label>
                <Input id="name_en" {...register("name.en")} />
                <FormFieldError error={errors.name?.en} />
              </div>
            </TabsContent>

            {/* Tab Content สำหรับภาษาไทย */}
            <TabsContent value="th" className="m-0 space-y-4">
              <div>
                <Label htmlFor="name_th" className="mb-1 block">
                  {t_form_labels("name_th")}
                </Label>
                <Input id="name_th" {...register("name.th")} />
                <FormFieldError error={errors.name?.th} />
              </div>
            </TabsContent>

            {/* Email */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="email" className="mb-1 block">
                  {t_form_labels("email")}
                </Label>
                <Input id="email" type="email" {...register("email")} />
                <FormFieldError error={errors.email} />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" className="mb-1 block">
                  {t_form_labels("password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  placeholder={t_form_labels("password_placeholder_unchanged")}
                />
                <FormFieldError error={errors.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <Label htmlFor="confirmPassword" className="mb-1 block">
                  {t_form_labels("confirm_password")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                <FormFieldError error={errors.confirmPassword} />
              </div>

              {/* Role */}
              <div>
                <Label className="mb-1 block">{t_form_labels("role")}</Label>
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t_form_labels("role_placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FormFieldError error={errors.roleId} />
              </div>

              {/* Is Active */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="isActive"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={user?.id === currentUserId}
                    />
                  )}
                />
                <Label htmlFor="isActive">
                  {/* ใช้ isActiveValue ที่เรา watch มาแสดงผล */}
                  {isActiveValue
                    ? t_form_labels("status_active")
                    : t_form_labels("status_inactive")}
                </Label>
              </div>
            </div>
          </form>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {t_dialog_edit("cancel_button")}
          </Button>
          <Button type="submit" form="edit-user-form" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            {t_dialog_edit("submit_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
