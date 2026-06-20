import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import supabase from '../lib/supabase';

// Mock supabase client
vi.mock('../lib/supabase', () => {
  const mockSubscription = {
    unsubscribe: vi.fn()
  };
  
  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: mockSubscription } })
  };

  return {
    __esModule: true,
    supabase: {
      auth: mockAuth
    },
    default: {
      auth: mockAuth
    }
  };
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders loading skeleton initially', async () => {
    // Make getSession stay pending for a bit
    supabase.auth.getSession.mockImplementationOnce(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // Should display EcoTrack loading text or skeleton elements
    expect(screen.getByText('EcoTrack')).toBeInTheDocument();
  });

  it('renders children if user session is authenticated', async () => {
    const mockSession = { user: { id: 'test-user' } };
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toHaveTextContent('Protected Content');
    });
  });

  it('renders children if local demo mode is active', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    localStorage.setItem('ecotrack_demo_session', 'true');

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toHaveTextContent('Protected Content');
    });
  });

  it('redirects to auth page if not authenticated', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            } 
          />
          <Route path="/auth" element={<div data-testid="auth-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    });
  });
});
