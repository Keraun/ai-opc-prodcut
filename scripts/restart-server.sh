#!/bin/bash

PORT=${1:-3000}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)

cd "$PROJECT_ROOT" || exit 1

# 杀掉占用端口的进程
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
  PIDS=$(lsof -ti:"$PORT" 2>/dev/null)
  if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs -r kill -9 2>/dev/null
  fi
fi

# 等待一下确保端口释放
sleep 2

# 确定运行命令
if [ "$NODE_ENV" = "production" ]; then
  RUN_CMD="npm run start"
else
  RUN_CMD="npm run dev"
fi

# 在后台启动服务，使用新的进程组
nohup bash -c "cd \"$PROJECT_ROOT\" && $RUN_CMD" >/dev/null 2>&1 < /dev/null &
SERVER_PID=$!

echo $SERVER_PID
