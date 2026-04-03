import { NextRequest } from "next/server"
import { successResponse, errorResponse, checkAdminAuth } from "@/lib/api-utils"
import { SystemConfigRepository } from "@/lib/repositories/SystemConfigRepository"

const repository = new SystemConfigRepository()

const MODEL_CONFIG: Record<string, { baseUrl?: string; modelId: string }> = {
  "deepseek-ai/DeepSeek-V2.5": { modelId: "deepseek-ai/DeepSeek-V2.5" },
  "Qwen/Qwen2.5-72B-Instruct": { modelId: "Qwen/Qwen2.5-72B-Instruct" },
  "Qwen/Qwen2.5-32B-Instruct": { modelId: "Qwen/Qwen2.5-32B-Instruct" },
  "Qwen/Qwen2.5-14B-Instruct": { modelId: "Qwen/Qwen2.5-14B-Instruct" },
  "Qwen/Qwen2.5-7B-Instruct": { modelId: "Qwen/Qwen2.5-7B-Instruct" },
  "gpt-4o": { modelId: "gpt-4o" },
  "gpt-4o-mini": { modelId: "gpt-4o-mini" },
  "claude-3-5-sonnet": { modelId: "claude-3-5-sonnet-20241022" },
  "glm-4": { modelId: "glm-4" },
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await checkAdminAuth()
    if (!authResult.isAuthenticated) {
      return errorResponse("未授权", 401)
    }

    const body = await request.json()
    const { model, prompt } = body

    if (!prompt) {
      return errorResponse("缺少提示词参数")
    }

    const config = repository.getValue("geo_config", {
      apiKey: "",
      baseUrl: "https://api.siliconflow.cn/v1",
      defaultModel: "deepseek-ai/DeepSeek-V2.5",
    })

    if (!config.apiKey) {
      return errorResponse("请先配置API密钥", 400)
    }

    const modelToUse = model || config.defaultModel
    const modelConfig = MODEL_CONFIG[modelToUse] || { modelId: modelToUse }
    const baseUrl = config.baseUrl || "https://api.siliconflow.cn/v1"

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(`${baseUrl}/chat/completions`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
              model: modelConfig.modelId,
              messages: [
                {
                  role: "system",
                  content:
                    "你是一位专业的GEO（生成引擎优化）内容创作专家。你的任务是根据用户提供的企业信息，生成高捕获率的深度文章。文章需要针对大模型抓取优化，同时保持人类可读性。",
                },
                {
                  role: "user",
                  content: prompt,
                },
              ],
              stream: true,
              stream_options: { include_usage: true },
              temperature: 0.7,
              max_tokens: 4096,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            const errorMessage = errorData.error?.message || `API请求失败: ${response.status}`
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
            )
            controller.close()
            return
          }

          const reader = response.body?.getReader()
          if (!reader) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: "无法读取响应流" })}\n\n`)
            )
            controller.close()
            return
          }

          const decoder = new TextDecoder()

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
                  continue
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content || ""
                  if (content) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
                    )
                  }
                  if (parsed.usage) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({
                          usage: {
                            prompt_tokens: parsed.usage.prompt_tokens || 0,
                            completion_tokens: parsed.usage.completion_tokens || 0,
                            total_tokens: parsed.usage.total_tokens || 0,
                          },
                        })}\n\n`
                      )
                    )
                  }
                } catch (e) {
                  // 忽略解析错误
                }
              }
            }
          }

          controller.close()
        } catch (error) {
          console.error("Stream error:", error)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: (error as Error).message || "生成失败" })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("文章生成错误:", error)
    return errorResponse("生成失败: " + (error as Error).message)
  }
}
