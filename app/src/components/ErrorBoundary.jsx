import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-600 mb-4">
              {this.state.error?.message?.includes('firebase') || this.state.error?.message?.includes('api-key')
                ? 'Firebase is not configured. Please add your Firebase credentials to the .env file.'
                : this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <div className="bg-gray-100 rounded-xl p-4 text-left mb-4">
              <p className="text-xs text-gray-500 font-mono break-all">{this.state.error?.message}</p>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              To fix this, create a <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env</code> file in the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">app/</code> folder with your Firebase config:
            </p>
            <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs text-left overflow-x-auto mb-4">
{`VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender
VITE_FIREBASE_APP_ID=your_app_id`}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark text-sm"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
