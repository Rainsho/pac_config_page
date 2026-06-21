# Rainsho's Nexus Manager — 完整功能清单

## 一、技术栈

| 层 | 技术 |
|---|---|
| 后端框架 | Koa.js 2.x (Node.js 10) |
| 前端框架 | React 16 + Ant Design 3 |
| 实时通信 | Socket.IO 2.x |
| 认证 | JWT (jsonwebtoken + koa-jwt) |
| 反向代理 | Nginx |
| 定时任务 | node-schedule |
| 数据持久化 | JSON 文件 (`_db.json`) |

---

## 二、后端 API

### 1. 认证模块 (`/auth`)

| 方法 | 路径 | 功能 |
|---|---|---|
| POST | `/auth` | 验证码登录，签发 JWT (7天有效期)，写入 cookie |

- JWT 中间件全局拦截，白名单：GET 请求、`/auth` 路径、局域网 IP (`192.168.*` / `10.0.*` / `::1`)

### 2. 文件系统模块 (`/fs/*`)

| 方法 | 路径 | 功能 |
|---|---|---|
| GET | `/fs/disk` | 获取 `/home` 分区磁盘使用情况 |
| GET | `/fs/file` | 递归遍历 NAS 目录，返回所有文件列表（名称、相对路径、大小） |
| PUT | `/fs/file` | 重命名文件/目录（含路径穿越防护） |
| DELETE | `/fs/file` | 删除单个文件；或 `purge=true` 时清空 NAS + 迅雷目录并重建软链接 |
| PUT | `/fs/ftpd` | 将文件从 NAS 目录拷贝到 bridge 目录（通过流式复制 + Socket.IO 推送进度） |
| GET | `/fs/queue` | 获取当前 FTP 持久化任务队列 |
| DELETE | `/fs/ftpd` | 取消正在进行的持久化任务 |
| POST | `/fs/upload` | 文件上传（formidable 解析，最大 2GB），通过 Socket.IO 实时推送上传进度 |
| POST | `/fs/dump` | 将迅雷下载目录中的文件移动到 void 目录 |

### 3. IP 追踪模块 (`/sd/*`)

| 方法 | 路径 | 功能 |
|---|---|---|
| GET | `/sd/info` | 获取 IP 变化历史记录，默认最近 20 条，`?all=true` 返回全部 |

### 4. Socket.IO 事件

| 事件名 | 方向 | 用途 |
|---|---|---|
| `upload` | Server→Client | 文件上传进度（每 2% 推送一次） |
| `progress` | Server→Client | FTP 持久化进度（每 10MB 推送一次） |
| `done` | Server→Client | FTP 持久化完成通知 |

### 5. 定时任务

| 任务 | 频率 | 功能 |
|---|---|---|
| `traceMe` | 每 30 分钟（:20 和 :50） | 通过 `v6r.ipip.net` 获取外网 IP，与最近两次记录对比，有变化则写入 `db.ips` 历史 |

---

## 三、前端页面（React SPA）

### 1. NAS 标签页

| 功能 | 描述 |
|---|---|
| 文件列表 | 表格展示文件名、路径、大小 |
| 磁盘信息 | 标题栏显示可用/总容量 |
| 文件重命名 | 弹窗输入新名称 |
| 文件删除 | 单文件删除确认弹窗 |
| 批量删除 | 勾选多行后批量删除 |
| 清空全部 | "purge" 按钮清空 NAS + 迅雷目录 |
| 文件持久化 | 单文件/批量拷贝到 bridge 目录 |
| 持久化进度 | 实时进度条 + 取消按钮 |
| 文件上传 | 拖拽上传区域（Ant Design Dragger），多文件支持 |
| 上传进度 | 实时进度条显示每个文件上传百分比 |
| 视频预览 | .mp4 文件支持弹窗播放（video.js + 快进快退插件 + 倍速播放） |
| 文件转存 | 迅雷下载目录的文件可 dump 到 void 目录 |
| 滑动删除 | 移动端触摸左滑删除 |
| 数据刷新 | "sync" 按钮手动刷新 |

### 2. DROPPY 标签页

- 通过 `<iframe>` 嵌入 Droppy 文件管理器

### 3. ARIA2 标签页

- 通过 `<iframe>` 嵌入 Aria2 WebUI

### 4. XUNLEI 标签页

- 通过 `<iframe>` 嵌入迅雷下载管理器

### 5. INFO 标签页

| 功能 | 描述 |
|---|---|
| IP 变化历史 | 列表展示每次 IP 变化的时间范围和 IP 值 |
| update 按钮 | 刷新最近 20 条 |
| flush 按钮 | 加载全部历史记录 |

---

## 四、独立 PAC 配置页 (`pac.html`)

一个纯原生 JS 的独立页面（不依赖 React），用于代理配置管理：

| 功能 | 描述 |
|---|---|
| 查看当前状态 | 显示服务器 IP、PAC 配置 IP、可用配置 URL |
| 更新 PAC 配置 | 将服务器 IP 写入 PAC 模板文件 |
| Ping 测试 | 对多个代理服务器进行延迟测试 |
| 智能切换 | 当前服务器比最优服务器慢 30% 以上时，启用切换按钮 |
| 切换服务器 | 切换到延迟更低的代理服务器 |

> **注意**：该页面引用的后端 API (`get/address`, `put/newpac`, `get/ping`, `put/config`) 已在后续提交中移除，此页面目前不可用。

---

## 五、基础设施

| 功能 | 描述 |
|---|---|
| Nginx 反向代理 | 端口 80 → 静态文件 + `/api/*` 代理到 Koa:3000 + `/nas/*` 直接 serve 文件 |
| WebSocket 代理 | Nginx 配置 Upgrade/Connection 头支持 Socket.IO |
| CORS | `@koa/cors` 允许跨域 + credentials |
| 请求日志 | 每个请求记录来源 IP、方法、URL、状态码、耗时 |
| 环境区分 | `NODE_ENV=development/production` 切换目录路径和前端 API 地址 |
| 部署脚本 | `npm run deploy` 通过 scp 将前端构建产物和密钥文件部署到 Nexus 设备 |
| 开发工具 | `supervisor` 热重载，`react-scripts` 开发服务器 (端口 3006) |

---

## 六、目录/存储设计

| 目录 | 用途 |
|---|---|
| `nas` (`/home/rainsho/nas`) | NAS 主存储，文件浏览/上传/管理的根目录 |
| `bridge` (`/mnt/modok/bridge`) | FTP 持久化目标目录（文件拷贝到这里） |
| `xunlei` (`/mnt/raind/downloads/bridge`) | 迅雷下载目录，通过软链接 `TDDOWNLOAD` 暴露在 NAS 中 |
| `raind` (`/mnt/raind/void`) | dump 操作的目标目录（从迅雷目录移出） |

---

## 七、前端已定义但后端已移除的 API（死代码）

`views/src/utils/api.js` 中仍定义了以下函数，但后端控制器已删除：

- `getPings()` → `GET /pac/ping`
- `getAriports()` → `GET /pac/v2ray`
- `flushAirports(vmess)` → `POST /pac/v2ray`
- `updateAirport(ps)` → `PUT /pac/v2ray`

这些是旧的 V2Ray/PAC 代理配置管理功能，已在提交 `bf47d02` 中移除。
