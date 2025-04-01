import CreateOrderForm from "@/app/components/CreateOrderForm";

export default function Page() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">microcart</h1>
      <h2 className="text-2xl font-semibold mb-4">Create New Order</h2>
      <CreateOrderForm />
    </main>
  );
}
