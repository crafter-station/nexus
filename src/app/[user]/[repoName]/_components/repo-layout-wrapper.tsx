"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import {
  clampSidebarWidth,
  DEFAULT_WIDTH,
  MAX_WIDTH,
  REPO_SIDEBAR_COOKIE,
  SNAP_THRESHOLD,
} from "../_lib/repo-sidebar-persistence";

type RepoLayoutWrapperProps = {
  sidebar: ReactNode;
  children: ReactNode;
  initialCollapsed?: boolean;
  initialWidth?: number;
  owner?: string;
  repo?: string;
};

export default function RepoLayoutWrapper({
  sidebar,
  children,
  initialCollapsed = false,
  initialWidth = DEFAULT_WIDTH,
}: RepoLayoutWrapperProps) {
  const normalizedInitialWidth = useMemo(
    () => clampSidebarWidth(initialWidth),
    [initialWidth]
  );
  const [sidebarWidth, setSidebarWidth] = useState(
    initialCollapsed ? 0 : normalizedInitialWidth
  );
  const [isDragging, setIsDragging] = useState(false);
  const lastOpenWidthRef = useRef(normalizedInitialWidth);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const hasRealDragRef = useRef(false);

  const collapsed = sidebarWidth === 0;

  useEffect(() => {
    const persistedWidth = collapsed
      ? lastOpenWidthRef.current
      : clampSidebarWidth(sidebarWidth);
    const payload = JSON.stringify({
      collapsed,
      width: persistedWidth,
    });

    document.cookie = `${REPO_SIDEBAR_COOKIE}=${encodeURIComponent(payload)}; path=/; max-age=31536000; samesite=lax`;
  }, [collapsed, sidebarWidth]);

  const onHandleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    startXRef.current = event.clientX;
    startWidthRef.current = collapsed ? 0 : sidebarWidth;
    hasRealDragRef.current = false;
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      if (Math.abs(delta) > 2) {
        hasRealDragRef.current = true;
      }
      const nextWidth = startWidthRef.current + delta;
      const clamped = clampSidebarWidth(nextWidth);
      if (nextWidth < SNAP_THRESHOLD) {
        setSidebarWidth(0);
        return;
      }
      lastOpenWidthRef.current = clamped;
      setSidebarWidth(clamped);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
  };

  return (
    <div className="flex flex-1 min-h-0">
      <aside
        role="complementary"
        aria-label="Repository sidebar"
        className="hidden lg:block border-r border-border-default overflow-y-auto transition-[width] duration-200 ease-out shrink-0"
        style={{ width: `${sidebarWidth}px` }}
      >
        {!collapsed ? <div className="p-6">{sidebar}</div> : null}
      </aside>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        title="Drag to resize sidebar"
        onMouseDown={onHandleMouseDown}
        className={`hidden lg:flex w-1 shrink-0 cursor-col-resize transition-colors ${
          collapsed ? "bg-border-default/40 hover:bg-border-default/70" : "bg-transparent hover:bg-border-default/70"
        } ${isDragging ? "bg-border-default" : ""}`}
      />

      <main role="main" className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
