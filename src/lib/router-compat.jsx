// Small adapter so the ported pages can keep their original navigation calls
// (Link, NavLink, useNavigate, ...) while TanStack Router does the routing.
import { forwardRef, useCallback, useEffect, useMemo } from 'react';
import { Outlet as TsOutlet, useParams as tsUseParams, useRouter, useRouterState } from '@tanstack/react-router';

export const Outlet = TsOutlet;

function isExternal(to) {
  return typeof to === 'string' && /^(https?:|mailto:|tel:|\/\/)/i.test(to);
}

function toHref(to) {
  if (typeof to === 'string') return to;
  if (to && typeof to === 'object') return `${to.pathname || ''}${to.search || ''}${to.hash || ''}`;
  return '/';
}

export function useNavigate() {
  const router = useRouter();
  return useCallback((to, options = {}) => {
    if (typeof to === 'number') { router.history.go(to); return; }
    const href = toHref(to);
    if (isExternal(href)) { window.location.href = href; return; }
    if (options.replace) router.history.replace(href, options.state);
    else router.history.push(href, options.state);
  }, [router]);
}

export function useLocation() {
  const location = useRouterState({ select: (s) => s.location });
  return useMemo(() => ({
    pathname: location.pathname,
    search: location.searchStr || '',
    hash: location.hash ? `#${location.hash}` : '',
    state: location.state,
    key: location.state?.__TSR_key || location.href,
  }), [location]);
}

export function useNavigationType() {
  return 'PUSH';
}

export function useParams() {
  return tsUseParams({ strict: false });
}

export function useSearchParams() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const params = useMemo(() => new URLSearchParams(search), [search]);
  const setParams = useCallback((next, options) => {
    const value = typeof next === 'function' ? next(new URLSearchParams(search)) : next;
    const qs = new URLSearchParams(value).toString();
    navigate(`${pathname}${qs ? `?${qs}` : ''}`, options);
  }, [search, pathname, navigate]);
  return [params, setParams];
}

export const Link = forwardRef(function Link({ to, replace, state, onClick, target, reloadDocument, ...rest }, ref) {
  const navigate = useNavigate();
  const href = toHref(to);
  return (
    <a
      ref={ref}
      href={href}
      target={target}
      {...rest}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || reloadDocument || target === '_blank' || isExternal(href)) return;
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(href, { replace, state });
      }}
    />
  );
});

export const NavLink = forwardRef(function NavLink({ to, end, className, style, children, ...rest }, ref) {
  const { pathname } = useLocation();
  const target = toHref(to).split('?')[0];
  const isActive = end ? pathname === target : pathname === target || pathname.startsWith(target.endsWith('/') ? target : `${target}/`);
  const cls = typeof className === 'function' ? className({ isActive, isPending: false }) : className;
  const st = typeof style === 'function' ? style({ isActive, isPending: false }) : style;
  return (
    <Link ref={ref} to={to} className={cls} style={st} aria-current={isActive ? 'page' : undefined} {...rest}>
      {typeof children === 'function' ? children({ isActive, isPending: false }) : children}
    </Link>
  );
});

export function Navigate({ to, replace }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(to, { replace }); }, [to, replace, navigate]);
  return null;
}
