import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { NavItem } from './sidebarNav.config';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
}

export function SidebarNavItem({ item, collapsed }: SidebarNavItemProps): JSX.Element {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      aria-label={item.label}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aviation-400',
          isActive
            ? 'bg-aviation-600/20 text-white'
            : 'text-surface-300 hover:bg-surface-700/50 hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Indicador activo */}
          {isActive && (
            <motion.div
              layoutId="activeNavIndicator"
              className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-aviation-400"
              initial={false}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}

          {/* Ícono */}
          <Icon
            size={18}
            className={cn(
              'shrink-0 transition-colors',
              isActive ? 'text-aviation-400' : 'text-surface-400 group-hover:text-surface-200'
            )}
            aria-hidden
          />

          {/* Label - oculto cuando collapsed */}
          {!collapsed && (
            <span className="truncate">{item.label}</span>
          )}

          {/* Badge */}
          {!collapsed && item.badge != null && item.badge > 0 && (
            <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-aviation-500 px-1.5 text-2xs font-semibold text-white">
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}

          {/* Tooltip en modo collapsed */}
          {collapsed && (
            <div className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md bg-surface-800 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              {item.label}
              {item.badge != null && item.badge > 0 && (
                <span className="ml-1.5 rounded-full bg-aviation-500 px-1.5 py-0.5 text-2xs">
                  {item.badge}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}
