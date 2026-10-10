.PHONY: help install dev build typecheck pack check clean

help:
	@echo "inkstone-ui — 常用命令"
	@echo ""
	@echo "  make install     安装依赖"
	@echo "  make dev         起本地预览 http://127.0.0.1:5173"
	@echo "  make typecheck   tsc --noEmit（零错误门槛）"
	@echo "  make build       类型检查 + 生产构建"
	@echo "  make pack        打包 .tgz（npm pack）"
	@echo "  make check       typecheck + build + 打包内容检查"
	@echo "  make clean       清 dist 与构建缓存"

install:
	npm install

dev:
	npm run dev

typecheck:
	npm run typecheck

build:
	npm run build

pack:
	npm pack

check: typecheck build
	npm run pack:check

clean:
	rm -rf dist node_modules/.vite
