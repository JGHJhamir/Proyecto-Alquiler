import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Algo salió mal</h2>
                            <p className="text-slate-500 mb-6 text-sm">
                                Ha ocurrido un error inesperado.
                            </p>
                            <div className="w-full bg-slate-50 p-4 rounded-lg border border-slate-100 text-left overflow-auto max-h-48 mb-6">
                                <p className="font-mono text-xs text-red-600 break-all">
                                    {this.state.error && this.state.error.toString()}
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.replace('/')}
                                className="w-full py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                Volver al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
