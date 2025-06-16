import BrandForm from "./components/BrandForm";
import BrandList from "./components/BrandList";

export default function Page() {
    return (
        <main className="p-5 flex gap-5">
            <BrandForm />
            <BrandList />
        </main>
    );
}