import { registerModule } from "@/modules/registry"
import { NewsDetailModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerNewsDetailModule() {
  registerModule({
    moduleName: "资讯详情",
    moduleId: "news-detail",
    component: NewsDetailModule,
    schema,
    defaultData
  })
}

export { NewsDetailModule }