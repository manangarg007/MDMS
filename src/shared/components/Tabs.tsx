import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  badge?: ReactNode;
  disabled?: boolean;
  panelId?: string;
}

export interface TabsProps {
  id: string;
  tabs: TabItem[];
  activeTabId: string;
  onChange: (tabId: string) => void;
  ariaLabel?: string;
  className?: string;
}

export function Tabs({
  id,
  tabs,
  activeTabId,
  onChange,
  ariaLabel = 'Page sections',
  className = '',
}: TabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  function focusTab(tabId: string) {
    tabRefs.current[tabId]?.focus();
    onChange(tabId);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, tabId: string) {
    const enabledTabs = tabs.filter((tab) => !tab.disabled);
    if (enabledTabs.length === 0) return;

    const currentIndex = enabledTabs.findIndex((tab) => tab.id === tabId);
    let nextIndex: number | undefined;

    if (event.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1 + enabledTabs.length) % enabledTabs.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = enabledTabs.length - 1;
    }

    if (nextIndex !== undefined) {
      event.preventDefault();
      focusTab(enabledTabs[nextIndex].id);
    }
  }

  return (
    <div
      id={id}
      role="tablist"
      aria-label={ariaLabel}
      className={`flex max-w-full gap-1 overflow-x-auto border-b border-[var(--border-subtle)] ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[tab.id] = element; }}
            id={`${id}-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={tab.panelId}
            tabIndex={isActive ? 0 : -1}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, tab.id)}
            className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 ${isActive ? 'border-[var(--accent)] text-[var(--accent-text)]' : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'}`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined ? (
              <span
                aria-hidden="true"
                className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-[var(--accent-soft)] text-[var(--accent-text)]' : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]'}`}
              >
                {tab.count}
              </span>
            ) : null}
            {tab.badge ? <span aria-hidden="true">{tab.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
