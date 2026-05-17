# 药物管理

追踪药物保质期的 Web 应用，支持过期提醒邮件通知。采用**手绘风格**设计系统。

## 功能

- 药物 CRUD — 添加、编辑、删除药物，记录生产日期与保质期
- 过期状态可视化 — expired / urgent / warning / safe 四色标记
- 邮件提醒 — 到期前 7 天自动发送提醒（Supabase Edge Function + Resend）
- 用户认证 — 邮箱注册/登录（Supabase Auth）
- 路由守卫 — 未登录重定向、新用户强制设置用户名
- 响应式布局 — 移动端/平板/桌面端适配

## 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 3 + CSS 变量（手绘风格） |
| UI 原语 | @base-ui/react（Dialog、Button、Input 等） |
| 图标 | lucide-react |
| 路由 | react-router-dom v7 |
| Toast | sonner |
| 后端/数据库 | Supabase（Auth + PostgreSQL + RLS） |
| 邮件 | Resend（通过 Supabase Edge Function 发送） |
| 部署 | Netlify |

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── ui/              # 基础 UI 组件（Button、Input、Dialog 等）
│   ├── AppHeader.tsx    # 顶部导航栏
│   ├── AppLayout.tsx    # 应用布局容器
│   ├── ProtectedRoute.tsx  # 路由守卫
│   ├── DrugCard.tsx     # 药物卡片
│   ├── AddDrugDialog.tsx   # 添加药物弹窗
│   ├── EditDrugDialog.tsx  # 编辑药物弹窗
│   ├── DeleteDrugConfirm.tsx  # 删除确认弹窗
│   ├── EmptyState.tsx   # 空状态占位
│   ├── ErrorState.tsx   # 错误状态
│   └── LoadingSkeleton.tsx # 骨架屏加载
├── contexts/
│   └── AuthContext.tsx   # 认证上下文（session、profile、signIn/Up/Out）
├── hooks/
│   ├── useAuth.ts       # 认证 hook
│   └── useDrugs.ts      # 药品 CRUD hook
├── lib/
│   ├── supabase.ts      # Supabase 客户端
│   └── utils.ts         # 工具函数（日期计算、过期判定）
├── pages/
│   ├── LoginPage.tsx    # 登录页
│   ├── RegisterPage.tsx # 注册页
│   ├── SetUsernamePage.tsx  # 设置用户名
│   ├── DashboardPage.tsx    # 控制台/药品列表
│   └── NotFoundPage.tsx # 404 页面
├── types/
│   └── index.ts         # TypeScript 类型定义
├── App.tsx              # 路由配置
└── main.tsx             # 入口
supabase/
├── migrations/
│   └── 001_initial_schema.sql  # 数据库初始化（表、RLS、触发器）
└── functions/
    └── send-expiry-reminders/  # 过期提醒邮件 Edge Function
```

## 快速开始

### 前提条件

- Node.js >= 18
- Supabase 项目（[免费创建](https://supabase.com)）
- Resend API Key（用于邮件提醒功能）

### 本地运行

```bash
# 1. 克隆项目
git clone <your-repo-url> && cd drug-manage

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env，填入你的 Supabase URL 和 ANON_KEY

# 4. 启动开发服务器
npm run dev
```

### 环境变量

```env
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 数据库设置

### 运行迁移

在 Supabase 的 SQL Editor 中执行 `supabase/migrations/001_initial_schema.sql`，或者通过 Supabase CLI：

```bash
supabase db push
```

该迁移包含：
- `profiles` 表 — 用户资料，关联 `auth.users`
- `drugs` 表 — 药物数据，含 `user_id` 外键
- RLS 策略 — 用户只能读写自己的数据
- 自动触发器 — 新用户注册时自动创建 profile、自动更新 `updated_at`

### Edge Function 部署

```bash
supabase secrets set RESEND_API_KEY=your_key SB_URL=your_url SB_SERVICE_ROLE_KEY=your_key
supabase functions deploy send-expiry-reminders
```

建议配置 pg_cron 每天定时调用此 Edge Function：

```sql
SELECT cron.schedule('send-expiry-reminders', '0 8 * * *', $$
  SELECT net.http_post(url:='https://your-project.supabase.co/functions/v1/send-expiry-reminders')
$$);
```

## 部署到 Netlify

### 环境变量

在 Netlify 项目设置中添加：

| 变量名 | 说明 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 项目 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 匿名密钥 |

### 构建配置

项目根目录的 `netlify.toml` 已配置好构建命令和 SPA 重定向规则，无需额外操作。

### 步骤

1. 将项目推送到 GitHub
2. 在 Netlify 中选择 "Import from Git"
3. 选择仓库，Netlify 会自动识别 `netlify.toml`
4. 在 Site settings → Environment variables 中添加上述两个变量
5. 触发部署

## 设计系统

本项目采用**手绘风格**设计，主要特征：

- **不规则圆角** — 所有容器使用 wobbly border-radius，不使用标准 `rounded-*`
- **硬偏移阴影** — `shadow-hard` 无模糊，呈现纸张叠放感
- **手写字体** — 标题 Kalam、正文 Patrick Hand（Google Fonts）
- **纸张纹理** — 背景使用点阵网格模拟纸张质感
- **纸胶带装饰** — 卡片顶部模拟和纸胶带效果
- **按钮交互** — hover 时填色+下移，active 时"按平"消失阴影

## 许可证

MIT
