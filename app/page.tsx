import Image from "next/image";
import { WEDDING } from "@/lib/config";
import { Divider, Flowers } from "@/components/Ornaments";
import { WelcomeForm } from "./WelcomeForm";
import { MariesLink } from "@/components/MariesLink";
import couple from "@/public/couple.jpg";

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden sm:max-w-lg">
      <div className="relative h-[46dvh] min-h-72 w-full">
        <Image
          src={couple}
          alt={`${WEDDING.bride} et ${WEDDING.groom}`}
          fill
          priority
          placeholder="blur"
          sizes="(max-width: 448px) 100vw, 448px"
          className="object-cover object-[50%_28%]"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent to-creme" />
      </div>

      <Flowers className="pointer-events-none absolute right-[-18px] top-[40dvh] w-32 opacity-90" />

      <div className="fade-up relative -mt-16 flex flex-1 flex-col px-6 pb-8 text-center">
        <h1 className="font-script text-[4.2rem] leading-[.95] text-terra sm:text-[5rem]">
          {WEDDING.bride} <span className="text-[3.2rem]">&amp;</span> {WEDDING.groom}
        </h1>
        <p className="mt-2 font-script text-[2.6rem] leading-none text-terra-fonce">se marient !</p>

        <Divider className="mt-5" />
        <p className="mt-4 font-serif text-[1.75rem] font-semibold tracking-wide text-terra-fonce">{WEDDING.shortDates}</p>
        <p className="font-serif text-2xl text-brun/85">
          {WEDDING.venue} · Brissac
        </p>
        <Divider className="mt-3" />

        <p className="mx-auto mt-6 max-w-sm text-xl leading-relaxed text-brun/90">
          Immortalisez ces moments avec nous&nbsp;! Prenez des photos et partagez-les ici, pendant la fête ou après.
        </p>

        <WelcomeForm />

        <MariesLink className="mx-auto mt-auto pt-10" />
      </div>
    </main>
  );
}
