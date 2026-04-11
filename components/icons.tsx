type IconProps = React.SVGProps<SVGSVGElement>;

export const Icons = {
  lock: (props: IconProps) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="9" width="12" height="9" rx="2" />
      <path d="M7 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  ),
  eyeOff: (props: IconProps) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5z" />
      <circle cx="10" cy="10" r="2.5" />
      <line x1="3" y1="3" x2="17" y2="17" />
    </svg>
  ),
  trash: (props: IconProps) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="3 6 5 6 17 6" />
      <path d="M8 6V4h4v2" />
      <path d="M5 6l1 11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-11" />
      <line x1="9" y1="10" x2="9" y2="14" />
      <line x1="11" y1="10" x2="11" y2="14" />
    </svg>
  ),
  grid: (props: IconProps) => (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" {...props}>
      <rect x="0" y="0" width="5.5" height="5.5" rx="1.2" />
      <rect x="7.5" y="0" width="5.5" height="5.5" rx="1.2" />
      <rect x="0" y="7.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.2" />
    </svg>
  ),
  sidebar: (props: IconProps) => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" {...props}>
      <rect x="0" y="1" width="7" height="10" rx="1" opacity="0.4" />
      <rect x="8" y="1" width="4" height="10" rx="1" />
    </svg>
  ),
  close: (props: IconProps) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <line x1="1" y1="1" x2="13" y2="13" />
      <line x1="13" y1="1" x2="1" y2="13" />
    </svg>
  ),

  // Chevron down (dashboard-view.tsx)
  chevronDown: (props: IconProps) => (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
  ),
  GitHub: (props: IconProps) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  ),
};
