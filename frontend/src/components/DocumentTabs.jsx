import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Info, LayoutDashboard, Users, Receipt } from 'lucide-react';

const iconMap = { Info, LayoutDashboard, Users, Receipt };

export default function DocumentTabs() {
  const { id } = useParams();

  const tabs = useMemo(
    () => [
      {
        id: 'informatii',
        label: 'Informații',
        to: `/documents/${id}/informatii`,
        icon: 'Info',
      },
      {
        id: 'circulatie',
        label: 'Circulație',
        to: `/documents/${id}/circulatieDocument`,
        icon: 'LayoutDashboard',
      },
      {
        id: 'comentarii',
        label: 'Comentarii',
        to: `/documents/${id}/comentarii`,
        icon: 'Users',
      },
      {
        id: 'fisiere',
        label: 'Fișiere',
        to: `/documents/${id}/fisiere`,
        icon: 'Receipt',
      },
    ],
    [id],
  );

  // highlight position state
  const containerRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0 });

  // Recalculează highlight-ul când se schimbă ruta (tab-ul activ)
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const active = el.querySelector('[data-active="true"]');
    if (!active) return;

    const cRect = el.getBoundingClientRect();
    const aRect = active.getBoundingClientRect();
    setPill({ left: aRect.left - cRect.left, width: aRect.width });
  });

  // Recalculează la resize
  useLayoutEffect(() => {
    const onResize = () => {
      const el = containerRef.current;
      if (!el) return;
      const active = el.querySelector('[data-active="true"]');
      if (!active) return;

      const cRect = el.getBoundingClientRect();
      const aRect = active.getBoundingClientRect();
      setPill({ left: aRect.left - cRect.left, width: aRect.width });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative flex gap-1 rounded-2xl p-1 bg-gray-100 dark:bg-gray-900 shadow-inner"
      >
        {/* sliding highlight */}
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-white dark:bg-gray-800 shadow-sm transition-all duration-300 ease-out"
          style={{ left: pill.left, width: pill.width }}
        />

        {tabs.map((tab) => {
          const Icon = iconMap[tab.icon];

          return (
            <NavLink
              key={tab.id}
              to={tab.to} // IMPORTANT: absolut, nu relativ
              end // IMPORTANT: tab activ doar pe match exact
              className={({ isActive }) =>
                [
                  'relative z-10 flex-1 rounded-xl px-3 py-2',
                  'no-underline hover:no-underline', // fără underline
                  'transition-colors duration-200',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60',
                  'flex items-center justify-center gap-2',
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    data-active={isActive ? 'true' : 'false'}
                    className="absolute inset-0 rounded-xl"
                    aria-hidden="true"
                  />
                  {Icon ? (
                    <Icon
                      className={[
                        'h-4 w-4 transition-transform duration-200',
                        isActive ? 'text-blue-600' : 'text-gray-500',
                      ].join(' ')}
                    />
                  ) : null}
                  <span className="text-sm font-medium">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
