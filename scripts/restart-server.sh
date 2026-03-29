#!/bin/bash

PORT=${1:-3000}
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
LOG_FILE="$PROJECT_ROOT/restart-server.log"

cd "$PROJECT_ROOT" || exit 1

echo "========================================" > "$LOG_FILE"
echo "[$(date)] 开始重启服务" >> "$LOG_FILE"
echo "端口: $PORT" >> "$LOG_FILE"
echo "项目根目录: $PROJECT_ROOT" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# 杀掉占用端口的进程
echo "[$(date)] 正在查找占用端口 $PORT 的进程..." >> "$LOG_FILE"
if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
  PIDS=$(lsof -ti:"$PORT" 2>/dev/null)
  if [ -n "$PIDS" ]; then
    echo "[$(date)] 发现进程: $PIDS" >> "$LOG_FILE"
    echo "$PIDS" | xargs -r kill -9 2>>"$LOG_FILE"
    echo "[$(date)] 已终止进程" >> "$LOG_FILE"
  else
    echo "[$(date)] 没有发现占用端口 $PORT 的进程" >> "$LOG_FILE"
  fi
fi

# 等待一下确保端口释放
echo "[$(date)] 等待端口释放..." >> "$LOG_FILE"
sleep 2

# 确定运行命令
if [ "$NODE_ENV" = "production" ]; then
  RUN_CMD="npm run start"
else
  RUN_CMD="npm run dev"
fi

echo "[$(date)] 准备启动服务: $RUN_CMD" >> "$LOG_FILE"

# 在后台启动服务，使用新的进程组
nohup bash -c "cd \"$PROJECT_ROOT\" && $RUN_CMD" >> "$LOG_FILE" 2>&1 < /dev/null &
SERVER_PID=$!

echo "[$(date)] 服务已启动，PID: $SERVER_PID" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo $SERVER_PID
