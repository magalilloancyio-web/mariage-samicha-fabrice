"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Divider, Flowers } from "@/components/Ornaments";
import { QrCode, siteUrl } from "@/components/QrCode";
import { WEDDING } from "@/lib/config";

/** Carte A5 à imprimer et poser sur les tables. */
export default function QrPage() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(siteUrl()), []);

  async function downloadPng() {
    const data = await QRCode.toDataURL(siteUrl(), { width: 1600, margin: 2, color: { dark: "#5a3518", light: "#ffffff" } });
    const a = document.createElement("a");
    a.href = data;
    a.download = "qr-code-mariage-samicha-fabrice.png";
    a.click();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center gap-6 px-4 py-8 print:p-0">
      <style>{`@page { size: A5 portrait; margin: 0; }`}</style>

      <div className="no-print flex w-full max-w-md flex-col gap-3">
        <button className="btn-primary" onClick={() => window.print()}>Imprimer la carte (A5)</button>
        <button className="btn-secondary" onClick={downloadPng}>Télécharger le QR code seul (PNG)</button>
        <p className="text-center text-sm text-brun/60">Astuce : imprimez sur papier kraft ou crème pour rappeler le faire-part.</p>
      </div>

      {/* Carte A5 : 148 × 210 mm */}
      <article className="relative flex h-[210mm] w-[148mm] shrink-0 origin-top flex-col items-center overflow-hidden bg-creme px-[14mm] pt-[16mm] text-center shadow-xl max-[600px]:scale-[.62] max-[600px]:-mb-[80mm] print:scale-100 print:shadow-none print:m-0">
        <Flowers className="absolute -right-3 -bottom-2 w-[48mm]" />
        <Flowers className="absolute -left-3 -top-2 w-[34mm] rotate-180" flip />

        <p className="font-serif text-[13pt] uppercase tracking-[.3em] text-terra-fonce">Le mariage de</p>
        <h1 className="mt-[3mm] font-script text-[40pt] leading-none text-terra">{WEDDING.title}</h1>
        <Divider className="mt-[5mm]" />
        <p className="mt-[5mm] font-serif text-[22pt] font-semibold text-terra-fonce">Partagez vos photos&nbsp;!</p>

        <div className="mt-[6mm] rounded-[5mm] border border-sable bg-papier p-[5mm]">
          <QrCode className="size-[56mm] [&_svg]:size-full" />
        </div>

        <ol className="mt-[7mm] space-y-[1.5mm] font-serif text-[13pt] text-brun">
          <li>1. Scannez avec l&apos;appareil photo de votre téléphone</li>
          <li>2. Indiquez votre prénom et votre nom</li>
          <li>3. Photographiez, c&apos;est envoyé&nbsp;!</li>
        </ol>
        <p className="mt-[4mm] text-[9pt] text-brun/60">Aucune application à installer · {url.replace(/^https?:\/\//, "")}</p>
        <p className="absolute bottom-[10mm] left-0 right-0 font-serif text-[11pt] text-terra-fonce">
          {WEDDING.shortDates} · {WEDDING.venue}
        </p>
      </article>
    </main>
  );
}
