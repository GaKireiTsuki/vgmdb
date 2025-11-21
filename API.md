# VGMdb API Documentation (TypeScript/Node.js)

API 服务器用于从 VGMdb.net 抓取和解析视频游戏音乐数据库信息。

## 快速开始

### 启动服务器

```bash
npm run dev
```

服务器将在 `http://localhost:9990` 启动

### 基础 URL

```
http://localhost:9990
```

## 通用参数

所有端点支持以下查询参数：

| 参数     | 类型   | 描述                        | 默认值 |
| -------- | ------ | --------------------------- | ------ |
| `format` | string | 响应格式 (`json` 或 `yaml`) | `json` |

## 端点列表

### 1. 健康检查

**GET** `/hello`

测试服务器是否正常运行。

**示例请求:**

```bash
curl http://localhost:9990/hello
```

**示例响应:**

```
Hello from VGMdb TypeScript Node.js!
```

---

### 2. 专辑信息

**GET** `/album/:id`

获取专辑的详细信息。

**路径参数:**

- `id` (string) - 专辑 ID

**示例请求:**

```bash
# 获取 Final Fantasy VIII OST
curl http://localhost:9990/album/79

# 获取 YAML 格式
curl http://localhost:9990/album/79?format=yaml
```

**响应字段 (增强后):**

```json
{
  "name": "专辑名称",
  "names": { "en": "English Name", "ja": "日本語名" },
  "catalog": "目录号",
  "release_date": "发行日期",
  "media_format": "媒体格式",
  "classification": "分类",
  "picture_full": "完整封面URL",
  "picture_small": "小封面URL",
  "picture_thumb": "缩略图URL",
  "publisher": { "names": {...}, "link": "..." },
  "organizations": [...],
  "composers": ["作曲家列表"],
  "arrangers": ["编曲家列表"],
  "performers": ["演奏者列表"],
  "lyricists": ["作词者列表"],
  "discs": [
    {
      "name": "碟片名称",
      "tracks": [
        {
          "names": { "en": "Track Name" },
          "track_length": "5:23"
        }
      ]
    }
  ],

  // ✨ 新增字段 (右侧栏数据)
  "notes": "专辑备注",
  "rating": 4.5,
  "votes": 123,
  "category": "Game",
  "categories": ["Game", "Soundtrack"],
  "products": [{ "names": {...}, "link": "..." }],
  "platforms": ["PlayStation", "PC"],
  "related": [
    {
      "catalog": "SQEX-10001",
      "names": {...},
      "type": "game",
      "link": "album/123",
      "date": "2020-01-15"
    }
  ],
  "stores": [
    { "link": "http://...", "name": "Amazon" }
  ],
  "websites": {
    "Official": [{ "link": "http://...", "name": "..." }]
  },
  "covers": [
    {
      "name": "Front Cover",
      "thumb": "...",
      "medium": "...",
      "full": "..."
    }
  ],
  "reprints": [...],
  "release_events": [...],
  "release_price": { "price": "3000", "currency": "JPY" },
  "bootleg": false,
  "meta": {
    "added_date": "...",
    "edited_date": "...",
    "ttl": 86400
  }
}
```

---

### 3. 艺术家信息

**GET** `/artist/:id`

获取艺术家的详细信息。

**路径参数:**

- `id` (string) - 艺术家 ID

**示例请求:**

```bash
# 获取 Nobuo Uematsu 信息
curl http://localhost:9990/artist/291
```

**响应字段 (增强后):**

