import { ConfigController } from "@woof-software/comet-sdk";
import { fetchConfigControllerData } from "../fetch";

declare module "@woof-software/comet-sdk" {
  namespace ConfigController {
    let fetch: typeof fetchConfigControllerData;
  }
}

ConfigController.fetch = fetchConfigControllerData;

export { ConfigController };
