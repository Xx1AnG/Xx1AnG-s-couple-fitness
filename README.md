# 双人健身打卡

一个移动优先的情侣健身打卡 MVP，使用 Next.js App Router、TypeScript、Tailwind CSS、Supabase Auth/PostgreSQL，并可部署到 Vercel。

## 功能范围

- 邮箱注册和登录
- 每个用户拥有 `display_name`、唯一 `partner_code`、可选 `partner_id`
- 通过对方的邀请码双向连接伴侣
- 每人每天最多一条运动打卡，重复保存会编辑当天记录
- 首页展示本人/伴侣今日状态、本人当前连续天数、本周完成次数
- 历史页展示最近 30 天双方记录
- Supabase Row Level Security：用户只能写自己的资料和打卡，可读取已连接伴侣的资料和打卡

## Supabase 设置

1. 创建 Supabase 项目。
2. 打开迁移文件，并把其中 SQL 粘贴到 Supabase SQL Editor 执行：

   ```text
   supabase/migrations/20260522000000_initial_schema.sql
   ```

   如果使用 Supabase CLI，也可以把项目链接到远程后执行：

   ```bash
   supabase db push
   ```

3. 在 Authentication → Providers 中启用 Email。
4. 如果开启邮箱确认，在 Authentication → URL Configuration 中加入重定向地址：

   ```text
   http://localhost:3000/auth/callback
   https://your-vercel-domain.vercel.app/auth/callback
   ```

   如果你使用自定义邮件模板并通过 `token_hash` 验证，也可以额外加入 `/auth/confirm`。

5. 迁移会自动创建：

   - `profiles`
   - `workout_logs`
   - `connect_partner(code_input text)` RPC
   - 新用户资料触发器
   - RLS 策略和必要授权

## 环境变量

复制 `.env.example` 为 `.env.local`：

```bash
cp .env.example .env.local
```

填写：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

部署到 Vercel 时，把 `NEXT_PUBLIC_SITE_URL` 改成生产域名，例如：

```env
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
```

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

打开：

```text
http://localhost:3000
```

## Vercel 部署

1. 将仓库推送到 GitHub。
2. 在 Vercel 导入项目。
3. 在 Vercel Project Settings → Environment Variables 中添加：

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`

4. 部署后，把生产域名加入 Supabase Auth 的 Redirect URLs。
5. 重新部署一次，确保邮箱确认链接使用生产域名。

## 数据安全说明

数据库层使用 RLS 做硬约束：

- `profiles`：用户可读取自己和已连接伴侣，可插入自己的资料，只能更新自己的 `display_name`
- `workout_logs`：用户可读取自己和已连接伴侣，只能新增、更新、删除自己的打卡
- `workout_logs` 对 `(user_id, workout_date)` 有唯一约束，防止同一天重复打卡
- 伴侣连接通过 `connect_partner` 安全函数完成，避免为了查邀请码而开放任意用户资料读取

## 目前未包含

- 图片上传
- 邮件提醒
- 图表
- 健康 App 集成
