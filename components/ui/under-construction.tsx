import React from 'react';

interface UnderConstructionProps {
  pageName: string;
}

export function UnderConstruction({ pageName }: UnderConstructionProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-yellow-600"
        >
          <path d="M10.5 20.5 3 13l7.5-7.5" />
          <path d="m13.5 20.5 7.5-7.5-7.5-7.5" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold tracking-tight">{pageName} Page</h1>
      <p className="max-w-md text-muted-foreground">
        This page is currently under construction. Our team is working hard to bring you this feature soon.
      </p>
      <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-muted">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-primary"></div>
      </div>
    </div>
  );
}
