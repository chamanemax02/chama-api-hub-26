import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("REACT ERROR BOUNDARY:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    height: '100vh',
                    width: '100vw',
                    background: '#05060b',
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    textAlign: 'center',
                    fontFamily: 'sans-serif'
                }}>
                    <h1 style={{ color: '#d946ef', fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong.</h1>
                    <div style={{
                        background: 'rgba(255,0,0,0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,0,0,0.2)',
                        maxWidth: '600px',
                        textAlign: 'left',
                        overflow: 'auto',
                        marginBottom: '2rem'
                    }}>
                        <code style={{ color: '#ffaaaa' }}>{this.state.error && this.state.error.toString()}</code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 24px',
                            background: '#d946ef',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
