import AdminSidebar from "@/app/Components/admin/AdminSidebar";
import "./admin.css";
import "maplibre-gl/dist/maplibre-gl.css";

export default function AdminLayout({ children }) {
    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}