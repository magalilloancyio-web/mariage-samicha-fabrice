"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");
}

/** QR code pointing to the site home page, in the wedding colours. */
export function QrCode({ className = "", dark = "#5a3518", light = "#00000000" }: { className?: string; dark?: string; light?: string }) {
  const [svg, setSvg] = useState("");
  useEffect(() => {
    QRCode.toString(siteUrl(), { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark, light } }).then(setSvg);
  }, [dark, light]);
  return <div className={className} role="img" aria-label="QR code vers le site photos" dangerouslySetInnerHTML={{ __html: svg }} />;
}
