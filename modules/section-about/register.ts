import { registerModule } from "@/modules/registry"
import { AboutModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerAboutModule() {
  registerModule({
    moduleName: "关于我们区块",
    moduleId: "section-about",
    component: AboutModule,
    schema,
    defaultData
  })
}

export { AboutModule }
