import { SandboxController } from "@woof-software/comet-sdk";
import { fetchSandboxController } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace SandboxController {
    let fetch: typeof fetchSandboxController;
  }
}

SandboxController.fetch = fetchSandboxController;

export { SandboxController };
