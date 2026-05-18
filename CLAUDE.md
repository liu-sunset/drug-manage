# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 常用命令

```bash
npm run dev       # 启动开发服务器 (Vite 热更新)
npm run build     # TypeScript 类型检查 + Vite 生产构建
npm run preview   # 预览生产构建
npm run lint      # ESLint 检查（注意：项目根目录无 eslint 配置文件，此命令依赖 IDE 级配置）
```

安装依赖时如遇网络问题，先设置代理：
```bash
export HTTP_PROXY="http://127.0.0.1:6984"
export HTTPS_PROXY="http://127.0.0.1:6984"
```

## 技术栈

- **前端**: React 19 + TypeScript + Vite 6
- **UI 原语**: `@base-ui/react`（Dialog、Button、Input、AlertDialog 等的底层）
- **样式**: Tailwind CSS 3 + CSS 变量，**Hand-Drawn 手绘风格**
- **图标**: lucide-react（`strokeWidth={2.5}` 全局统一）
- **Toast**: sonner
- **后端/数据库**: Supabase（Auth + PostgreSQL + RLS + Edge Functions）
- **邮件**: Resend（通过 Supabase Edge Function 发送）
- **部署**: Netlify（SPA）

### Vite 分包策略

`vite.config.ts` 中通过 `manualChunks` 将大型 vendor 库拆分为独立 chunk，优化缓存和并行加载：

- `vendor-react`: react / react-dom / react-router-dom
- `vendor-supabase`: @supabase/supabase-js
- `vendor-baseui`: @base-ui/react

修改依赖后需验证分包效果：`npm run build` 检查 chunk 大小是否合理。

## 设计系统：Hand-Drawn 手绘风格

### 字体

通过 Google Fonts 在 `index.html` 中引入：
- **标题**: Kalam (wght 700) — 粗马克笔风格，全局用于 `h1`-`h6`
- **正文**: Patrick Hand (wght 400) — 手写风格，设为 body 默认字体
- Tailwind 别名：`font-heading` / `font-body`

### 颜色

| Token | 值 | 说明 |
|-------|-----|------|
| `background` | `#fdfbf7` | 暖纸白（CS​S 变量 `--background: 46 33% 96%`） |
| `foreground` | `#2d2d2d` | 软铅笔黑 |
| `primary` / `marker` | `#ff4d4d` | 红色马克笔 |
| `accent` / `ballpoint` | `#2d5da1` | 蓝色圆珠笔 |
| `muted` / `secondary` | `#e5e0d8` | 旧纸 / 橡皮擦痕 |
| `postit` | `#fff9c4` | 便签黄（预警状态、预览框） |

Tailwind 自定义色名：`bg-marker`、`text-pencil`、`border-pencil`、`bg-ballpoint`、`bg-postit`。这些语义色名是 **推荐风格**，优先于通用的 primary/accent。

### 圆角：不规则 Wobbly Border

**绝对不要**使用标准 `rounded-*` 类（`rounded-lg` 等已在 Tailwind 中被设为 0px）。

所有容器、按钮、输入框都必须使用 **inline style** 的不规则 border-radius：

```tsx
style={{ borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px" }}
```

项目中定义了四个 CSS 变量作为预设（`--radius-wobbly`、`--radius-wobbly-sm/md/lg`），可通过 Tailwind utility `rounded-wobbly` / `rounded-wobbly-sm` 等使用，但组件内部更常用 inline style 以便微调。

### 阴影：硬偏移无模糊

禁止使用带 blur 的阴影。所有阴影为硬偏移：

```css
/* Tailwind utilities */
shadow-hard      /* 4px 4px 0px 0px #2d2d2d */
shadow-hard-sm   /* 2px 2px 0px 0px #2d2d2d */
shadow-hard-lg   /* 6px 6px 0px 0px #2d2d2d */
```

### 背景纹理

