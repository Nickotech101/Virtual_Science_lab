import React from "react";
import { AlertOctagon, RefreshCcw, FlaskConical } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
          <div className="w-full max-w-2xl rounded-3xl border border-red-200 bg-white p-8 shadow-2xl dark:border-red-900/30 dark:bg-slate-900 md:p-12">
            
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute -inset-1 animate-pulse rounded-full bg-red-400/20 blur-xl"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20 border-4 border-white dark:border-slate-800 shadow-inner">
                  <AlertOctagon className="h-10 w-10 text-red-600 dark:text-red-400 absolute top-2 right-2" />
                  <FlaskConical className="h-12 w-12 text-slate-800 dark:text-slate-300 opacity-50" />
                </div>
              </div>
            </div>
            
            <h1 className="mb-4 text-center text-4xl font-black text-slate-800 dark:text-white">
              Oops! A reaction went wrong.
            </h1>
            
            <p className="mb-8 text-center text-lg text-slate-600 dark:text-slate-400">
              The Virtual Science Lab encountered an unexpected error and had to stop. Don't worry, your progress is safe. Let's clean up and try again!
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center space-x-3 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 px-8 py-4 font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-xl"
              >
                <RefreshCcw className="h-5 w-5" />
                <span>Reload Lab Environment</span>
              </button>
            </div>
            
            {/* Developer Details */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left text-sm dark:border-slate-800 dark:bg-slate-950/50 overflow-auto max-h-64">
                <p className="font-bold text-red-600 dark:text-red-400 uppercase tracking-wider text-xs mb-2">Developer Logs</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{this.state.error.toString()}</p>
                <pre className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-mono">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
