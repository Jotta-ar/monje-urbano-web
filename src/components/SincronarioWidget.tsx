"use client";

import { useEffect, useState } from "react";
import { getSincronario, type Sincronario } from "@/lib/lunar";
import MoonIcon from "@/components/MoonIcon";

export default function SincronarioWidget() {
  const [data, setData] = useState<Sincronario | null>(null);

  useEffect(() => {
    setData(getSincronario());
  }, []);

  if (!data) return null;

  return (
    <div className="sincronario-float">
      <div className="sf-title">Sincronario 13 Lunas</div>
      <div className="sf-grid">
        <div className="sf-item">
          <label>Día</label>
          <span>{data.dia}</span>
        </div>
        <div className="sf-item">
          <label>Luna</label>
          <span>{data.luna}</span>
        </div>
      </div>
      <div className="sf-fase">
        <MoonIcon phase={data.fase} className="sf-moon" />
        {data.fase}
      </div>
      <div className="sf-tip">Sincronizate con los ritmos naturales</div>
    </div>
  );
}
