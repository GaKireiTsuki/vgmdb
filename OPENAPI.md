# OpenAPI/Swagger Documentation

## Quick Start

启动服务器后访问交互式 API 文档：

```bash
npm run dev
```

然后在浏览器中打开：

- **Swagger UI**: http://localhost:9990/api-docs
- **Root路径重定向**: http://localhost:9990/ → /api-docs
- **OpenAPI Spec**: [openapi.yaml](file:///Users/megumi/Desktop/projects/vgmdb/openapi.yaml)

## 功能特性

### Swagger UI 集成

- ✅ 交互式 API 文档界面
- ✅ 直接在浏览器中测试 API 端点
- ✅ 自动生成的请求/响应示例
- ✅ 过滤和搜索功能
- ✅ 显示增强功能标记（✨）

### OpenAPI 3.0 规范

完整的 API 规范文档包括：

- 所有 14 个端点
- 详细的参数说明
- 响应模式（schemas）
- 错误代码
- 示例数据

### 自定义配置

位于 [src/index.ts](file:///Users/megumi/Desktop/projects/vgmdb/src/index.ts#L78-L91)：

```typescript
app.use('/api-docs', swaggerUi.serve);
app.get(
  '/api-docs',
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'VGMdb API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  })
);
```

## 使用技巧

### 1. 测试端点

1. 访问 http://localhost:9990/api-docs
2. 展开任意端点（如 `GET /album/{id}`）
3. 点击 "Try it out"
4. 输入参数（如 id: `79`）
5. 点击 "Execute"
6. 查看响应结果

### 2. 复制 curl 命令

Swagger UI 自动生成 curl 命令，可直接复制使用。

### 3. 查看增强功能

在响应模式中，所有标记为 ✨ Enhanced 的字段都是本 TypeScript 版本相比 Python 版本的增强功能。

### 4. 格式化响应

使用 `?format=yaml` 参数可以获取 YAML 格式的响应。

## 相关文件

- [openapi.yaml](file:///Users/megumi/Desktop/projects/vgmdb/openapi.yaml) - OpenAPI 规范文件
- [src/index.ts](file:///Users/megumi/Desktop/projects/vgmdb/src/index.ts) - 服务器配置
- [API.md](file:///Users/megumi/Desktop/projects/vgmdb/API.md) - 详细 API 文档（中文）

## 依赖包

```json
{
  "dependencies": {
    "swagger-ui-express": "^5.x",
    "yamljs": "^0.3.x"
  },
  "devDependencies": {
    "@types/swagger-ui-express": "^4.x",
    "@types/yamljs": "^0.2.x"
  }
}
```

## 下一步

- 可以使用 OpenAPI 规范生成客户端 SDK
- 可以导入到 Postman 或 Insomnia 等工具
- 可以使用 `swagger-codegen` 生成多种语言的客户端
