import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 text-white">
                    <div className="bg-red-900/30 p-8 rounded-2xl border border-red-500/50 max-w-2xl w-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-red-500/20 rounded-full">
                                <AlertTriangle size={32} className="text-red-500" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-red-100">Something went wrong</h1>
                                <p className="text-red-300">Application encountered a critical error</p>
                            </div>
                        </div>

                        {this.state.error && (
                            <div className="bg-black/50 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64 border border-stone-800">
                                <p className="text-red-400 font-bold mb-2">{this.state.error.toString()}</p>
                                <pre className="text-stone-500 whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors"
                        >
                            Clear Cache & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
