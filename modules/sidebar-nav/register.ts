import { registerModule } from "@/modules/registry"
import { SidebarNavModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerSidebarNavModule() {
  registerModule({
    moduleName: "侧边栏导航",
    moduleId: "sidebar-nav",
    component: SidebarNavModule,
    schema,
    defaultData
  })
}

export { SidebarNavModule }
