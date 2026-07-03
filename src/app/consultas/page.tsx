import { Suspense } from "react";
import ConsultasForm from "./ConsultasForm";

export default function ConsultasPage() {
  return (
    <Suspense fallback={null}>
      <ConsultasForm />
    </Suspense>
  );
}