```json
{
  "name": "艺术家名称",
  "names": { "en": "English Name", "ja": "日本語名" },

  // ✨ 新增字段
  "sex": "male",
  "type": "Individual",
  "alias_of": { "names": {...}, "link": "..." },
  "name_real": "本名",
  "name_trans": "转写",
  "deathdate": "...",

  "picture_full": "...",
  "picture_small": "...",
  "birth_place": "出生地",
  "birthdate": "生日",
  "aliases": ["别名列表"],
  "notes": "备注",

  // ✨ 新增字段
  "members": [{ "names": {...}, "link": "..." }],
  "units": [{ "names": {...}, "link": "..." }],
  "organizations": [{ "names": {...}, "link": "..." }],

  "discography": [
    {
      "date": "2020-01-15",
      "titles": { "en": "Album Name" },
      "catalog": "SQEX-10001",
      "link": "album/123",
      "type": "game",
      "roles": ["Composer", "Arranger"]
    }
  ],
  "featured_on": [...],

  // ✨ 新增字段
  "websites": {
    "Official": [{ "link": "...", "name": "..." }]
  },
  "twitter_names": ["username"],

  "meta": {
    "added_date": "...",
    "edited_date": "..."
  }
}
```

---

### 4. 产品信息

**GET** `/product/:id`

获取游戏/产品的详细信息。

**路径参数:**

- `id` (string) - 产品 ID

**示例请求:**

```bash
# 获取 Final Fantasy VII 产品信息
curl http://localhost:9990/product/189
```

**响应字段 (增强后):**

```json
{
  "name": "产品名称",
  "names": { "en": "English Name" },
  "name_real": "实际名称",
  "type": "Game",
  "picture_full": "...",
  "picture_small": "...",
  "description": "描述",
  "release_date": "...",
  "franchises": [{ "names": {...}, "link": "..." }],
  "organizations": [{ "names": {...}, "link": "..." }],

  // ✨ 新增字段 (特许经营层次结构)
  "superproduct": {
    "names": { "en": "Parent Franchise" },
    "link": "product/123"
  },
  "subproducts": [
    {
      "date": "2020-01-15",
      "names": {...},
      "link": "...",
      "type": "..."
    }
  ],
  "titles": [
    {
      "date": "2020-01-15",
      "names": {...},
      "link": "...",
      "type": "..."
    }
  ],

  // ✨ 新增字段 (发行表)
  "releases": [
    {
      "date": "2020-01-15",
      "names": {...},
      "link": "...",
      "region": "Japan",
      "platform": "PlayStation"
    }
  ],

  "albums": [...],
  "websites": {
    "Official": [...]
  },

  // ✨ 新增字段
  "meta": {
    "added_date": "...",
    "edited_date": "..."
  }
}
```

---

### 5. 活动信息

**GET** `/event/:id`

获取活动（展会/音乐会）的详细信息。

**路径参数:**

- `id` (string) - 活动 ID

**示例请求:**

```bash
curl http://localhost:9990/event/138
```

**响应字段:**

```json
{
  "name": "活动名称",
  "startdate": "2020-08-01",
  "enddate": "2020-08-03",
  "notes": "活动备注",
  "releases": [
    {
      "release_type": "Event Exclusive",
      "catalog": "...",
      "album_type": "game",
      "titles": {...},
      "link": "...",
      "release_date": "...",
      "publisher": {...}
    }
  ],
  "meta": {...}
}
```

---

### 6. 组织信息

**GET** `/org/:id`

获取组织（唱片公司/发行商）的详细信息。

**路径参数:**

- `id` (string) - 组织 ID

**示例请求:**

```bash
curl http://localhost:9990/org/67
```

**响应字段:**

```json
{
  "name": "组织名称",
  "names": {...},
  "type": "Label / Imprint",
  "region": "Japan",
  "picture_full": "...",
  "picture_small": "...",
  "staff": [
    {
      "names": {...},
      "link": "...",
      "owner": true
    }
  ],
  "description": "描述",
  "releases": [
    {
      "role": "Publisher",
      "catalog": "...",
      "reprint": false,
      "event": {...},
      "date": "...",
      "link": "...",
      "titles": {...},
      "type": "game"
    }
  ],
  "websites": {...},
  "meta": {...}
}
```

---

### 7. 发行信息

**GET** `/release/:id`

获取特定发行版本的信息。

**路径参数:**

- `id` (string) - 发行 ID

**示例请求:**

```bash
curl http://localhost:9990/release/1234
```

