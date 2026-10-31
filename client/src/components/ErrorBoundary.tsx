import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an unhandled exception:', error, errorInfo);
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  handleNavigateHome = (): void => {
    window.location.href = '/app/overview';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <div className="metallic-card border border-white/20 rounded-2xl max-w-lg w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                {this.props.fallbackTitle || 'Section Encountered an Error'}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
                An unexpected state prevented this section from rendering properly. Your active event data is safe and unchanged.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-zinc-950 border border-white/10 font-mono text-[11px] text-zinc-400 text-left overflow-x-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="metallic-btn-secondary inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-white" />
                Reload Section
              </button>
              <button
                onClick={this.handleNavigateHome}
                className="metallic-btn-primary inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Go to Overview
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
