import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Ocurrió un error inesperado al renderizar este módulo.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[UI ErrorBoundary]:', error, info.componentStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, errorMessage: '' });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-10 mx-auto max-w-md rounded-2xl bg-white border border-rose-200 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 w-11 h-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Algo salió mal en esta vista</h3>
          <p className="mt-1.5 text-xs text-slate-500 break-words">{this.state.errorMessage}</p>
          <button
            onClick={this.handleRetry}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
