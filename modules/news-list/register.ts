import { registerModule } from "@/modules/registry"
import { NewsListModule } from "./index"
import schema from "./schema.json"
import defaultData from "./default.json"

export function registerNewsListModule() {
  registerModule({
    moduleName: "新闻列表",
    moduleId: "news-list",
    component: NewsListModule,
    schema,
    defaultData
  })
}

export { NewsListModule }