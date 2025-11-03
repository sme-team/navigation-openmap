# 🗺️ Dự án Bản đồ Dẫn đường Mã nguồn Mở

> Hệ thống bản đồ tương tác hoàn chỉnh sử dụng 100% công nghệ mã nguồn mở, không phụ thuộc vào Google Maps hay các dịch vụ thương mại khác.

[![License: GNU GPLv3](https://img.shields.io/badge/License-GNU GPLv3-yellow.svg)](https://opensource.org/licenses/GNU GPLv3)
[![OpenStreetMap](https://img.shields.io/badge/Data-OpenStreetMap-7EBC6F)](https://www.openstreetmap.org/)
[![MapLibre](https://img.shields.io/badge/Engine-MapLibre%20GL-blue)](https://maplibre.org/)

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Tính năng](#-tính-năng)
- [API Documentation](#-api-documentation)
- [Đóng góp](#-đóng-góp)
- [License](#-license)

---

## 🌟 Giới thiệu

Dự án này cung cấp một **giải pháp bản đồ hoàn chỉnh** với đầy đủ tính năng:

- ✅ Hiển thị bản đồ tương tác mượt mà
- ✅ Tìm kiếm địa điểm (Geocoding)
- ✅ Chuyển đổi tọa độ sang địa chỉ (Reverse Geocoding)
- ✅ Dẫn đường tối ưu giữa các điểm
- ✅ Hiển thị lại lịch sử hành trình
- ✅ Hỗ trợ Vector Tiles cho hiệu suất cao
- ✅ Tùy chỉnh style bản đồ hoàn toàn

### 💡 Tại sao chọn mã nguồn mở?

| Lợi ích | Mô tả |
|---------|-------|
| **Miễn phí** | Không tốn chi phí API như Google Maps |
| **Tùy biến hoàn toàn** | Kiểm soát 100% giao diện và dữ liệu |
| **Không giới hạn** | Không có hạn ngạch request |
| **Bảo mật** | Dữ liệu được lưu trữ nội bộ |
| **Cộng đồng mạnh** | Hỗ trợ từ cộng đồng toàn cầu |

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (React)                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │         MapLibre GL JS / Mapbox GL JS           │   │
│  │        (Map Rendering Engine)                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                     │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Tile Server  │  │   Pelias     │  │     OSRM     │ │
│  │ (Tiles API)  │  │ (Geocoding)  │  │  (Routing)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         ↓                 ↓                  ↓         │
│  ┌─────────────────────────────────────────────────┐  │
│  │              OpenMapTiles Engine                │  │
│  │        (Generate & Serve Vector Tiles)          │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         OpenStreetMap (OSM) Database             │  │
│  │              PostgreSQL + PostGIS                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Công nghệ sử dụng

### Frontend Stack

| Công nghệ | Phiên bản | Mục đích | Tài liệu |
|-----------|-----------|----------|----------|
| **MapLibre GL JS** | 3.x | Engine hiển thị bản đồ | [Docs](https://maplibre.org/maplibre-gl-js-docs/) |
| **React** | 18.x | Framework UI | [Docs](https://react.dev/) |
| **TypeScript** | 5.x | Type safety | [Docs](https://www.typescriptlang.org/) |
| **Tailwind CSS** | 3.x | Styling | [Docs](https://tailwindcss.com/) |

### Backend Stack

| Công nghệ | Mục đích | Thay thế cho |
|-----------|----------|--------------|
| **OpenMapTiles** | Tạo và phục vụ vector tiles | Google Maps Tiles |
| **Pelias** | Geocoding & Reverse Geocoding | Google Geocoding API |
| **OSRM** | Tính toán lộ trình dẫn đường | Google Directions API |
| **Nominatim** | Tìm kiếm địa điểm (alternative) | Google Places API |
| **PostgreSQL + PostGIS** | Cơ sở dữ liệu địa lý | - |

### Data Source

- **OpenStreetMap (OSM)**: Dữ liệu bản đồ cộng đồng
- **OpenAddresses**: Dữ liệu địa chỉ bổ sung cho Pelias

---

## 💻 Yêu cầu hệ thống

### Môi trường phát triển

```bash
- Node.js >= 18.x
- Docker >= 24.x
- Docker Compose >= 2.x
- Ít nhất 16GB RAM (khuyến nghị 32GB)
- 100GB dung lượng trống (để lưu OSM data)
- CPU: 4 cores trở lên
```

### Môi trường production

```bash
- Linux Server (Ubuntu 22.04 LTS khuyến nghị)
- 32GB+ RAM
- 500GB+ SSD
- CPU: 8+ cores
- Nginx/Apache reverse proxy
```

---

## 🚀 Hướng dẫn cài đặt

### Bước 1: Clone Repository

```bash
git clone https://github.com/sme-team/navigation-openmap.git
cd open-map-navigation
```

### Bước 2: Cài đặt Backend Services

#### 2.1. Cài đặt OpenMapTiles

```bash
# Clone OpenMapTiles
git clone https://github.com/openmaptiles/openmaptiles.git
cd openmaptiles

# Download dữ liệu OSM (ví dụ: Vietnam)
./quickstart.sh vietnam

# Hoặc download toàn cầu (cần nhiều thời gian và dung lượng)
./quickstart.sh planet
```

#### 2.2. Cài đặt Pelias (Geocoding)

```bash
# Clone Pelias
git clone https://github.com/pelias/docker.git pelias
cd pelias

# Cấu hình cho Vietnam
cp .env.example .env
# Chỉnh sửa .env với region của bạn

# Download dữ liệu và build
pelias compose pull
pelias elastic start
pelias elastic wait
pelias elastic create
pelias download all
pelias prepare all
pelias import all

# Khởi động services
pelias compose up
```

#### 2.3. Cài đặt OSRM (Routing)

```bash
# Download OSRM Docker
docker pull ghcr.io/project-osrm/osrm-backend

# Download dữ liệu OSM
wget http://download.geofabrik.de/asia/vietnam-latest.osm.pbf

# Tiền xử lý dữ liệu
docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend \
  osrm-extract -p /opt/car.lua /data/vietnam-latest.osm.pbf

docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend \
  osrm-partition /data/vietnam-latest.osrm

docker run -t -v "${PWD}:/data" ghcr.io/project-osrm/osrm-backend \
  osrm-customize /data/vietnam-latest.osrm

# Khởi động OSRM
docker run -t -i -p 5000:5000 -v "${PWD}:/data" \
  ghcr.io/project-osrm/osrm-backend \
  osrm-routed --algorithm mld /data/vietnam-latest.osrm
```

### Bước 3: Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Tạo file .env
cp .env.example .env
```

Cấu hình `.env`:

```env
# API Endpoints
VITE_TILES_API=http://localhost:8080
VITE_GEOCODING_API=http://localhost:4000
VITE_ROUTING_API=http://localhost:5000

# Map Configuration
VITE_MAP_CENTER_LAT=16.0544
VITE_MAP_CENTER_LNG=108.2022
VITE_MAP_ZOOM=12
VITE_MAP_STYLE=style.json
```

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

### Bước 4: Thiết lập Nginx Reverse Proxy (Production)

```nginx
# /etc/nginx/sites-available/openmap

upstream tiles_backend {
    server localhost:8080;
}

upstream geocoding_backend {
    server localhost:4000;
}

upstream routing_backend {
    server localhost:5000;
}

server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/openmap/dist;
        try_files $uri $uri/ /index.html;
    }

    # Tiles API
    location /tiles/ {
        proxy_pass http://tiles_backend/;
        proxy_cache tiles_cache;
        proxy_cache_valid 200 7d;
    }

    # Geocoding API
    location /api/geocoding/ {
        proxy_pass http://geocoding_backend/;
    }

    # Routing API
    location /api/routing/ {
        proxy_pass http://routing_backend/;
    }
}
```

---

## 📁 Cấu trúc dự án

```
open-map-navigation/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map/
│   │   │   │   ├── MapContainer.tsx
│   │   │   │   ├── MapControls.tsx
│   │   │   │   └── MapLayers.tsx
│   │   │   ├── Geocoding/
│   │   │   │   ├── SearchBox.tsx
│   │   │   │   └── AddressDisplay.tsx
│   │   │   └── Routing/
│   │   │       ├── RoutePanel.tsx
│   │   │       └── DirectionsRenderer.tsx
│   │   ├── services/
│   │   │   ├── mapService.ts
│   │   │   ├── geocodingService.ts
│   │   │   └── routingService.ts
│   │   ├── hooks/
│   │   │   ├── useMap.ts
│   │   │   ├── useGeocoding.ts
│   │   │   └── useRouting.ts
│   │   ├── types/
│   │   │   └── map.types.ts
│   │   └── App.tsx
│   ├── public/
│   │   └── styles/
│   │       └── map-style.json
│   └── package.json
├── backend/
│   ├── docker-compose.yml
│   ├── openmaptiles/
│   ├── pelias/
│   └── osrm/
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
└── README.md
```

---

## ⚡ Tính năng

### ✅ Đã hoàn thành

- [x] Hiển thị bản đồ tương tác với MapLibre GL
- [x] Pan, Zoom, Rotate bản đồ
- [x] Vector tiles rendering
- [x] Geocoding (tìm địa điểm từ text)
- [x] Reverse Geocoding (tìm địa chỉ từ tọa độ)
- [x] Tính toán route giữa 2 điểm
- [x] Hiển thị route trên bản đồ
- [x] Geolocation (định vị người dùng)

### 🚧 Đang phát triển

- [ ] Turn-by-turn navigation
- [ ] Realtime traffic data
- [ ] Multiple route alternatives
- [ ] Offline maps
- [ ] 3D buildings
- [ ] Custom map styles editor

### 💡 Kế hoạch tương lai

- [ ] Mobile app (React Native)
- [ ] Voice navigation
- [ ] POI search (restaurants, hotels, etc.)
- [ ] User-generated content
- [ ] Integration with public transport data

---

## 📚 API Documentation

### Tiles API

```http
GET /tiles/{z}/{x}/{y}.pbf
```

**Response**: Vector tile in Mapbox Vector Tile format

### Geocoding API

#### Forward Geocoding

```http
GET /api/geocoding/search?text={address}
```

**Parameters:**
- `text` (required): Địa chỉ cần tìm
- `size` (optional): Số kết quả trả về (default: 10)

**Response:**
```json
{
  "features": [
    {
      "geometry": {
        "coordinates": [108.2022, 16.0544]
      },
      "properties": {
        "label": "30 Bế Văn Đàn, Đà Nẵng, Vietnam",
        "name": "30 Bế Văn Đàn"
      }
    }
  ]
}
```

#### Reverse Geocoding

```http
GET /api/geocoding/reverse?point.lat={lat}&point.lon={lon}
```

**Parameters:**
- `point.lat` (required): Vĩ độ
- `point.lon` (required): Kinh độ

### Routing API

```http
GET /api/routing/route/v1/driving/{lon1},{lat1};{lon2},{lat2}
```

**Parameters:**
- `overview` (optional): full|simplified|false
- `steps` (optional): true|false
- `geometries` (optional): geojson|polyline|polyline6

**Response:**
```json
{
  "code": "Ok",
  "routes": [
    {
      "geometry": {...},
      "distance": 5420.3,
      "duration": 892.5
    }
  ]
}
```

---

## 🤝 Đóng góp

Chúng tôi rất hoan nghênh mọi đóng góp! Vui lòng đọc [CONTRIBUTING.md](docs/CONTRIBUTING.md) để biết chi tiết.

### Quy trình đóng góp

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

---

## 📖 Tài liệu tham khảo

- [MapLibre GL JS Documentation](https://maplibre.org/maplibre-gl-js-docs/)
- [OpenMapTiles Schema](https://openmaptiles.org/schema/)
- [Pelias Documentation](https://github.com/pelias/documentation)
- [OSRM Documentation](http://project-osrm.org/)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)

---

## 📄 License

Dự án này được phân phối dưới giấy phép GNU GPLv3. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 🙏 Acknowledgments

- **OpenStreetMap Contributors** - Cung cấp dữ liệu bản đồ
- **MapLibre Community** - Map rendering engine
- **Pelias Team** - Geocoding solution
- **OSRM Project** - Routing engine
- **OpenMapTiles** - Tile generation tools

---

## 📞 Liên hệ

- **Email**: cuongdq3500888@gmail.com
- **Issues**: [GitHub Issues](https://github.com/sme-team/navigation-openmap/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sme-team/navigation-openmap/discussions)

---

## ⭐ Hỗ trợ dự án

Nếu dự án này hữu ích với bạn, hãy cho chúng tôi một ⭐️ trên GitHub!

[![Star on GitHub](https://img.shields.io/github/stars/sme-team/navigation-openmap?style=social)](https://github.com/sme-team/navigation-openmap)

---

**Made with ❤️ by Open Source Community**