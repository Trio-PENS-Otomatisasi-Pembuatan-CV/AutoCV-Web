import type { IUiPathGateway } from "@/core/interfaces/IUiPathGateway";
import { MockUiPathGateway } from "./MockUiPathGateway";
import { LiveUiPathGateway } from "./LiveUiPathGateway";
import { validateLiveMode } from "@/infrastructure/config/validateEnv";

export function createGateway(): IUiPathGateway {
  if (process.env.NEXT_PUBLIC_UIPATH_MODE === "live") {
    validateLiveMode();
    return new LiveUiPathGateway();
  }
  return new MockUiPathGateway();
}

export const getUiPathGateway = createGateway;
