import * as React from "react";
import { Can as UiCan, CanProps } from "@/components/permissions/Can";

export function Can(props: CanProps) {
  return <UiCan {...props} />;
}
