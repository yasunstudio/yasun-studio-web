import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

/** GET-form search box: URL is the single source of truth for list state. */
export function SearchInput({ defaultValue, placeholder = "Cari…" }: { defaultValue?: string; placeholder?: string }) {
  return (
    <form className="relative w-full sm:max-w-xs">
      <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input name="q" defaultValue={defaultValue} placeholder={placeholder} className="bg-background pl-9" />
    </form>
  );
}
