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
  const { devices } = useStore();
  const device = devices.find((d) => d.id === Number(id));

  if (!device) return notFound();

  return (
    <div>
      <PageHeader title="Edit device" subtitle={device.name} />
      <DeviceForm device={device} />
    </div>
  );
}
