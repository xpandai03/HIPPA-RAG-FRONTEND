'use client';

import { useState } from 'react';

interface DebugResult {
  [key: string]: any;
}

interface CheckResult {
  name: string;
  endpoint: string;
  result: DebugResult | null;
  error: string | null;
  loading: boolean;
}

export default function DebugPage() {
  const [checks, setChecks] = useState<CheckResult[]>([
    { name: 'Environment Check', endpoint: '/api/debug/env', result: null, error: null, loading: false },
    { name: 'Local Ping', endpoint: '/api/debug/ping', result: null, error: null, loading: false },
    { name: 'Proxy Health', endpoint: '/api/debug/proxy-health', result: null, error: null, loading: false },
  ]);

  const runCheck = async (index: number) => {
    const newChecks = [...checks];
    newChecks[index].loading = true;
    newChecks[index].error = null;
    newChecks[index].result = null;
    setChecks(newChecks);

    try {
      const response = await fetch(checks[index].endpoint);
      const data = await response.json();
      
      newChecks[index].result = data;
      if (!response.ok) {
        newChecks[index].error = `HTTP ${response.status}: ${data.error || 'Unknown error'}`;
      }
    } catch (error) {
      newChecks[index].error = error instanceof Error ? error.message : 'Network error';
    } finally {
      newChecks[index].loading = false;
      setChecks(newChecks);
    }
  };

  const runAllChecks = async () => {
    for (let i = 0; i < checks.length; i++) {
      await runCheck(i);
      // Small delay between checks
      if (i < checks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  };

  const getStatusIcon = (check: CheckResult) => {
    if (check.loading) return '⏳';
    if (check.error) return '❌';
    if (check.result) {
      // Special logic for different check types
      if (check.name === 'Environment Check') {
        return check.result.hasRenderApiKey ? '✅' : '⚠️';
      }
      if (check.name === 'Proxy Health') {
        return check.result.upstreamOk ? '✅' : '❌';
      }
      return check.result.ok !== false ? '✅' : '❌';
    }
    return '⚪';
  };

  const getGuidance = () => {
    const envCheck = checks[0];
    const healthCheck = checks[2];

    if (envCheck.result && !envCheck.result.hasRenderApiKey) {
      return {
        status: 'error',
        message: 'Missing RENDER_API_KEY',
        action: 'Set RENDER_API_KEY in Vercel environment variables and redeploy'
      };
    }

    if (healthCheck.result && !healthCheck.result.upstreamOk) {
      const status = healthCheck.result.upstreamStatus;
      if (status === 401) {
        return {
          status: 'error',
          message: 'API Key Authentication Failed',
          action: 'Check that RENDER_API_KEY is correct and has proper permissions'
        };
      }
      if (status === 403) {
        return {
          status: 'error',
          message: 'API Access Forbidden',
          action: 'Verify API key permissions and CORS configuration'
        };
      }
      if (status === 404) {
        return {
          status: 'error',
          message: 'API Endpoint Not Found',
          action: 'Check NEXT_PUBLIC_API_BASE URL is correct'
        };
      }
      return {
        status: 'error',
        message: `Backend Error (${status})`,
        action: 'Check backend service status and logs'
      };
    }

    if (healthCheck.result && healthCheck.result.upstreamOk) {
      return {
        status: 'success',
        message: 'All Systems Operational',
        action: 'Upload and chat functionality should work correctly'
      };
    }

    return {
      status: 'info',
      message: 'Run checks to diagnose issues',
      action: 'Click "Run All Checks" to identify any problems'
    };
  };

  const guidance = getGuidance();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Diagnostics</h1>
        <p className="text-gray-600 mt-2">
          Debug and diagnose issues with the HIPAA RAG frontend
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex gap-4">
        <button
          onClick={runAllChecks}
          disabled={checks.some(c => c.loading)}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium"
        >
          Run All Checks
        </button>
      </div>

      {/* Guidance Panel */}
      <div className={`mb-8 p-6 rounded-lg border-2 ${
        guidance.status === 'success' ? 'bg-green-50 border-green-200' :
        guidance.status === 'error' ? 'bg-red-50 border-red-200' :
        'bg-blue-50 border-blue-200'
      }`}>
        <h3 className={`text-lg font-medium mb-2 ${
          guidance.status === 'success' ? 'text-green-900' :
          guidance.status === 'error' ? 'text-red-900' :
          'text-blue-900'
        }`}>
          {guidance.message}
        </h3>
        <p className={`${
          guidance.status === 'success' ? 'text-green-800' :
          guidance.status === 'error' ? 'text-red-800' :
          'text-blue-800'
        }`}>
          {guidance.action}
        </p>
      </div>

      {/* Diagnostic Checks */}
      <div className="space-y-6">
        {checks.map((check, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getStatusIcon(check)}</span>
                <h3 className="text-lg font-medium text-gray-900">{check.name}</h3>
              </div>
              <button
                onClick={() => runCheck(index)}
                disabled={check.loading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded font-medium"
              >
                {check.loading ? 'Running...' : 'Run Check'}
              </button>
            </div>

            {check.error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-800 font-medium">Error:</p>
                <p className="text-red-700">{check.error}</p>
              </div>
            )}

            {check.result && (
              <div className="bg-gray-50 border border-gray-200 rounded p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Response:</p>
                <pre className="text-xs text-gray-800 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(check.result, null, 2)}
                </pre>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
              <strong>Endpoint:</strong> {check.endpoint}
            </div>
          </div>
        ))}
      </div>

      {/* Debug Information */}
      <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Debug Commands</h3>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Local Testing:</p>
            <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
              curl -s http://localhost:3000/api/debug/env | jq .<br/>
              curl -s http://localhost:3000/api/debug/proxy-health | jq .
            </code>
          </div>
          <div>
            <p className="font-medium text-gray-700">Production Testing:</p>
            <code className="block bg-gray-100 p-2 rounded mt-1 text-xs">
              curl -s https://your-app.vercel.app/api/debug/env | jq .<br/>
              curl -s https://your-app.vercel.app/api/debug/proxy-health | jq .
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}