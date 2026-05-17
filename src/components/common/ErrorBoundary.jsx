import React from 'react'
import { AlertCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-surface flex items-center justify-center p-6 font-body">
          <div className="max-w-xl w-full bg-surface-container-lowest rounded-[3rem] p-12 text-center shadow-2xl border border-red-500/20 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-headline font-bold text-primary mb-4 tracking-tight">
              Something went wrong
            </h1>
            
            <p className="text-on-surface-variant text-lg mb-8 leading-relaxed">
              An unexpected error occurred in the proctor interface. Our telemetry has logged the incident.
            </p>
            
            <div className="bg-surface-container p-6 rounded-2xl mb-10 text-left border border-surface-dim/20">
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <AlertCircle className="w-3 h-3" /> System Diagnostics
              </p>
              <code className="text-xs font-mono text-primary/70 break-all bg-surface-container-low px-2 py-1 rounded">
                {this.state.error?.toString() || 'Unknown Runtime Error'}
              </code>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-8 py-4 signature-gradient text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95"
              >
                <RefreshCw className="w-4 h-4" /> Reload UI
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-surface-container text-primary rounded-2xl font-bold hover:bg-surface-dim transition-all active:scale-95 border border-surface-dim/20"
              >
                <Home className="w-4 h-4" /> Back Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
