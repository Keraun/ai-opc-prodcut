import { registerModule } from "@/modules/registry"
import { ImageModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerImageModule() {
  registerModule({
    moduleName: "图片区块",
    moduleId: "section-image",
    component: ImageModule,
    schema,
    defaultData
  })
}

export { ImageModule }