**响应字段:**

```json
{
  "name": "发行名称",
  "name_real": "实际名称",
  "type": "Physical",
  "picture_full": "...",
  "picture_small": "...",
  "products": [{ "link": "...", "names": {...} }],
  "catalog": "...",
  "upc": "...",
  "release_type": "...",
  "platform": "PlayStation",
  "region": "Japan",
  "release_date": "...",
  "release_albums": [...],
  "product_albums": [...],
  "meta": {...}
}
```

---

### 8. 专辑列表

**GET** `/albumlist/:id`

获取专辑列表（按首字母或数字分类）。

**路径参数:**

- `id` (string) - 列表 ID (`A1`, `A2`, ..., `Z`, `0-9`)

**示例请求:**

```bash
# 获取以 'F' 开头的专辑
curl http://localhost:9990/albumlist/F
```

---

### 9. 艺术家列表

**GET** `/artistlist/:id`

获取艺术家列表（按首字母或数字分类）。

**路径参数:**

- `id` (string) - 列表 ID (`A1`, `A2`, ..., `Z`, `0-9`)

**示例请求:**

```bash
curl http://localhost:9990/artistlist/N
```

---

### 10. 产品列表

**GET** `/productlist/:id`

获取产品列表（按首字母或数字分类）。

**路径参数:**

- `id` (string) - 列表 ID (`A1`, `A2`, ..., `Z`, `0-9`)

**示例请求:**

```bash
curl http://localhost:9990/productlist/F
```

---

### 11. 组织列表

**GET** `/orglist`

获取所有组织的列表。

**示例请求:**

```bash
curl http://localhost:9990/orglist
```

---

### 12. 活动列表

**GET** `/eventlist`

获取所有活动的列表。

**示例请求:**

```bash
curl http://localhost:9990/eventlist
```

---

### 13. 搜索

**GET** `/search`

搜索专辑、艺术家、产品等。

**查询参数:**

- `q` (string, required) - 搜索关键词
- `format` (string, optional) - 响应格式

**示例请求:**

```bash
# 搜索 "Final Fantasy"
curl "http://localhost:9990/search?q=final+fantasy"

# 搜索 "植松伸夫"
curl "http://localhost:9990/search?q=%E6%A4%8D%E6%9D%BE%E4%BC%B8%E5%A4%AB"
```

**响应字段:**

```json
{
  "query": "搜索词",
  "sections": {
    "Albums": {
      "results": [
        {
          "names": {...},
          "catalog": "...",
          "type": "game",
          "link": "album/123"
        }
      ]
    },
    "Artists": {...},
    "Products": {...},
    "Orgs": {...}
  }
}
```

---

### 14. 最近更新

**GET** `/recent/:type?`

获取最近的更新记录。

**路径参数:**

- `type` (string, optional) - 更新类型，默认 `albums`
  - 可选值: `albums`, `media`, `tracklists`, `scans`, `artists`, `products`, `labels`, `links`, `ratings`

**示例请求:**

```bash
# 获取最近更新的专辑
curl http://localhost:9990/recent/albums

# 获取最近更新的艺术家
curl http://localhost:9990/recent/artists
```

**响应字段:**

```json
{
  "sections": [...],
  "updates": [
    {
      "date": "...",
      "time": "...",
      "type": "...",
      "titles": {...},
      "link": "..."
    }
  ]
}
```

---

## 错误处理

### 错误响应格式

所有错误都返回 JSON 格式：

```json
{
  "error": "错误描述"
}
```

### HTTP 状态码

| 状态码 | 描述                 |
| ------ | -------------------- |
| 200    | 成功                 |
| 400    | 请求参数错误         |
| 404    | 资源未找到           |
| 500    | 内部服务器错误       |
| 503    | VGMdb.net 暂时不可用 |

---

## 调试技巧

### 1. 使用 jq 格式化 JSON

```bash
curl http://localhost:9990/album/79 | jq .
```

### 2. 查看特定字段

