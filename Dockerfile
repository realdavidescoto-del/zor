FROM oven/bun:alpine AS builder
WORKDIR /app
COPY . .
RUN bun install
RUN bun run --filter zor-code compile

FROM alpine:latest
RUN apk add --no-cache libstdc++
COPY --from=builder /app/packages/zor-code/dist/zor-code.exe /usr/local/bin/zor-code
ENTRYPOINT ["zor-code"]
