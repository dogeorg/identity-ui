export function isUnauthedRoute() {
  const pathname = window.location.pathname;

  if (pathname.startsWith('/login')) {
    return true;
  }

  if (pathname.startsWith('/logout')) {
    return true;
  }
}

export function hasFlushParam() {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.has('flush');
}