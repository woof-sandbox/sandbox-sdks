import { ConfigController } from "@woof-software/comet-sdk";
import { fetchConfigController } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace ConfigController {
    let fetch: typeof fetchConfigController;
  }
}

ConfigController.fetch = fetchConfigController;

export { ConfigController };
