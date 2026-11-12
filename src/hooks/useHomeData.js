import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { todayIso } from '@/lib/format';

const INITIAL = {
  loading: true,
  sections: [],
  events: [],
  featured: [],
  posts: [],
  albums: [],
  products: [],
  sponsors: [],
  matches: [],
};

export default function useHomeData() {
  const [state, setState] = useState(INITIAL);

  useEffect(() => {
    let active = true;
    (async () => {
      let sections = [];
      try {
        const page = await base44.entities.HomeSection.filter({ visible: true }, { sort: 'order', limit: 40 });
        sections = page?.items || [];
      } catch (error) {
        sections = [];
      }
      if (!active) return;

      const types = new Set(sections.map((section) => section.section_type));
      const today = todayIso();
      const jobs = {};

      if (types.has('events')) {
        jobs.events = () =>
          base44.entities.Event.filter(
            { status: 'published', start_date: { $gte: today } },
            { sort: 'start_date', limit: 6 },
          );
      }
      if (types.has('featured_events')) {
        jobs.featured = () =>
          base44.entities.Event.filter({ status: 'published', featured: true }, { sort: 'start_date', limit: 3 });
      }
      if (types.has('news')) {
        jobs.posts = () =>
          base44.entities.Post.filter({ status: 'published' }, { sort: '-published_date', limit: 6 });
      }
      if (types.has('gallery')) {
        jobs.albums = () =>
          base44.entities.GalleryAlbum.filter({ published: true }, { sort: '-album_date', limit: 4 });
      }
      if (types.has('shop')) {
        jobs.products = () => base44.entities.Product.filter({ status: 'published' }, { sort: 'order', limit: 4 });
      }
      if (types.has('sponsors')) {
        jobs.sponsors = () => base44.entities.Sponsor.filter({ active: true }, { sort: 'order', limit: 8 });
      }
      if (types.has('matches') || types.has('calendar')) {
        jobs.matches = () => base44.entities.Match.filter({ status: 'scheduled' }, { sort: 'match_date', limit: 6 });
      }

      const keys = Object.keys(jobs);
      const settled = await Promise.allSettled(keys.map((key) => jobs[key]()));
      if (!active) return;

      const next = { ...INITIAL, loading: false, sections };
      keys.forEach((key, index) => {
        const result = settled[index];
        next[key] = result.status === 'fulfilled' ? result.value?.items || [] : [];
      });
      setState(next);
    })();
    return () => {
      active = false;
    };
  }, []);

  return state;
}