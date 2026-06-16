"use client";

import PageHeader from "@/components/PageHeader";
import DeviceForm from "@/components/DeviceForm";

export default function NewDevicePage() {
  return (
    <div>
      <PageHeader title="Add device" subtitle="Connect a new device to a relay slot" />
      <DeviceForm />
    </div>
  );
}
