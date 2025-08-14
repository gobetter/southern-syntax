"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  type SubmitHandler,
  Controller,
  type FieldErrors,
} from "react-hook-form";

import type { UserCreateInput } from "@southern-syntax/schemas/user";

import {
  Button,
  Label,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@southern-syntax/ui";

import Spinner from "@/components/common/Spinner";
import { useAddUserForm } from "@/hooks/useAddUserForm";
import FormFieldError from "@/components/common/FormFieldError";

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChangeAction: (open: boolean) => void;
}

export default function AddUserDialog({
  isOpen,
  onOpenChangeAction,
}: AddUserDialogProps) {
  const t_form_labels = useTranslations("common.form_labels");
  const t_dialog_add = useTranslations("admin_users.dialog_add");

  const [activeTab, setActiveTab] = useState("en");

  const {
    register,
    handleSubmit,
    control,
    reset,
    errors,
    onSubmit,
    roleOptions,
    isLoading,
  } = useAddUserForm({
    onOpenChangeAction,
  });

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset(); // เมื่อ dialog กำลังจะปิด ให้ reset ฟอร์ม
      setActiveTab("en"); // Reset กลับไปแท็บแรกเมื่อปิด
    }
    onOpenChangeAction(open);
  };

  // สร้างฟังก์ชัน onError เพื่อบังคับเปิดแท็บ
  const onError: SubmitHandler<FieldErrors<UserCreateInput>> = (formErrors) => {
    // ถ้ามี error ที่ name.en ให้บังคับเปิดแท็บ 'en'
    if (formErrors.name?.en) {
      setActiveTab("en");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>{t_dialog_add("title")}</DialogTitle>
          <DialogDescription>{t_dialog_add("description")}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="th">ภาษาไทย</TabsTrigger>
          </TabsList>

          <form
            id="add-user-form"
            onSubmit={handleSubmit(onSubmit, onError)}
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
                    />
                  )}
                />
                <Label htmlFor="isActive">
                  {t_form_labels("status_active")}
                </Label>
              </div>
            </div>
          </form>
        </Tabs>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChangeAction(false)}
          >
            {t_dialog_add("cancel_button")}
          </Button>
          <Button type="submit" form="add-user-form" disabled={isLoading}>
            {isLoading && <Spinner className="mr-2 h-4 w-4" />}
            {t_dialog_add("submit_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