`body` 使用 22px 间距的点阵网格模拟纸张纹理：
```css
background-image: radial-gradient(#d4cec4 1px, transparent 1px);
background-size: 22px 22px;
```

### 按钮交互

- **默认**: 白底 + `border-[3px] border-pencil` + `shadow-hard`
- **Hover**: 填满 marker 红色、文字变白、阴影缩为 `shadow-hard-sm`、`translate-x-[2px] translate-y-[2px]`
- **Active**: 阴影消失 + `translate-x-[4px] translate-y-[4px]`（"按平"效果）
- **variant=outline**: hover 变蓝 ballpoint
- **variant=ghost**: 无边框无阴影，hover 出 muted 底

### 装饰元素

- **卡片纸胶带**: `absolute -top-2 left-1/2 -translate-x-1/2` + 半透明 muted 背景 + `rotate-[2deg]`
- **页面卡片**: 微小旋转（`rotate-[-0.3deg]`）打破对齐
- **EmptyState**: SVG 手绘虚线箭头指向 CTA 区域

## 项目架构

### 认证流程

1. `AuthProvider` (src/contexts/AuthContext.tsx) 是整个认证状态树的根节点，挂载时调用 `supabase.auth.getSession()` 恢复 session，并监听 `onAuthStateChange`。Context value 通过 `useMemo` 稳定引用，所有方法通过 `useCallback` 包裹
2. 登录后从 `profiles` 表加载用户 profile
3. `ProtectedRoute` 有三态守卫：
   - 无 session → 重定向 `/login`
   - 有 session 无 profile → 重定向 `/set-username`（注册后必须设置用户名）
   - 有 session 有 profile → 放行
4. 新用户注册后 Supabase Auth 自动创建 `auth.users` 行，数据库 trigger 自动创建默认 profiles 行（username=`user_XXXXXXXX`），前端 `/set-username` 页面调用 `setUsername()` 更新用户名
5. `LoginPage` 和 `RegisterPage` 通过 `useEffect` 监听 `user` + `profile`，已登录用户自动跳转 `/`
6. `AuthContext` 中的 `mapAuthError()` 将 Supabase 英文错误映射为中文（"邮箱或密码错误"、"邮箱未验证"、"该邮箱已被注册"等），`signIn`/`signUp`/`setUsername` 均经其转换
7. Auth 页面中：字段级校验（空值、格式）使用内联 error div；API 层错误（Supabase 返回）统一用 `toast.error()` 以手绘风格 toast 展示

### 路由结构

```
/login          → LoginPage（公开，无 Header）
/register       → RegisterPage（公开，无 Header）
/set-username   → SetUsernamePage（需登录，无 Header，无 profile 时强制）
/               → AppLayout > DashboardPage（需登录 + 有 profile，含 Header）
*               → NotFoundPage
```

`AppLayout` 提供顶部导航 + `<Outlet />` 内容区。`/set-username` 在 `ProtectedRoute` 内但不在 `AppLayout` 内，所以没有 Header。

### 布局策略（全宽）

- `AppLayout` main 区域: `px-4 sm:px-6 lg:px-8`，无 max-width 限制
- DashboardPage 内部: `max-w-7xl mx-auto`
- 药品卡片: 移动端单列，`sm:grid-cols-2 lg:grid-cols-3` 响应式网格

### 数据流

- `useAuth()` hook 提供 `{ user, profile, loading, session, signIn, signUp, signOut, refreshProfile, setUsername, deleteAccount }`
- `useDrugs()` hook 从 `useAuth()` 获取 `user.id`，封装 drugs 表的 CRUD，每次操作后自动 `fetchDrugs()`。返回 `{ drugs, loading, error, fetchDrugs, addDrug, updateDrug, deleteDrug }`
- `expiry_date` 在客户端计算（`production_date + shelf_life_days`），写入时直接存入数据库，不做服务端计算
- 过期状态判定（`getExpiryStatus`）：expired(<0天) | urgent(≤7天) | warning(≤30天) | safe(>30天)

