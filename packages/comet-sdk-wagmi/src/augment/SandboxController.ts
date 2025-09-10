import { SandboxController } from "@woof-software/comet-sdk";
import { fetchSandboxControllerData } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace SandboxController {
    let fetch: typeof fetchSandboxControllerData;
  }
}

SandboxController.fetch = fetchSandboxControllerData;

export { SandboxController };
