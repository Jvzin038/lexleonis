import React, { useEffect, useState } from 'react';
import { Outlet } from '@/lib/router-compat';
import { base44 } from '@/api/base44Client';
import { useSite } from '@/lib/site';
import { useStaff } from '@/lib/useStaff';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import MaintenanceNotice from './MaintenanceNotice';
import SiteAssistant from '@/components/ai/SiteAssistant';

/** @param {{ children?: import("react").ReactNode }} props */
export default function PublicLayout({ children }) {
  const { settings } = useSite();
  const { isStaff } = useStaff();
  const [legalPages, setLegalPages] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const page = await base44.entities.StaticPage.filter(
          { status: 'published', show_in_footer: true },
          { sort: 'order', limit: 20 },
        );
        if (active) setLegalPages(page?.items || []);
      } catch (error) {
        if (active) setLegalPages([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const maintenance = Boolean(settings.maintenance_mode) && !isStaff;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <a href="#conteudo" className="skip-link">
        Ir para o conteúdo
      </a>

      {settings.announcement_active && settings.announcement_text && (
        <div className="bg-brand-gold px-4 py-2 text-center text-sm font-medium text-brand-ink">
          {settings.announcement_text}
        </div>
      )}

      <SiteHeader />

      <main id="conteudo" className="flex-1">
        {maintenance ? <MaintenanceNotice /> : (children ?? <Outlet />)}
      </main>

      {!maintenance && <SiteFooter legalPages={legalPages} />}
    </div>
  );
}