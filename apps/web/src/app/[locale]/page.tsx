// ./src/app/[locale]/page.tsx
import { ToastProvider } from "@/components/common/Toast";
import MapWrapper from "@/components/map/MapWrapper";

interface MapPageProps {
  params: Promise<{
    locale: string; // cho ngôn ngữ
    id: string; // cho id của guest có hiệu lực một thời gian
  }>;
  searchParams: Promise<{
    query?: string;
    start_point?: string;
    end_point?: string;
  }>;
}

export default async function MapPage({ params, searchParams }: MapPageProps) {
  const { id } = await params;
  const { query } = await searchParams;

  return (
    <main className="flex flex-col h-screen">
      <div className="flex-1 relative">
        {/* <ToastProvider> */}
          <MapWrapper id={id} query={query} />
        {/* </ToastProvider> */}
      </div>
    </main>
  );
}
