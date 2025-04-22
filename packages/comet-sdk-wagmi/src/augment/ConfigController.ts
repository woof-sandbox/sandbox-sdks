import { ConfigController } from "@sandbox/comet-sdk";
import { fetchConfigControllerData } from "../fetch";

declare module "@sandbox/comet-sdk" {
  namespace ConfigController {
    let fetch: typeof fetchConfigControllerData;
  }
}

ConfigController.fetch = fetchConfigControllerData;

export { ConfigController };
