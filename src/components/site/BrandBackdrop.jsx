import React from "react";
import { Image } from "@/components/ui/image";
import { useSite } from "@/lib/site";

const MASK = "radial-gradient(circle at 50% 50%, #000 30%, transparent 72%)";

/**
 * Fundo das telas de acesso: roxo profundo com a marca da atlética em versão
 * clara ao centro, suavizada por uma máscara radial, mais um leve degradê.
 * O arquivo da logo tem fundo preto opaco: com mix-blend-screen esse fundo
 * desaparece no roxo e restam apenas as partes claras da arte (marca d'água).
 * Usa a logo clara quando cadastrada e, na falta dela, a logo principal.
 */
export default function BrandBackdrop() {
  const { settings } = useSite();
  const logo = settings.logo_light_url || settings.logo_url;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/40" />
      {logo && (
        <div
          className="absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 opacity-50 mix-blend-screen"
          style={{ maskImage: MASK, WebkitMaskImage: MASK }}
        >
          <Image src={logo} alt="" fittingType="fit" className="h-full w-full" />
        </div>
      )}
    </div>
  );
}