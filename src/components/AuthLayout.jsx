import React from "react";
import { Image } from "@/components/ui/image";
import { useSite } from "@/lib/site";
import BrandBackdrop from "@/components/site/BrandBackdrop";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  const { settings } = useSite();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-deep px-4 py-12 font-body">
      <BrandBackdrop />
      <div className="relative w-full max-w-md">
        <div className="text-center">
          {settings.logo_url ? (
            <Image
              src={settings.logo_url}
              alt={`Logo da ${settings.site_name}`}
              className="mx-auto h-24 w-auto object-contain mix-blend-screen"
              fittingType="fit"
            />
          ) : (
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/60 font-heading text-lg text-brand-gold">
              LL
            </span>
          )}
          <h1 className="mt-6 font-heading text-2xl uppercase tracking-tight text-white sm:text-3xl">{title}</h1>
          <div className="gavel-rule mx-auto mt-4" aria-hidden="true" />
          {subtitle && <p className="mt-4 text-sm leading-relaxed text-white/65">{subtitle}</p>}
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-2xl sm:p-8">{children}</div>

        {footer && <p className="mt-6 text-center text-sm text-white/75">{footer}</p>}
      </div>
    </div>
  );
}