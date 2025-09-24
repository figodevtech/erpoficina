// app/os/page.tsx
import { Suspense } from "react";
import {ListaOSDoSetor} from "./components/ListaOSDoSetor";

export const metadata = { title: "OS do meu setor" };

export default function Page() {
  return (
    <Suspense>
      <ListaOSDoSetor />
    </Suspense>
  );
}