### 数据库设计

两张业务表，均启用 RLS：

- **profiles**: `id` (PK, FK→auth.users), `username` (UNIQUE), `created_at`, `updated_at`
- **drugs**: `id` (PK), `user_id` (FK→auth.users), `name`, `production_date`, `shelf_life_days`, `expiry_date`, `reminder_sent`, `created_at`, `updated_at`

RLS 策略确保用户只能读写自己的数据：profiles 按 `auth.uid() = id`，drugs 按 `auth.uid() = user_id`。前端不需要手动传 user_id 做权限校验——Supabase 在数据库层自动执行。

迁移文件: `supabase/migrations/001_initial_schema.sql`

### Edge Function：过期邮件提醒

`supabase/functions/send-expiry-reminders/index.ts` (Deno)：
- 查询 `expiry_date >= today AND expiry_date <= today+7天 AND reminder_sent = FALSE` 的药物（7 天范围内，而非精确匹配一天）
- 分步查询：先查 drugs，再分别查 profiles 和 auth.users 构建 Map 做 O(1) 查找。**不能使用 PostgREST 嵌入式资源语法**（如 `profiles!inner`），因为 `drugs.user_id` 的 FK 指向 `auth.users` 而非 `profiles`，不存在直接外键关系
- 逐条通过 Resend API 发送中文提醒邮件，邮件中动态显示剩余天数（「仅剩 3 天」/「已过期」）
- 发送成功后设置 `reminder_sent = TRUE`（同一药物只提醒一次）

需要的 Edge Function secrets（通过 `supabase secrets set` 配置）：
- `RESEND_API_KEY` — Resend API key
- `SB_URL` — Supabase 项目 URL
- `SB_SERVICE_ROLE_KEY` — Supabase service_role key（用于读取 auth.users 表获取邮箱）
- `SENDER_EMAIL`（可选，默认 `noreply@resend.dev`）

Supabase 不允许 secret 名称以 `SUPABASE_` 开头，使用 `SB_` 前缀。

部署：`supabase functions deploy send-expiry-reminders`

### Edge Function：账户注销

`supabase/functions/delete-account/index.ts` (Deno)：
- 接收用户 JWT（Authorization: Bearer），通过 `supabase.auth.getUser(token)` 验证身份
- 调用 `supabase.auth.admin.deleteUser(user.id)` 删除 auth user
- `ON DELETE CASCADE` 自动清理 profiles 和 drugs 表
- 前端无法直接调用 `admin.deleteUser()`（需要 service_role key），必须通过此 Edge Function
- 前端 `AuthContext.deleteAccount()` 用当前 session 的 access_token 调用此 Function，成功后手动清除本地 state

需要的 secrets（与 `send-expiry-reminders` 共用）：
- `SB_URL` — Supabase 项目 URL
- `SB_SERVICE_ROLE_KEY` — Supabase service_role key

部署：`supabase functions deploy delete-account`

### 定时触发：GitHub Actions

pg_cron 需要 Supabase Pro 计划（免费计划不可用），本项目使用 GitHub Actions 替代。

`.github/workflows/send-expiry-reminders.yml`：
- 每天 **北京时间 9:20**（UTC 1:20）自动调用 Edge Function
- 支持 `workflow_dispatch` 手动触发（在 GitHub Actions 页面操作）
- 通过 curl POST 调用 Edge Function，Authorization header 携带 anon key
- 需在 GitHub 仓库 Settings → Secrets and variables → Actions 中配置两个 secrets：
  - `SUPABASE_URL` — Supabase 项目 URL（与 `.env` 中 `VITE_SUPABASE_URL` 相同）
  - `SUPABASE_ANON_KEY` — Supabase 匿名 key（与 `.env` 中 `VITE_SUPABASE_ANON_KEY` 相同）

