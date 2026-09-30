import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Hotel } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold font-serif text-white">
                {this.props.fallbackTitle || 'Grand Horizon Encountered an Issue'}
              </h2>
              <p className="text-xs text-slate-400">
                An unexpected operational error occurred while rendering the management workspace.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-rose-400 text-left overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex items-center justify-center gap-3">
              <Button
                variant="gold"
                size="md"
                onClick={this.handleReset}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Reload Dashboard
              </Button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-800">
              <Hotel className="w-3.5 h-3.5" />
              <span>Grand Horizon Executive Hotel OS</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
