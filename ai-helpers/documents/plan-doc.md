# Navigation-openmap Vietnam

> Hệ thống dẫn đường thời gian thực mã nguồn mở dành cho người Việt Nam

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [User Stories](#user-stories)
- [Kiến trúc hệ thống](#kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt nhanh](#cài-đặt-nhanh)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Roadmap](#roadmap)
- [Đóng góp](#đóng-góp)
- [License](#license)

## 🎯 Giới thiệu

**Navigation-openmap Vietnam** là một nền tảng dẫn đường mã nguồn mở, được xây dựng bởi và cho cộng đồng Việt Nam. Dự án nhằm mục đích:

- 🗺️ Xây dựng bản đồ Việt Nam chi tiết, cập nhật thời gian thực
- 🚗 Cung cấp dịch vụ định vị và dẫn đường chính xác
- 👥 Cho phép cộng đồng đóng góp và cập nhật dữ liệu
- 🔒 Bảo vệ quyền riêng tư người dùng
- 💰 Hoàn toàn miễn phí và có thể tự triển khai (self-host)

##N Tại sao navigation-openmap Vietnam?

- **Dữ liệu địa phương hóa**: Tập trung vào đường xá, địa điểm Việt Nam
- **Cập nhật nhanh**: Cộng đồng có thể báo cáo và cập nhật thay đổi ngay lập tức
- **Quyền riêng tư**: Không theo dõi, không bán dữ liệu người dùng
- **Mã nguồn mở**: Minh bạch, có thể kiểm chứng và tùy chỉnh
- **Chi phí thấp**: Có thể tự host hoặc sử dụng dịch vụ cộng đồng

## ✨ Tính năng chính

### Phiên bản MVP (v1.0)

- ✅ Thu thập GPS từ người dùng
- ✅ Map-matching (khớp GPS với đường)
- ✅ Tìm đường cơ bản (A → B)
- ✅ Hiển thị bản đồ vector tiles
- ✅ Tìm kiếm địa điểm cơ bản
- ✅ Báo cáo đường mới/thay đổi

### Phiên bản nâng cao (v2.0+)

- 🔄 Dự đoán giao thông real-time
- 🔄 Tìm đường tối ưu (tránh kẹt xe)
- 🔄 Điểm quan tâm (POI) chi tiết
- 🔄 Street view từ cộng đồng
- 🔄 Chế độ offline
- 🔄 Đa phương thức (xe máy, ô tô, đi bộ, xe buýt)

## 👥 User Stories

### 1. Người dùng cuối (End Users)

#### US-001: Tìm đường đi

```
Là một người lái xe,
Tôi muốn tìm đường từ vị trí hiện tại đến địa điểm mong muốn,
Để có thể di chuyển nhanh nhất và tránh kẹt xe.

Acceptance Criteria:
- Nhập địa điểm đích bằng tên hoặc địa chỉ
- Xem nhiều tuyến đường thay thế
- Ước tính thời gian và khoảng cách
- Dẫn đường từng bước với giọng nói
- Tự động tính lại khi đi sai đường
```

#### US-002: Xem bản đồ offline

```
Là một người hay đi xa,
Tôi muốn tải bản đồ về máy để sử dụng khi không có internet,
Để tiết kiệm data và đảm bảo luôn có bản đồ khi cần.

Acceptance Criteria:
- Chọn khu vực để tải (tỉnh/thành phố)
- Xem dung lượng cần thiết
- Tự động cập nhật khi có thay đổi
- Quản lý bản đồ đã tải
```

#### US-003: Tìm kiếm địa điểm

```
Là một người dùng,
Tôi muốn tìm kiếm nhà hàng, bệnh viện, trạm xăng gần tôi,
Để nhanh chóng tìm được dịch vụ cần thiết.

Acceptance Criteria:
- Tìm theo tên hoặc loại hình
- Hiển thị kết quả trên bản đồ
- Xem thông tin chi tiết (địa chỉ, giờ mở cửa, SĐT)
- Lọc theo khoảng cách
- Xem đánh giá từ cộng đồng
```

#### US-004: Theo dõi giao thông real-time

```
Là một người thường xuyên lái xe,
Tôi muốn biết tình trạng giao thông hiện tại,
Để chọn đường đi tránh kẹt xe.

Acceptance Criteria:
- Hiển thị màu đường theo mức độ tắc nghẽn
- Cảnh báo tai nạn, công trình
- Ước tính thời gian cập nhật real-time
- Gợi ý đường thay thế khi có tắc đường
```

### 2. Người đóng góp (Contributors)

#### US-005: Báo cáo đường mới

```
Là một người dùng địa phương,
Tôi muốn báo cáo con đường mới được xây dựng,
Để bản đồ được cập nhật chính xác.

Acceptance Criteria:
- Đánh dấu vị trí đường mới trên bản đồ
- Vẽ hình dạng đường
- Thêm thông tin (tên đường, loại đường)
- Upload ảnh làm bằng chứng
- Theo dõi trạng thái duyệt
```

#### US-006: Sửa thông tin địa điểm

```
Là một chủ cửa hàng,
Tôi muốn cập nhật thông tin cửa hàng của mình,
Để khách hàng có thông tin chính xác nhất.

Acceptance Criteria:
- Tìm địa điểm trên bản đồ
- Chỉnh sửa tên, địa chỉ, SĐT, giờ mở cửa
- Thêm ảnh
- Chờ moderator duyệt
```

#### US-007: Báo cáo sự cố giao thông

```
Là một người tham gia giao thông,
Tôi muốn báo cáo tai nạn, kẹt xe, đường hỏng,
Để cảnh báo người khác và cải thiện dữ liệu giao thông.

Acceptance Criteria:
- Chọn loại sự cố
- Đánh dấu vị trí chính xác
- Thêm mô tả và ảnh
- Hiển thị cho người dùng khác ngay lập tức
- Tự động ẩn sau khi hết hiệu lực
```

#### US-008: Upload street view

```
Là một người nhiệt tình,
Tôi muốn upload ảnh đường phố từ camera hành trình,
Để xây dựng street view cho Việt Nam.

Acceptance Criteria:
- Upload video hoặc ảnh 360
- Tự động gắn GPS metadata
- Xử lý blur mặt người và biển số
- Hiển thị trên bản đồ
```

### 3. Quản trị viên (Moderators)

#### US-009: Duyệt đóng góp

```
Là một moderator,
Tôi muốn xem xét và duyệt các đóng góp từ cộng đồng,
Để đảm bảo chất lượng dữ liệu.

Acceptance Criteria:
- Xem danh sách đóng góp chờ duyệt
- Xem chi tiết và so sánh với dữ liệu cũ
- Chấp nhận hoặc từ chối với lý do
- Thống kê chất lượng đóng góp theo người dùng
```

#### US-010: Quản lý dữ liệu

```
Là một admin,
Tôi muốn import/export dữ liệu bản đồ,
Để backup hoặc tích hợp từ nguồn khác.

Acceptance Criteria:
- Import từ OSM, Google Maps export
- Export sang định dạng chuẩn
- Xử lý conflict
- Theo dõi tiến trình import/export
```

### 4. Developer/Self-hoster

#### US-011: Triển khai hệ thống

```
Là một developer,
TôN muốn dễ dàng triển khai navigation-openmap trên server riêng,
Để phục vụ tổ chức hoặc khu vực của tôi.

Acceptance Criteria:
- Chạy được với Docker Compose
- Tài liệu cài đặt rõ ràng
- Config dễ dàng
- Script backup/restore
```

#### US-012: Tùy chỉnh giao diện

```
Là một tổ chức,
Tôi muốn tùy chỉnh theme và logo,
Để phù hợp với thương hiệu của tổ chức.

Acceptance Criteria:
- Thay đổi màu sắc, logo
- Tùy chỉnh style bản đồ
- Thêm layer riêng
- White-label option
```

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTS                              │
├──────────────────┬──────────────────┬───────────────────────┤
│  Mobile Apps     │   Web App        │   Admin Dashboard     │
│  (React Native)  │   (Next.js)      │   (Next.js)          │
└────────┬─────────┴────────┬─────────┴──────────┬───────────┘
         │                  │                    │
         └──────────────────┼────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   API GW    │
                    │  (Fastify)  │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ Ingest  │      │ Routing │      │ Tiles   │
    │ Service │      │ Service │      │ Service │
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                 │
         ▼                ▼                 ▼
    ┌─────────────────────────────────────────┐
    │          MESSAGE QUEUE (Redpanda)       │
    └─────────────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
    │ Map     │      │ Traffic │      │ Change  │
    │ Matcher │      │ Analyzer│      │ Detector│
    └────┬────┘      └────┬────┘      └────┬────┘
         │                │                 │
         └────────────────┼─────────────────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
    ┌────▼────────┐              ┌────────▼─────┐
    │  PostgreSQL │              │   ClickHouse │
    │  + PostGIS  │              │  (Analytics) │
    └─────────────┘              └──────────────┘
         │
    ┌────▼────┐
    │  MinIO  │
    │  (S3)   │
    └─────────┘
```

### Các thành phần chính

1. **API Gateway**: Fastify - routing requests, authentication, rate limiting
2. **Ingest Service**: Thu thập GPS từ mobile apps
3. **Map Matching**: Khớp GPS traces với road network (Valhalla)
4. **Routing Engine**: Tính đường đi tối ưu (OSRM + Valhalla)
5. **Tile Server**: Phục vụ vector tiles (TileServer GL)
6. **Geocoding**: Tìm kiếm địa điểm (Pelias)
7. **PostgreSQL + PostGIS**: Lưu trữ dữ liệu địa lý
8. **ClickHouse**: Phân tích time-series (traffic data)
9. **MinIO**: Lưu trữ object (images, uploads)
10. **Redpanda**: Message queue cho event streaming

## 🛠️ Công nghệ sử dụng

### Frontend Web

- **Framework**: Next.js 14 (App Router)
- **Map Rendering**: MapLibre GL JS
- **UI Components**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand / React Query
- **Build Tool**: Turbopack

### Mobile App

- **Framework**: **React Native** (0.73+)

  **Lý do chọn React Native thay vì Flutter:**

  - ✅ Chia sẻ code với web (React/Next.js)
  - ✅ Ecosystem mạnh cho maps (react-native-maps, maplibre-react-native)
  - ✅ Team có thể chia sẻ kiến thức JavaScript/TypeScript
  - ✅ Hot reload nhanh hơn
  - ✅ Native modules dễ tích hợp hơn cho GPS tracking
  - ✅ Cộng đồng Việt Nam lớn hơn

- **Map Library**: react-native-maplibre-gl
- **GPS Tracking**: react-native-background-geolocation
- **Storage**: WatermelonDB (offline-first)
- **Navigation**: React Navigation

### Backend

- **Framework**: **Fastify** (v4)

  **Lý do chọn Fastify:**

  - ✅ Performance cao nhất trong các Node.js frameworks
  - ✅ Schema validation built-in (JSON Schema)
  - ✅ Plugin architecture linh hoạt
  - ✅ TypeScript support tốt
  - ✅ Logging tích hợp (Pino)
  - ✅ Nhẹ hơn NestJS, phù hợp microservices

- **Language**: TypeScript
- **ORM**: Prisma + PostGIS extensions
- **Validation**: Zod + Fastify JSON Schema
- **Testing**: Vitest + Supertest

### Database & Storage

- **Primary DB**: PostgreSQL 15 + PostGIS 3.3
- **Time-series**: ClickHouse
- **Cache**: Redis
- **Object Storage**: MinIO (S3-compatible)
- **Search**: Elasticsearch hoặc MeiliSearch

### Mapping Stack

- **Tiles**: OpenMapTiles + TileServer GL
- **Routing**: OSRM (car) + Valhalla (multimodal)
- **Geocoding**: Pelias
- **Map Matching**: Valhalla Map Matching

### Infrastructure

- **Container**: Docker + Docker Compose
- **Orchestration**: Kubernetes (K3s cho small deployments)
- **Message Queue**: Redpanda (Kafka-compatible)
- **Monitoring**: Prometheus + Grafana
- **Logging**: Loki + Grafana
- **CI/CD**: GitHub Actions

### ML/AI (Future)

- **Language**: Python 3.11+
- **Framework**: PyTorch, scikit-learn
- **Computer Vision**: YOLOv8, OpenCV
- **Time-series**: Prophet, LSTM

## 🚀 Cài đặt nhanh

### Yêu cầu hệ thống

- Docker 24+ và Docker Compose
- Node.js 18+ (cho local development)
- 8GB RAM tối thiểu (16GB khuyến nghị)
- 50GB disk space

### Chạy với Docker Compose

```bash
# Clone repository
git clone https://github.com/sme-team/navigation-openmap.git
cd navigation-openmap

# Copy environment file
cp .env.example .env

# Chỉnh sửa .env với config của bạn
nano .env

# Start tất cả services
docker compose up -d

# Xem logs
docker compose logs -f

# Import dữ liệu OSM cho Vietnam
docker compose exec backend npm run import-osm -- vietnam

# Tạo vector tiles
docker compose exec tiles npm run generate-tiles

# Truy cập:
# - Web App: http://localhost:3000
# - API Docs: http://localhost:4000/docs
# - Admin: http://localhost:3000/admin
```

### Development Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

# Mobile
cd mobile
npm install
npx expo start
```

## 📁 Cấu trúc dự án

```
navigation-openmap/
├── apps/
│   ├── web/                 # Next.js web app
│   │   ├── app/            # App router
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities
│   │   └── public/        # Static assets
│   ├── mobile/             # React Native app
│   │   ├── src/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   └── app.json
│   └── admin/              # Admin dashboard
├── services/
│   ├── api/                # Main API (Fastify)
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── plugins/
│   │   │   ├── schemas/
│   │   │   └── server.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── ingest/             # GPS ingestion worker
│   ├── matcher/            # Map matching service
│   ├── routing/            # Routing service wrapper
│   ├── tiles/              # Tile generation
│   └── ml/                 # ML models (Python)
├── packages/
│   ├── shared/             # Shared TypeScript types
│   ├── ui/                 # Shared UI components
│   └── db/                 # Prisma schema & migrations
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.prod.yml
│   │   └── Dockerfiles/
│   ├── k8s/               # Kubernetes manifests
│   │   ├── base/
│   │   └── overlays/
│   └── terraform/         # IaC
├── data/
│   ├── osm/               # OSM data imports
│   ├── tiles/             # Generated tiles
│   └── seeds/             # Seed data
├── docs/
│   ├── api/               # API documentation
│   ├── architecture/      # Architecture diagrams
│   ├── deployment/        # Deployment guides
│   └── contributing/      # Contributor guides
├── scripts/
│   ├── import-osm.sh
│   ├── generate-tiles.sh
│   └── backup.sh
├── .github/
│   └── workflows/         # CI/CD
├── docker-compose.yml
├── package.json           # Root workspace config
├── turbo.json            # Turborepo config
└── README.md
```

## 🗓️ Roadmap

### Phase 1: MVP Foundation (Tháng 1-3)

**Sprint 1-2: Core Infrastructure**

- [x] Setup monorepo structure (Turborepo)
- [x] Docker Compose development environment
- [x] PostgreSQL + PostGIS setup
- [ ] Basic API with Fastify
- [ ] Authentication system

**Sprint 3-4: Basic Mapping**

- [ ] Import OSM data cho Vietnam
- [ ] Vector tiles generation
- [ ] Web app với MapLibre
- [ ] Basic geocoding (search địa điểm)

**Sprint 5-6: Mobile App & GPS Collection**

- [ ] React Native app skeleton
- [ ] Background GPS tracking
- [ ] GPS data ingestion API
- [ ] Raw GPS visualization on map

### Phase 2: Core Features (Tháng 4-6)

**Sprint 7-8: Routing**

- [ ] OSRM integration
- [ ] Basic routing API (A to B)
- [ ] Turn-by-turn directions
- [ ] Voice navigation (Vietnamese)

**Sprint 9-10: Map Matching**

- [ ] Valhalla map matching integration
- [ ] GPS trace processing pipeline
- [ ] Matched routes visualization

**Sprint 11-12: Crowdsourcing**

- [ ] Report new roads UI
- [ ] Edit POI information
- [ ] Moderator dashboard
- [ ] Approval workflow

### Phase 3: Advanced Features (Tháng 7-9)

**Sprint 13-14: Traffic Analysis**

- [ ] Real-time traffic data collection
- [ ] Traffic visualization
- [ ] Incident reporting
- [ ] Route optimization based on traffic

**Sprint 15-16: Offline Support**

- [ ] Download map regions
- [ ] Offline routing
- [ ] Offline search
- [ ] Sync mechanism

**Sprint 17-18: Enhancement**

- [ ] Street imagery upload
- [ ] POI photos
- [ ] Reviews and ratings
- [ ] Multi-modal routing

### Phase 4: Scale & Polish (Tháng 10-12)

- [ ] Performance optimization
- [ ] Kubernetes deployment
- [ ] Auto-scaling setup
- [ ] Advanced ML models (traffic prediction)
- [ ] Mobile app polish & release
- [ ] Community onboarding
- [ ] Documentation completion

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Xem [CONTRIBUTING.md](CONTRIBUTING.md) để biết chi tiết.

### Các cách đóng góp

1. **Code**: Submit pull requests
2. **Dữ liệu**: Báo cáo đường mới, sửa POI
3. **Ảnh**: Upload street imagery
4. **Dịch thuật**: Translate to other languages
5. **Tài liệu**: Improve docs
6. **Testing**: Report bugs

### Development Workflow

```bash
# 1. Fork repo
# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and commit
git commit -m "Add amazing feature"

# 4. Push to your fork
git push origin feature/amazing-feature

# 5. Open Pull Request
```

### Quy tắc đóng góp

- Follow TypeScript/ESLint conventions
- Write tests cho features mới
- Update documentation
- Keep PRs focused and small
- Be respectful and constructive

## 📊 Database Schema

### Core Tables

```sql
-- Streets/Roads
CREATE TABLE streets (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255),
  name_vi VARCHAR(255),
  type VARCHAR(50), -- highway, residential, etc
  oneway BOOLEAN DEFAULT FALSE,
  geom GEOMETRY(LINESTRING, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points of Interest
CREATE TABLE pois (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  geom GEOMETRY(POINT, 4326),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPS Traces
CREATE TABLE gps_traces (
  id BIGSERIAL PRIMARY KEY,
  device_id UUID,
  speed FLOAT,
  accuracy FLOAT,
  geom GEOMETRY(POINT, 4326),
  recorded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Contributions
CREATE TABLE contributions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  type VARCHAR(50), -- new_road, edit_poi, report_issue
  status VARCHAR(20), -- pending, approved, rejected
  data JSONB,
  geom GEOMETRY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🔒 Privacy & Security

### Privacy Principles

1. **Data Minimization**: Chỉ thu thập dữ liệu cần thiết
2. **Anonymization**: Device IDs được hash, GPS downsampled
3. **Opt-in**: Users phải đồng ý chia sẻ dữ liệu
4. **Transparency**: Công khai cách sử dụng dữ liệu
5. **Right to Delete**: Users có thể xóa dữ liệu bất kỳ lúc nào

### Security Measures

- HTTPS everywhere
- API rate limiting
- SQL injection prevention (Prisma ORM)
- CORS configuration
- Regular security audits
- Dependency vulnerability scanning

## 📄 License

Dự án này sử dụng **GNU General Public License v3.0** - xem file [LICENSE](LICENSE) để biết chi tiết.

### Data License

- Dữ liệu từ OpenStreetMap: [ODbL 1.0](https://opendatacommons.org/licenses/odbl/)
- Dữ liệu đóng góp từ cộng đồng: ODbL 1.0
- Phải attribution khi sử dụng

## 🌟 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) - Nguồn dữ liệu chính
- [MapLibre](https://maplibre.org/) - Map rendering
- [OSRM](http://project-osrm.org/) - Routing engine
- [Valhalla](https://github.com/valhalla/valhalla) - Map matching
- [OpenMapTiles](https://openmaptiles.org/) - Tiles generation

## 📞 Liên hệ

- Website: https://cuongdq.no-ip.info
- Email: cuongdq3500888@gmail.com
- GitHub Issues: https://github.com/sme-team/navigation-openmap/issues

## 🎯 Vision

Xây dựng một hệ thống bản đồ và dẫn đường hoàn toàn mã nguồn mở, do cộng đồng Việt Nam sở hữu và phát triển, phục vụ mọi người dân từ thành thị đến vùng sâu vùng xa.

---

**Made with ❤️ by the Vietnamese Open Source Community**

---

## 📚 Appendix

### A. API Endpoints Overview

#### Geocoding API

```
GET  /api/v1/geocode/search?q={query}&limit=10
GET  /api/v1/geocode/reverse?lat={lat}&lon={lon}
GET  /api/v1/geocode/autocomplete?q={query}
```

#### Routing API

```
POST /api/v1/route
Body: {
  "origin": [106.6297, 10.8231],
  "destination": [106.7054, 10.7769],
  "mode": "car|motorcycle|walk",
  "alternatives": true
}

Response: {
  "routes": [{
    "distance": 12500,
    "duration": 1200,
    "geometry": "...",
    "steps": [...]
  }]
}
```

#### GPS Ingestion API

```
POST /api/v1/ingest/gps
Body: {
  "device_id": "hashed-uuid",
  "points": [{
    "lat": 10.8231,
    "lon": 106.6297,
    "timestamp": "2025-10-21T10:30:00Z",
    "speed": 45.5,
    "accuracy": 10
  }]
}
```

#### Tiles API

```
GET /api/v1/tiles/{z}/{x}/{y}.pbf
GET /api/v1/tiles/style.json
```

#### Contributions API

```
POST /api/v1/contributions/road
POST /api/v1/contributions/poi
GET  /api/v1/contributions?status=pending
PUT  /api/v1/contributions/{id}/review
```

### B. Configuration Guide

#### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/navigation-openmap
CLICKHOUSE_URL=http://localhost:8123

# Redis
REDIS_URL=redis://localhost:6379

# MinIO/S3
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=navigation-openmap-storage

# Message Queue
KAFKA_BROKERS=localhost:9092

# API
API_PORT=4000
API_HOST=0.0.0.0
JWT_SECRET=your-secret-key
RATE_LIMIT_MAX=100

# External Services
OSRM_URL=http://localhost:5000
VALHALLA_URL=http://localhost:8002
PELIAS_URL=http://localhost:4000

# Feature Flags
ENABLE_TRAFFIC_PREDICTION=false
ENABLE_STREET_IMAGERY=false
ENABLE_ML_MATCHING=false
```

#### Docker Compose Services

```yaml
version: "3.9"

services:
  # Core Database
  postgres:
    image: postgis/postgis:15-3.4
    environment:
      POSTGRES_DB: navigation-openmap
      POSTGRES_USER: navigation-openmap
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U navigation-openmap"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Time-series Analytics
  clickhouse:
    image: clickhouse/clickhouse-server:23.8
    volumes:
      - clickhouse_data:/var/lib/clickhouse
    ports:
      - "8123:8123"
      - "9000:9000"

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Object Storage
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  # Message Queue
  redpanda:
    image: vectorized/redpanda:latest
    command:
      - redpanda start
      - --smp 1
      - --overprovisioned
      - --kafka-addr internal://0.0.0.0:9092,external://0.0.0.0:19092
      - --advertise-kafka-addr internal://redpanda:9092,external://localhost:19092
      - --pandaproxy-addr internal://0.0.0.0:8082,external://0.0.0.0:18082
      - --advertise-pandaproxy-addr internal://redpanda:8082,external://localhost:18082
      - --schema-registry-addr internal://0.0.0.0:8081,external://0.0.0.0:18081
    ports:
      - "18081:18081"
      - "18082:18082"
      - "19092:19092"
      - "19644:9644"

  # Routing Engine
  osrm:
    image: osrm/osrm-backend:latest
    volumes:
      - ./data/osm:/data
    command: osrm-routed --algorithm mld /data/vietnam-latest.osrm
    ports:
      - "5000:5000"

  # Map Matching & Routing
  valhalla:
    image: ghcr.io/gis-ops/docker-valhalla:latest
    volumes:
      - ./data/valhalla:/custom_files
    ports:
      - "8002:8002"
    environment:
      tile_urls: https://download.geofabrik.de/asia/vietnam-latest.osm.pbf

  # Geocoding
  pelias:
    image: pelias/api:latest
    volumes:
      - ./config/pelias.json:/code/pelias.json
    ports:
      - "4000:4000"
    depends_on:
      - elasticsearch

  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
    volumes:
      - es_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  # Tile Server
  tileserver:
    image: maptiler/tileserver-gl:latest
    volumes:
      - ./data/tiles:/data
    ports:
      - "8080:8080"

  # API Gateway
  api:
    build: ./services/api
    ports:
      - "4000:4000"
    environment:
      NODE_ENV: production
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - postgres
      - redis
      - redpanda
    restart: unless-stopped

  # GPS Ingestion Worker
  ingest-worker:
    build: ./services/ingest
    environment:
      KAFKA_BROKERS: redpanda:9092
      DATABASE_URL: ${DATABASE_URL}
    depends_on:
      - redpanda
      - postgres
    restart: unless-stopped

  # Map Matching Worker
  matcher-worker:
    build: ./services/matcher
    environment:
      KAFKA_BROKERS: redpanda:9092
      VALHALLA_URL: http://valhalla:8002
    depends_on:
      - redpanda
      - valhalla
    restart: unless-stopped

  # Web App
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000
      NEXT_PUBLIC_MAPBOX_TOKEN: ${MAPBOX_TOKEN}
    depends_on:
      - api

  # Monitoring
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning
    ports:
      - "3001:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}

volumes:
  postgres_data:
  clickhouse_data:
  redis_data:
  minio_data:
  es_data:
  prometheus_data:
  grafana_data:
```

### C. Data Import Scripts

#### Import OSM Data

```bash
#!/bin/bash
# scripts/import-osm.sh

REGION=${1:-vietnam}
OSM_URL="https://download.geofabrik.de/asia/${REGION}-latest.osm.pbf"
DATA_DIR="./data/osm"

echo "📥 Downloading OSM data for ${REGION}..."
mkdir -p ${DATA_DIR}
wget -O ${DATA_DIR}/${REGION}-latest.osm.pbf ${OSM_URL}

echo "📊 Importing to PostgreSQL..."
osm2pgsql -c -d navigation-openmap \
  --create \
  --slim \
  -G \
  --hstore \
  --tag-transform-script ./config/osm2pgsql-style.lua \
  --number-processes 4 \
  --cache 4096 \
  ${DATA_DIR}/${REGION}-latest.osm.pbf

echo "🗺️  Preparing OSRM data..."
docker-compose exec osrm osrm-extract -p /opt/car.lua ${DATA_DIR}/${REGION}-latest.osm.pbf
docker-compose exec osrm osrm-partition ${DATA_DIR}/${REGION}-latest.osrm
docker-compose exec osrm osrm-customize ${DATA_DIR}/${REGION}-latest.osrm

echo "✅ Import completed!"
```

#### Generate Tiles

```bash
#!/bin/bash
# scripts/generate-tiles.sh

echo "🗺️  Generating vector tiles..."

# Using OpenMapTiles
docker run --rm -v $(pwd)/data:/data \
  openmaptiles/openmaptiles-tools \
  generate-tiles \
  --bbox 102.14,8.18,109.46,23.39 \
  --minzoom 0 \
  --maxzoom 14 \
  /data/tiles/vietnam.mbtiles

# Using Tippecanoe for custom tiles
tippecanoe -o data/tiles/custom.mbtiles \
  --minimum-zoom=0 \
  --maximum-zoom=14 \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  data/geojson/*.geojson

echo "✅ Tiles generated!"
```

### D. Deployment Guides

#### Production Deployment on Kubernetes

```yaml
# infrastructure/k8s/base/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  labels:
    app: navigation-openmap-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: navigation-openmap-api
  template:
    metadata:
      labels:
        app: navigation-openmap-api
    spec:
      containers:
        - name: api
          image: navigation-openmap/api:latest
          ports:
            - containerPort: 4000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: navigation-openmap-secrets
                  key: database-url
            - name: REDIS_URL
              value: redis://redis:6379
          resources:
            requests:
              memory: "512Mi"
              cpu: "500m"
            limits:
              memory: "1Gi"
              cpu: "1000m"
          livenessProbe:
            httpGet:
              path: /health
              port: 4000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 4000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: navigation-openmap-api
  ports:
    - port: 4000
      targetPort: 4000
  type: ClusterIP
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### E. Performance Optimization Tips

1. **Database Indexing**

```sql
-- Spatial indices
CREATE INDEX idx_streets_geom ON streets USING GIST(geom);
CREATE INDEX idx_pois_geom ON pois USING GIST(geom);

-- Query optimization
CREATE INDEX idx_gps_traces_device_time ON gps_traces(device_id, recorded_at);
CREATE INDEX idx_contributions_status ON contributions(status, created_at);

-- Materialized views for common queries
CREATE MATERIALIZED VIEW mv_city_boundaries AS
SELECT
  name,
  ST_ConvexHull(ST_Collect(geom)) as boundary
FROM streets
GROUP BY name;

CREATE INDEX idx_mv_city_boundaries_geom ON mv_city_boundaries USING GIST(boundary);
```

2. **Caching Strategy**

- Tile requests: Cache at CDN level (1 week)
- Geocoding: Redis cache (1 hour)
- Routing: Cache common routes (30 minutes)
- POI search: Cache by bounding box (15 minutes)

3. **API Response Optimization**

- Use pagination for list endpoints
- Implement field filtering (?fields=name,location)
- Compress responses (gzip)
- Use ETags for conditional requests

### F. Monitoring & Alerts

#### Prometheus Alerts

```yaml
# monitoring/alerts.yml
groups:
  - name: navigation-openmap
    interval: 30s
    rules:
      - alert: HighAPILatency
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High API latency detected"
          description: "95th percentile latency is {{ $value }}s"

      - alert: DatabaseConnectionPoolExhausted
        expr: pg_pool_used / pg_pool_size > 0.9
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool nearly exhausted"

      - alert: GPSIngestionBacklog
        expr: kafka_consumergroup_lag{topic="gps-traces"} > 10000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "GPS ingestion backlog detected"
```

### G. Testing Strategy

```typescript
// services/api/src/__tests__/routing.test.ts
import { test, expect } from "vitest";
import { build } from "../server";

test("POST /api/v1/route - successful routing", async () => {
  const app = await build();

  const response = await app.inject({
    method: "POST",
    url: "/api/v1/route",
    payload: {
      origin: [106.6297, 10.8231],
      destination: [106.7054, 10.7769],
      mode: "car",
    },
  });

  expect(response.statusCode).toBe(200);
  expect(response.json()).toMatchObject({
    routes: expect.arrayContaining([
      expect.objectContaining({
        distance: expect.any(Number),
        duration: expect.any(Number),
        geometry: expect.any(String),
      }),
    ]),
  });
});
```

### H. Common Issues & Troubleshooting

| Issue                  | Solution                                                  |
| ---------------------- | --------------------------------------------------------- |
| Tiles not loading      | Check TileServer logs, verify data directory mount        |
| Slow routing           | Ensure OSRM data is properly prepared with MLD            |
| GPS not matching roads | Check Valhalla configuration, verify road network quality |
| High memory usage      | Tune PostgreSQL shared_buffers, adjust worker_mem         |
| Kafka consumer lag     | Scale up consumer replicas, optimize processing logic     |

---

**Made with ❤️ by the Vietnamese Open Source Community**
