import React from "react";
import { FaExclamationTriangle, FaSync, FaBug, FaChevronDown, FaChevronUp } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
        hasError: false, 
        error: null, 
        errorInfo: null,
        showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows a fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console or external service
    console.error("LOGGING_SERVICE: Error caught:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    // Resets the state so children can try re-rendering
    this.setState({ 
        hasError: false, 
        error: null, 
        errorInfo: null,
        showDetails: false 
    });
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-wrapper">
          <div className="error-card shadow-lg">
            <div className="error-header">
               <div className="error-icon-circle">
                  <FaExclamationTriangle />
               </div>
               <h3 className="fw-bold mt-3 mb-1">Application Error</h3>
               <p className="text-muted small">We've encountered an unexpected issue while rendering this section.</p>
            </div>

            <div className="error-body">
                <div className="error-message-box">
                    <strong>Error:</strong> {this.state.error?.toString() || "Unknown Error"}
                </div>

                <div className="d-flex justify-content-center gap-3 mt-4">
                    <button className="error-btn btn-retry" onClick={this.handleReset}>
                        <FaSync className="me-2" /> Try Again
                    </button>
                    <button className="error-btn btn-reload" onClick={() => window.location.reload()}>
                        Reload Page
                    </button>
                </div>

                <div className="debug-section mt-4">
                    <button className="debug-toggle" onClick={this.toggleDetails}>
                        <FaBug className="me-2" /> 
                        {this.state.showDetails ? "Hide Debug Info" : "Show Debug Info"}
                        {this.state.showDetails ? <FaChevronUp className="ms-auto" /> : <FaChevronDown className="ms-auto" />}
                    </button>
                    
                    {this.state.showDetails && (
                        <div className="stack-trace">
                            <pre>{this.state.errorInfo?.componentStack}</pre>
                        </div>
                    )}
                </div>
            </div>
          </div>

          <style>{`
            .error-boundary-wrapper {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 300px;
              padding: 20px;
              background: #f8fafc;
              border-radius: 16px;
              font-family: 'Inter', sans-serif;
            }

            .error-card {
              background: white;
              max-width: 500px;
              width: 100%;
              border-radius: 20px;
              padding: 40px 30px;
              text-align: center;
              border: 1px solid #fee2e2;
            }

            .error-icon-circle {
              width: 70px;
              height: 70px;
              background: #fef2f2;
              color: #ef4444;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2rem;
              margin: 0 auto;
            }

            .error-message-box {
              background: #fff1f2;
              color: #b91c1c;
              padding: 12px;
              border-radius: 10px;
              font-size: 0.85rem;
              margin-top: 20px;
              border: 1px solid #fecaca;
              word-break: break-word;
            }

            .error-btn {
              padding: 10px 20px;
              border-radius: 10px;
              font-weight: 700;
              font-size: 0.9rem;
              border: none;
              transition: 0.2s;
            }

            .btn-retry {
              background: #6366f1;
              color: white;
            }
            .btn-retry:hover { background: #4f46e5; transform: translateY(-2px); }

            .btn-reload {
              background: #f1f5f9;
              color: #475569;
            }
            .btn-reload:hover { background: #e2e8f0; }

            .debug-section { border-top: 1px solid #f1f5f9; pt-3; }
            
            .debug-toggle {
              width: 100%;
              background: none;
              border: none;
              display: flex;
              align-items: center;
              color: #94a3b8;
              font-size: 0.8rem;
              font-weight: 600;
              padding: 10px 0;
              cursor: pointer;
            }

            .stack-trace {
              text-align: left;
              background: #1e293b;
              color: #38bdf8;
              padding: 15px;
              border-radius: 10px;
              font-size: 0.7rem;
              max-height: 200px;
              overflow: auto;
              margin-top: 10px;
            }
            .stack-trace pre { margin: 0; white-space: pre-wrap; }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;