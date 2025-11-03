# DatabaseManager - Cấu trúc thư mục

## 📁 Cấu trúc File

```
src/Components/DatabaseManager/
│
├── DatabaseManager.tsx          # Component chính
│
├── types.ts                     # Định nghĩa TypeScript interfaces
│
├── constants.ts                 # Mock data và constants
│
├── hooks/
│   └── useDatabase.ts          # Custom hook quản lý database state & logic
│
├── components/
│   ├── index.ts                # Barrel export cho components
│   ├── Dropdown.tsx            # Dropdown component
│   ├── DataTable.tsx           # Bảng hiển thị dữ liệu
│   ├── FormModal.tsx           # Modal form tạo/sửa record
│   └── ImportModal.tsx         # Modal import từ Google Sheets
│
└── README.md                   # File này
```

## 🔧 Chi tiết từng file

### **DatabaseManager.tsx** - Component chính
- Kết hợp tất cả các component con
- Xử lý các actions: save, delete, import
- Quản lý modal states

### **types.ts** - Type Definitions
- Chứa tất cả TypeScript interfaces
- Định nghĩa types cho: Column, Table, Database, Props

### **constants.ts** - Data & Constants
- Mock database schemas
- Các constants khác (nếu có)

### **hooks/useDatabase.ts** - Custom Hook
- Quản lý toàn bộ database state
- Logic xử lý: select database, select table
- Generate mock data
- Clear table functionality

### **components/** - UI Components

#### **Dropdown.tsx**
- Component dropdown tái sử dụng
- Hỗ trợ dark mode
- Disabled state

#### **DataTable.tsx**
- Hiển thị dữ liệu dạng bảng
- Click vào row để edit
- Empty state

#### **FormModal.tsx**
- Modal tạo mới / chỉnh sửa record
- Auto-detect field types
- Validation và error handling
- Delete functionality

#### **ImportModal.tsx**
- Import dữ liệu từ Google Sheets
- Hướng dẫn sử dụng
- Form validation

## 🎯 Ưu điểm của cấu trúc này

1. **Tách biệt rõ ràng**: Logic, UI, types riêng biệt
2. **Dễ maintain**: Sửa một phần không ảnh hưởng phần khác
3. **Tái sử dụng**: Components có thể dùng lại ở nơi khác
4. **Testing**: Dễ dàng test từng phần
5. **Mở rộng**: Thêm features mới dễ dàng
6. **Type-safe**: TypeScript đảm bảo type safety

## 🚀 Cách sử dụng

```tsx
import DatabaseManager from './Components/DatabaseManager/DatabaseManager';

function App() {
  return <DatabaseManager />;
}
```

## 📝 Notes

- Tất cả components đều hỗ trợ dark mode
- Sử dụng Tailwind CSS cho styling
- Icons từ lucide-react
- Responsive design