```bash
# 查看评分和投票数
curl http://localhost:9990/album/79 | jq '.rating, .votes'

# 查看相关专辑
curl http://localhost:9990/album/79 | jq '.related'

# 查看封面图库
curl http://localhost:9990/album/79 | jq '.covers'
```

### 3. 查看艺术家作品列表

```bash
# 查看作曲作品
curl http://localhost:9990/artist/291 | jq '.discography | length'

# 查看参与作品
curl http://localhost:9990/artist/291 | jq '.featured_on'
```

### 4. 查看产品发行历史

```bash
# 查看所有发行版本
curl http://localhost:9990/product/189 | jq '.releases'

# 查看子产品
curl http://localhost:9990/product/189 | jq '.subproducts'
```

### 5. 保存响应到文件

```bash
curl http://localhost:9990/album/79 > album_79.json
```

### 6. 测试性能

```bash
time curl http://localhost:9990/album/79
```

---

## 缓存

- 所有响应都设置了缓存头: `Cache-Control: max-age=86400,public`
- 缓存时间: 24 小时

---

## CORS

API 支持跨域请求 (CORS)，可从任何域名调用。

---

## 比 Python 版本的增强功能

本 TypeScript 版本相比 Python 版本增加了以下功能：

### Album (专辑)

- ✅ 评分和投票数 (`rating`, `votes`)
- ✅ 完整分类列表 (`categories`)
- ✅ 相关产品和平台 (`products`, `platforms`)
- ✅ 相关专辑列表 (`related`)
- ✅ 在线商店链接 (`stores`)
- ✅ 分类网站链接 (`websites`)
- ✅ 封面图库 (`covers`)
- ✅ 重印和盗版信息 (`reprints`, `bootleg`)
- ✅ 发行活动和价格 (`release_events`, `release_price`)
- ✅ 元数据 (`meta`)

### Artist (艺术家)

- ✅ 性别和类型 (`sex`, `type`)
- ✅ 别名关系 (`alias_of`)
- ✅ 本名和转写 (`name_real`, `name_trans`)
- ✅ 死亡日期 (`deathdate`)
- ✅ 作品目录 (`discography`, `featured_on`)
- ✅ 成员、组合、组织 (`members`, `units`, `organizations`)
- ✅ 网站链接 (`websites`)
- ✅ Twitter 账号 (`twitter_names`)
- ✅ 元数据 (`meta`)

### Product (产品)

- ✅ 特许经营层次 (`superproduct`, `subproducts`, `titles`)
- ✅ 发行版本表 (`releases`) 包含平台/地区/日期
- ✅ 元数据 (`meta`)

### Event, Org, Release

- ✅ 所有解析器都已包含完整的元数据 (`meta`)

---

## 示例组合查询

### 查找艺术家的所有专辑

```bash
# 1. 搜索艺术家
curl "http://localhost:9990/search?q=nobuo+uematsu" | jq '.sections.Artists.results[0]'

# 2. 获取艺术家详情
curl http://localhost:9990/artist/291 | jq '.discography'

# 3. 获取特定专辑详情
curl http://localhost:9990/album/79 | jq '.'
```

### 探索游戏系列

```bash
# 1. 获取产品信息
curl http://localhost:9990/product/189 | jq '.'

# 2. 查看子产品
curl http://localhost:9990/product/189 | jq '.subproducts'

# 3. 查看相关专辑
curl http://localhost:9990/product/189 | jq '.albums'
```

---

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **HTML 解析**: Cheerio
- **语言**: TypeScript

---

## 相关文件

- [src/index.ts](file:///Users/megumi/Desktop/projects/vgmdb/src/index.ts) - API 路由定义
- [src/parsers/](file:///Users/megumi/Desktop/projects/vgmdb/src/parsers) - 解析器实现
- [src/types/index.ts](file:///Users/megumi/Desktop/projects/vgmdb/src/types/index.ts) - TypeScript 类型定义

---

## License

根据原始 VGMdb 项目的许可证。
