import { registerModule } from "@/modules/registry"
import { HeroModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerHeroModule() {
  registerModule({
    moduleName: "Hero 区块",
    moduleId: "hero",
    component: HeroModule,
    schema,
    defaultData
  })
}

export { HeroModule }
 