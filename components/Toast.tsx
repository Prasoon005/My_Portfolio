"use client";

import { useEffect, useState } from "react";
import { onToast } from "@/lib/toast";

const VISIBLE_MS = 2200;

export default function Toast() {
  const [message, setMessage] = useState("");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let timer = 0;
    const off = onToast((next) => {
      setMessage(next);
      setShown(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setShown(false), VISIBLE_MS);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="toast" data-shown={shown || undefined}>
      <span aria-hidden className="toast-check">
        ✓
      </span>
      {message}
    </div>
  );
}
