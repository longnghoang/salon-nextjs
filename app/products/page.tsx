export default function ProductsPage() {
  return (
    <div className="mx-auto flex w-full max-w-7xl animate-in flex-col gap-6 duration-700 fade-in">
      <header className="mt-4 border-b border-border pb-6">
        <h1 className="font-heading text-4xl tracking-tight text-foreground">
          Products
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage retail inventory and salon supplies.
        </p>
      </header>
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 py-12">
        <p className="text-sm tracking-widest text-muted-foreground uppercase">
          Products module under construction
        </p>
      </div>
    </div>
  );
}