### 环境变量

`.env` 中需要两个变量（参考 `.env.example`）：
- `VITE_SUPABASE_URL` — Supabase 项目 URL
- `VITE_SUPABASE_ANON_KEY` — Supabase 匿名 key

## 关键约定

- **路径别名**: `@/` 映射到 `src/`
- **日期格式**: 展示用 `YYYY年MM月DD日`，存储用 `YYYY-MM-DD`
- **UI 语言**: 全部中文
- **svg icon**: 统一使用 `strokeWidth={2.5}`
- **`rounded-*` 为零**: Tailwind 的 `rounded-lg/md/sm` 全被设为 0px，必须使用 wobbly border-radius
- **不使用 `shadow-*` 标准类**: 用 `shadow-hard` / `shadow-hard-sm` / `shadow-hard-lg`

## 性能优化约定

以下模式已在项目中建立，新增代码应遵循：

### 路由级代码分割

所有页面组件通过 `React.lazy()` + `Suspense` 懒加载（见 `src/App.tsx`）。新增页面时同样处理，不要直接 import。

### 组件 memo 化

- **列表渲染组件**（如 DrugCard）必须用 `memo()` 包裹，配合 `useCallback` 稳定回调
- **纯静态组件**（如 LoadingSkeleton、EmptyState）用 `memo()` 包裹，避免跟随父组件无意义重渲染
- **低频更新组件**（如 AppHeader，仅依赖 auth 状态）用 `memo()` 包裹

### 回调稳定性

- 传给 memo 组件的回调 props 必须用 `useCallback` 包裹，否则 memo 失效
- Context value 用 `useMemo` 包裹，内部方法用 `useCallback` 包裹（见 `AuthContext.tsx`）

### 静态 JSX 提升

不依赖 props/state 的 JSX 片段提升到组件外部作为模块级常量，避免每次渲染重新创建：

```tsx
const staticSvg = <svg>...</svg>

function MyComponent() {
  return <div>{staticSvg}</div>
}
```

### Dialog 组件懒加载

仅在用户交互时才需要的 Dialog 组件（如 EditDrugDialog、DeleteDrugConfirm），用 `lazy()` 按需加载：

```tsx
const EditDrugDialog = lazy(() => import("@/components/EditDrugDialog").then(m => ({ default: m.EditDrugDialog })))
```

## Supabase Auth 防坑要点

1. **`onAuthStateChange` 回调不能用 `async/await`**。Supabase GoTrue 在 `signInWithPassword` 成功后可能同步等待所有监听器完成，如果回调中 `await` 了一个超时的网络请求（如 `fetchProfile`），整个登录流程会被永久阻塞。用 `.then()` 替代，让回调立即返回。

2. **`getSession()` 不是纯本地操作，必须加超时保底**。它会发起网络请求验证 token，在 Supabase free tier 休眠或网络不通时 Promise 可能永久不 resolve。用 `setTimeout`（8 秒）+ `cancelled` 标志位兜底，防止页面无限 loading。`cancelled` 标志很重要：React Strict Mode 下组件会 double-mount，清理函数需要阻止已卸载 effect 的 setState。

3. **依赖 `user` 时用 `user?.id` 而非 `user` 对象**。`onAuthStateChange` 每次事件都创建新的 `session.user` 引用（即使是同一个用户），导致 `useCallback` 重建和重复请求。同时过滤掉 `TOKEN_REFRESHED` 和 `INITIAL_SESSION` 事件——前者只续期 token 不改变身份，后者已被 `getSession()` 处理过。

4. **`signUp` 对已注册邮箱不报错**。Supabase 为防止邮箱枚举攻击，`signUp()` 对已注册邮箱仍返回成功，但 `data.user.identities` 为空数组 `[]`。在 `AuthContext.signUp` 中需专门检查 `data.user?.identities?.length === 0` 来判断「该邮箱已被注册」。
