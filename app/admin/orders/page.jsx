import AdminOnly from "../components/AdminOnly";
import OrderList from "./components/OrderList";

export default function Page() {
    return (
        <AdminOnly>
        <main className="p-3 md:p-6">
            <OrderList />
        </main>
        </AdminOnly>
    );
}