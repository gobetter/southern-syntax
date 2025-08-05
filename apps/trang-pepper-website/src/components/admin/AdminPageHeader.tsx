import React from 'react';

interface AdminPageHeaderProps {
  title: string;
  actionButton?: React.ReactNode;
}

export default function AdminPageHeader({ title, actionButton }: AdminPageHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h1 className="text-3xl font-bold">{title}</h1>
      {actionButton && <div>{actionButton}</div>}
    </div>
  );
}
