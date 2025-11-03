// ./src/app/[locale]/admin/not-found.tsx
import { LocalizedLink } from "@/components/ui/LocalizedLink";

export default function AdminNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mt-4">
          Không tìm thấy trang
        </h2>
        <p className="text-gray-600 mt-2 mb-6">
          Trang admin bạn đang tìm kiếm không tồn tại.
        </p>
        <LocalizedLink
          href="/admin"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Về Dashboard
        </LocalizedLink>
      </div>
    </div>
  );
}

