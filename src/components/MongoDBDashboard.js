import React, { useState, useEffect } from 'react';

const MongoDBDashboard = () => {
  const [dbStats, setDbStats] = useState({
    storageSize: 0,
    dataSize: 0,
    indexSize: 0,
    totalObjects: 0,
    totalCollections: 0,
    collections: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  const [mongoUri, setMongoUri] = useState('mongodb://admin:MyDude%2323Admin009@api.justdude.in:27017/crmdude?authSource=admin');
  const [isConnected, setIsConnected] = useState(false);
  const [showUriInput, setShowUriInput] = useState(true);

  // Enhanced mock data for better demonstration
  const mockData = {
    storageSize: 15728640, // 15MB
    dataSize: 12582912,   // 12MB
    indexSize: 3145728,   // 3MB
    totalObjects: 45673,
    totalCollections: 12,
    collections: [
      { name: 'users', count: 15420, size: 4194304, avgObjSize: 272, indexes: 3 },
      { name: 'products', count: 8900, size: 3145728, avgObjSize: 353, indexes: 5 },
      { name: 'orders', count: 12847, size: 2097152, avgObjSize: 163, indexes: 4 },
      { name: 'payments', count: 6234, size: 1572864, avgObjSize: 252, indexes: 2 },
      { name: 'categories', count: 145, size: 16384, avgObjSize: 113, indexes: 1 },
      { name: 'reviews', count: 4890, size: 524288, avgObjSize: 107, indexes: 2 },
      { name: 'inventory', count: 2200, size: 262144, avgObjSize: 119, indexes: 2 },
      { name: 'sessions', count: 1580, size: 131072, avgObjSize: 83, indexes: 1 },
      { name: 'analytics', count: 890, size: 65536, avgObjSize: 74, indexes: 1 },
      { name: 'notifications', count: 2340, size: 98304, avgObjSize: 42, indexes: 1 },
      { name: 'logs', count: 567, size: 32768, avgObjSize: 58, indexes: 1 },
      { name: 'settings', count: 23, size: 4096, avgObjSize: 178, indexes: 1 }
    ]
  };

  const connectToMongoDB = async () => {
    if (!mongoUri.trim()) {
      setDbStats(prev => ({ ...prev, error: 'Please provide a valid MongoDB URI' }));
      return;
    }

    setDbStats(prev => ({ ...prev, loading: true, error: null }));

    try {
      // In a real implementation, this would call your backend API
      // const response = await fetch('/api/database-stats', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ mongoUri })
      // });
      
      // For demonstration, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDbStats({
        ...mockData,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      setIsConnected(true);
      setShowUriInput(false);
    } catch (error) {
      setDbStats(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to connect to MongoDB. Please check your URI.'
      }));
    }
  };

  const refreshStats = async () => {
    setDbStats(prev => ({ ...prev, loading: true }));
    
    setTimeout(() => {
      setDbStats(prev => ({
        ...prev,
        ...mockData,
        loading: false,
        lastUpdated: new Date()
      }));
    }, 1000);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  const formatDate = (date) => {
    return date ? date.toLocaleString() : '';
  };

  if (showUriInput && !isConnected) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', marginTop:'50px'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <i className="fas fa-database text-primary" style={{fontSize: '4rem'}}></i>
                    </div>
                    <h1 className="display-6 fw-bold mb-2">MongoDB Dashboard</h1>
                    <p className="text-muted">Connect to your MongoDB database to view statistics</p>
                  </div>
                  
                  <div>
                    <div className="mb-4">
                      <label htmlFor="mongoUri" className="form-label fw-semibold">
                        <i className="fas fa-link me-2"></i>
                        MongoDB Connection URI
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="mongoUri"
                        placeholder="mongodb://username:password@host:port/database"
                        value={mongoUri}
                        onChange={(e) => setMongoUri(e.target.value)}
                        disabled={dbStats.loading}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            connectToMongoDB();
                          }
                        }}
                      />
                      <div className="form-text">
                        Example: mongodb+srv://user:pass@cluster.mongodb.net/mydb
                      </div>
                    </div>
                    
                    {dbStats.error && (
                      <div className="alert alert-danger" role="alert">
                        <i className="fas fa-exclamation-circle me-2"></i>
                        {dbStats.error}
                      </div>
                    )}
                    
                    <div className="d-grid gap-2">
                      <button 
                        className="btn btn-primary btn-lg"
                        disabled={dbStats.loading}
                        onClick={connectToMongoDB}
                      >
                        {dbStats.loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plug me-2"></i>
                            Connect to Database
                          </>
                        )}
                      </button>
                      
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setMongoUri('mongodb://localhost:27017/sampledb');
                          setTimeout(() => connectToMongoDB(), 100);
                        }}
                      >
                        <i className="fas fa-flask me-2"></i>
                        Use Demo Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (dbStats.loading && isConnected) {
    return (
      <div className="container-fluid p-4 bg-light min-vh-100">
        <div className="d-flex justify-content-center align-items-center" style={{minHeight: '60vh'}}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status"></div>
            <h4 className="text-muted">Loading database statistics...</h4>
            <p className="text-muted">Please wait while we fetch your data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 bg-light min-vh-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-bottom">
        <div className="container-fluid px-4 py-3">
          <div className="row align-items-center">
            <div className="col">
              <div className="d-flex align-items-center">
                <i className="fas fa-database text-primary me-3" style={{fontSize: '2rem'}}></i>
                <div>
                  <h1 className="h3 mb-0 fw-bold">MongoDB Dashboard</h1>
                  <small className="text-muted">
                    {dbStats.lastUpdated && `Last updated: ${formatDate(dbStats.lastUpdated)}`}
                  </small>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={refreshStats}
                  disabled={dbStats.loading}
                >
                  <i className="fas fa-sync-alt me-2"></i>
                  Refresh
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setIsConnected(false);
                    setShowUriInput(true);
                    setDbStats(prev => ({ ...prev, loading: true }));
                  }}
                >
                  <i className="fas fa-exchange-alt me-2"></i>
                  Change Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid px-4 py-4">
        {/* Overview Cards */}
        <div className="row g-4 mb-5">
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col">
                    <p className="text-muted mb-1 fw-semibold">Total Storage</p>
                    <h2 className="text-primary fw-bold mb-0">{formatBytes(dbStats.storageSize)}</h2>
                  </div>
                  <div className="col-auto">
                    <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                      <i className="fas fa-hdd text-primary" style={{fontSize: '1.5rem'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{height: '3px'}}></div>
            </div>
          </div>
          
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col">
                    <p className="text-muted mb-1 fw-semibold">Data Size</p>
                    <h2 className="text-success fw-bold mb-0">{formatBytes(dbStats.dataSize)}</h2>
                  </div>
                  <div className="col-auto">
                    <div className="bg-success bg-opacity-10 rounded-circle p-3">
                      <i className="fas fa-chart-pie text-success" style={{fontSize: '1.5rem'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="position-absolute bottom-0 start-0 w-100 bg-success" style={{height: '3px'}}></div>
            </div>
          </div>
          
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col">
                    <p className="text-muted mb-1 fw-semibold">Total Documents</p>
                    <h2 className="text-info fw-bold mb-0">{formatNumber(dbStats.totalObjects)}</h2>
                  </div>
                  <div className="col-auto">
                    <div className="bg-info bg-opacity-10 rounded-circle p-3">
                      <i className="fas fa-file-alt text-info" style={{fontSize: '1.5rem'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="position-absolute bottom-0 start-0 w-100 bg-info" style={{height: '3px'}}></div>
            </div>
          </div>
          
          <div className="col-xl-3 col-lg-4 col-md-6">
            <div className="card border-0 shadow-sm h-100 position-relative overflow-hidden">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col">
                    <p className="text-muted mb-1 fw-semibold">Collections</p>
                    <h2 className="text-warning fw-bold mb-0">{dbStats.totalCollections}</h2>
                  </div>
                  <div className="col-auto">
                    <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                      <i className="fas fa-layer-group text-warning" style={{fontSize: '1.5rem'}}></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="position-absolute bottom-0 start-0 w-100 bg-warning" style={{height: '3px'}}></div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="row g-4 mb-5">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <h4 className="card-title mb-0 fw-bold">
                  <i className="fas fa-chart-bar text-primary me-2"></i>
                  Storage Distribution
                </h4>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted fw-semibold">Data Storage</span>
                        <span className="fw-bold text-success">{formatBytes(dbStats.dataSize)}</span>
                      </div>
                      <div className="progress" style={{height: '12px'}}>
                        <div 
                          className="progress-bar bg-success" 
                          style={{width: `${(dbStats.dataSize / dbStats.storageSize) * 100}%`}}
                        ></div>
                      </div>
                      <small className="text-muted">{((dbStats.dataSize / dbStats.storageSize) * 100).toFixed(1)}% of total storage</small>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted fw-semibold">Index Storage</span>
                        <span className="fw-bold text-info">{formatBytes(dbStats.indexSize)}</span>
                      </div>
                      <div className="progress" style={{height: '12px'}}>
                        <div 
                          className="progress-bar bg-info" 
                          style={{width: `${(dbStats.indexSize / dbStats.storageSize) * 100}%`}}
                        ></div>
                      </div>
                      <small className="text-muted">{((dbStats.indexSize / dbStats.storageSize) * 100).toFixed(1)}% of total storage</small>
                    </div>
                  </div>
                </div>
                
                <div className="row text-center mt-4 pt-3 border-top">
                  <div className="col-3">
                    <h5 className="text-primary mb-1">{formatBytes(dbStats.storageSize)}</h5>
                    <small className="text-muted">Total Storage</small>
                  </div>
                  <div className="col-3">
                    <h5 className="text-success mb-1">{((dbStats.dataSize / dbStats.storageSize) * 100).toFixed(1)}%</h5>
                    <small className="text-muted">Data Usage</small>
                  </div>
                  <div className="col-3">
                    <h5 className="text-info mb-1">{((dbStats.indexSize / dbStats.storageSize) * 100).toFixed(1)}%</h5>
                    <small className="text-muted">Index Usage</small>
                  </div>
                  <div className="col-3">
                    <h5 className="text-muted mb-1">{Math.round(dbStats.dataSize / dbStats.totalObjects)}</h5>
                    <small className="text-muted">Avg Doc Size (bytes)</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0 py-3">
                <h4 className="card-title mb-0 fw-bold">
                  <i className="fas fa-info-circle text-primary me-2"></i>
                  Database Health
                </h4>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-success bg-opacity-10 rounded">
                  <div>
                    <h6 className="mb-1 fw-bold">Connection Status</h6>
                    <small className="text-success">Connected & Active</small>
                  </div>
                  <i className="fas fa-check-circle text-success" style={{fontSize: '1.5rem'}}></i>
                </div>
                
                <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-primary bg-opacity-10 rounded">
                  <div>
                    <h6 className="mb-1 fw-bold">Storage Efficiency</h6>
                    <small className="text-primary">Optimized</small>
                  </div>
                  <i className="fas fa-tachometer-alt text-primary" style={{fontSize: '1.5rem'}}></i>
                </div>
                
                <div className="d-flex align-items-center justify-content-between mb-3 p-3 bg-info bg-opacity-10 rounded">
                  <div>
                    <h6 className="mb-1 fw-bold">Index Health</h6>
                    <small className="text-info">Well Indexed</small>
                  </div>
                  <i className="fas fa-search text-info" style={{fontSize: '1.5rem'}}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Collections Table */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <div className="row align-items-center">
                  <div className="col">
                    <h4 className="card-title mb-0 fw-bold">
                      <i className="fas fa-table text-primary me-2"></i>
                      Collections Overview
                    </h4>
                  </div>
                  <div className="col-auto">
                    <span className="badge bg-primary fs-6">{dbStats.totalCollections} Collections</span>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead style={{backgroundColor: '#f8f9fa'}}>
                      <tr>
                        <th className="border-0 px-4 py-3 fw-bold">Collection</th>
                        <th className="border-0 py-3 fw-bold text-center">Documents</th>
                        <th className="border-0 py-3 fw-bold text-center">Size</th>
                        <th className="border-0 py-3 fw-bold text-center">Avg Doc Size</th>
                        <th className="border-0 py-3 fw-bold text-center">Indexes</th>
                        <th className="border-0 py-3 fw-bold text-center">Usage %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dbStats.collections
                        .sort((a, b) => b.size - a.size)
                        .map((collection, index) => (
                        <tr key={index} className="border-bottom">
                          <td className="px-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <i className="fas fa-folder text-primary"></i>
                              </div>
                              <div>
                                <span className="fw-bold">{collection.name}</span>
                                <br />
                                <small className="text-muted">Collection #{index + 1}</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className="badge bg-light text-dark fs-6">
                              {formatNumber(collection.count)}
                            </span>
                          </td>
                          <td className="py-3 text-center fw-semibold">{formatBytes(collection.size)}</td>
                          <td className="py-3 text-center text-muted">{collection.avgObjSize} bytes</td>
                          <td className="py-3 text-center">
                            <span className="badge bg-info">{collection.indexes || 1}</span>
                          </td>
                          <td className="py-3 text-center">
                            <div className="d-flex align-items-center justify-content-center">
                              <div className="progress me-2" style={{width: '80px', height: '6px'}}>
                                <div 
                                  className="progress-bar bg-primary" 
                                  style={{width: `${(collection.size / dbStats.storageSize) * 100}%`}}
                                ></div>
                              </div>
                              <span className="text-muted small fw-semibold">
                                {((collection.size / dbStats.storageSize) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="row mt-5 pt-4">
          <div className="col-12 text-center text-muted">
            <p className="mb-2">
              <i className="fas fa-database me-2"></i>
              MongoDB Dashboard - Real-time database statistics
            </p>
            <small>Last refreshed: {dbStats.lastUpdated ? formatDate(dbStats.lastUpdated) : 'Never'}</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MongoDBDashboard;