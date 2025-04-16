import { SandboxController } from "@sandbox/comet-sdk";
import { fetchSandboxControllerData } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace SandboxController {
    let fetch: typeof fetchSandboxControllerData;
  }
}

SandboxController.fetch = fetchSandboxControllerData;

export { SandboxController };
