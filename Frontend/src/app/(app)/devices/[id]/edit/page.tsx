"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import DeviceForm from "@/components/DeviceForm";
import { useStore } from "@/lib/store";

export default function EditDevicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { devices, loading } = useStore();
  const device = devices.find((d) => d.id === Number(id));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (!device) return notFound();

  return (
    <div>
      <PageHeader title="Edit device" subtitle={device.name} />
      <DeviceForm device={device} />
    </div>
  );
}
