export function PoweredByViable() {
  return (
    <div className="flex items-center space-x-1 text-xs font-medium">
      <span className="text-muted-foreground">Powered by</span>
      <span className="bg-gradient-to-r from-chart-1 to-chart-3 bg-clip-text text-transparent font-semibold animate-pulse tracking-wide">
        Viable
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-chart-1/20 to-chart-3/20 blur-sm rounded-lg opacity-50 animate-cosmic-glow -z-10"></div>
    </div>
  );
}