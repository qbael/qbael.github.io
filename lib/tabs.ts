export type NavigationOrigin =
  | 'initial'
  | 'history'
  | 'explorer'
  | 'shortcut'
  | 'drawer'
  | 'tab';

export type WorkspaceState<T extends string> = {
  tabs: T[];
  active: T;
};

export function openTab<T extends string>(
  workspace: Readonly<{ tabs: readonly T[]; active: T }>,
  id: T,
): WorkspaceState<T> {
  return {
    tabs: workspace.tabs.includes(id)
      ? [...workspace.tabs]
      : [...workspace.tabs, id],
    active: id,
  };
}

export function closeTab<T extends string>(
  workspace: Readonly<{ tabs: readonly T[]; active: T }>,
  closed: T,
  fallback: T,
) {
  const closedIndex = workspace.tabs.indexOf(closed);
  const remaining = workspace.tabs.filter((id) => id !== closed);

  if (remaining.length === 0) {
    return { tabs: [fallback], active: fallback, focus: fallback };
  }

  const focus =
    remaining[Math.min(Math.max(closedIndex, 0), remaining.length - 1)];
  return {
    tabs: remaining,
    active: workspace.active === closed ? focus : workspace.active,
    focus,
  };
}

export function resolveFile<T extends string>(
  value: string | null,
  validFiles: readonly T[],
  fallback: T,
): T {
  return validFiles.includes(value as T) ? (value as T) : fallback;
}

export function shouldFocusHeading(origin: NavigationOrigin) {
  return origin === 'explorer' || origin === 'shortcut';
}

export function resolveDrawerFocus<T extends string, E, F>(
  pending: T | null,
  findHeading: (id: T) => E | null,
  fallback: F,
): E | F {
  return (pending ? findHeading(pending) : null) ?? fallback;
}

export function shouldHandleNavigation(event: {
  button: number;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}) {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

export function tryNavigation(action: () => void) {
  try {
    action();
    return true;
  } catch {
    return false;
  }
}
