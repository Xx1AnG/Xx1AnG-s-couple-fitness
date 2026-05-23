# 双人健身打卡

一个移动优先的情侣健身打卡 MVP，使用 Next.js App Router、TypeScript、Tailwind CSS、Supabase Auth/PostgreSQL/Storage，并可部署到 Vercel 或 EdgeOne Pages。

## 功能范围

- 邮箱注册和登录
- 每个用户拥有 `display_name`、唯一 `partner_code`、可选 `partner_id`
- 通过对方的邀请码双向连接伴侣
- 每人每天最多一条运动打卡，重复保存会编辑当天记录
- 打卡包含运动日期、运动类型、强度、时长、备注和可选训练照片
- 强度积分：轻量 1 分，标准 2 分，挑战 3 分
- 首页展示双方今日状态、当前连续、最长连续、共同连续和本周积分
- 历史页展示月历，可切换月份，点击日期查看双方当天详情
- 设置页可保存 `reminder_time`，为后续提醒功能预留
- Supabase Row Level Security：用户只能写自己的资料和打卡，可读取已连接伴侣的资料和打卡

## Supabase 设置

1. 创建 Supabase 项目。
2. 打开 Supabase SQL Editor，按顺序执行迁移文件：

   ```text
   supabase/migrations/20260522000000_initial_schema.sql
   supabase/migrations/20260523000000_feature_upgrade.sql
   ```

   如果你的项目之前已经执行过第一份初始迁移，只需要再执行第二份升级迁移。

   如果使用 Supabase CLI，也可以把项目链接到远程后执行：

   ```bash
   supabase db push
   ```

3. 在 Authentication → Providers 中启用 Email。
4. 如果开启邮箱确认，在 Authentication → URL Configuration 中加入重定向地址：

   ```text
   http://localhost:3000/auth/callback
   https://your-production-domain/auth/callback
   ```

5. 迁移会自动创建：

   - `profiles`
   - `workout_logs`
   - `workout-images` Supabase Storage bucket
   - `connect_partner(code_input text)` RPC
   - 新用户资料触发器
   - 数据表和图片对象的 RLS 策略

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

部署时，把 `NEXT_PUBLIC_SITE_URL` 改成真实生产域名，例如：

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

临时预览链接不适合长期作为 `NEXT_PUBLIC_SITE_URL`，因为邮箱回调和登录跳转需要稳定域名。

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

## 部署

### Vercel

1. 将仓库推送到 GitHub。
2. 在 Vercel 导入项目。
3. 在 Vercel Project Settings → Environment Variables 中添加：

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL`

4. 部署后，把生产域名加入 Supabase Auth 的 Redirect URLs。
5. 重新部署一次，确保邮箱确认链接使用生产域名。

### EdgeOne Pages

推荐配置：

```text
框架预设：Next
根目录：./
构建命令：npm run build
安装命令：npm install
输出目录：按平台默认值，通常不需要手动改
```

环境变量同 Vercel。EdgeOne 的临时 `edgeone.cool?eo_token=...` 链接通常只适合预览测试，长期访问建议绑定自定义域名。

## 图片上传

- 使用 Supabase Storage bucket：`workout-images`
- Bucket 为私有，不公开访问
- 图片路径按用户隔离：`{user_id}/{workout_date}.{ext}`
- 只允许 jpg、png、webp
- 最大 5MB
- 页面展示时通过 Supabase signed URL 临时读取

## 数据安全说明

数据库层使用 RLS 做硬约束：

- `profiles`：用户可读取自己和已连接伴侣，可插入自己的资料，只能更新自己的 `display_name` 和 `reminder_time`
- `workout_logs`：用户可读取自己和已连接伴侣，只能新增、更新、删除自己的打卡
- `workout_logs` 对 `(user_id, workout_date)` 有唯一约束，防止同一天重复打卡
- `workout-images`：用户只能上传、更新、删除自己目录下的图片，可读取自己和已连接伴侣的图片
- 伴侣连接通过 `connect_partner` 安全函数完成，避免为了查邀请码而开放任意用户资料读取

## 目前未包含

- 邮件或推送提醒发送
- 图表
- 健康 App 集成
