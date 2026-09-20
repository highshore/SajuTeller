export function hasMobileNavigation(path: string) {
  return !/^\/(business|locations|live-translation|messages)(\/|$)/.test(path);
}
