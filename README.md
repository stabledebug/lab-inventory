# 课题组耗材管理（网页版 App）

独立的网页应用，无需后端、无需微信。入库/出库记录、金额（人民币/美元）、导出/导入 CSV。

## 本地使用
- 电脑：双击 index.html 用 Chrome / Edge 打开
- 或起本地服务：
ode server.js 后访问 http://127.0.0.1:8123
- 手机：把 index.html 传到手机用浏览器打开；或部署后「添加到主屏幕」变 App 图标

## 数据存储
浏览器本地 localStorage，不上传服务器。换浏览器/清缓存会丢失，用「导入导出」定期备份 CSV。

## 部署（让课题组其他人也能访问）
### 方式一：GitHub Pages（免费、稳定，推荐）
1. 安装 GitHub CLI：winget install GitHub.cli，然后 gh auth login（浏览器扫码授权）
2. 在项目目录执行：
   git init
   git add -A
   git commit -m "init"
   gh repo create lab-inventory --public
   git branch -M main
   git push -u origin main
3. 仓库 Settings → Pages → Source 选 main / (root) → 保存
4. 访问 https://<你的用户名>.github.io/lab-inventory/，手机打开后可「添加到主屏幕」

### 方式二：Vercel（免费、自动 HTTPS）
1. 
pm i -g vercel 后 ercel login
2. 项目目录执行 ercel（按提示选择，框架选 Other / Static）
3. 得到 https://xxx.vercel.app 域名

## CSV 导入导出
- 导出：统计页「导出表格」下载 CSV（Excel/WPS 可直接打开）
- 导入：统计页「导入表格」选 CSV 文件；现有数据非空时弹窗选择「覆盖」或「追加」
- 币种列「人民币/美元」会自动映射回 ¥/$

## 字段
入库（必填）：入库日期、采购人、采购理由、采购货物名称、规格、数量、金额、卖方公司名称
出库（必填）：出库日期、领用人、领用原因、领用数量
