import { IUiPathGateway } from "@/core/interfaces/IUiPathGateway";
import { MockUiPathGateway } from "./MockUiPathGateway";
import { LiveUiPathGateway } from "./LiveUiPathGateway";

export function createGateway(): IUiPathGateway {
  return process.env.NEXT_PUBLIC_UIPATH_MODE === "live"
    ? new LiveUiPathGateway()
    : new MockUiPathGateway();
}

export const getUiPathGateway = createGateway;
