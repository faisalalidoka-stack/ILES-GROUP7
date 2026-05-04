import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Mock the API module
vi.mock('../services/api', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  requestPasswordReset: vi.fn(),
  getWeeklyLogs: vi.fn(() => Promise.resolve([])),
  getPlacements: vi.fn(() => Promise.resolve([])),
  getGrades: vi.fn(() => Promise.resolve([])),
  getUser: vi.fn(() => ({ email: 'test@test.com', role: 'STUDENT' })),
  saveToken: vi.fn(),
  saveUser: vi.fn(),
  logOut: vi.fn(),
}));

import Login from '../pages/Login';
import Register from '../pages/Register';
import StudentDashboard from '../pages/StudentDashboard';

// Test 1: Login form renders correctly
describe('FE‑1: Login Page renders inputs and button', () => {
  test('renders email, password inputs and login button', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });
});

// Test 2: Login shows error on failed login
describe('FE‑2: Login shows error when login fails', () => {
  test('displays error message after failed login', async () => {
    const { loginUser } = await import('../services/api');
    loginUser.mockResolvedValueOnce({ success: false, error: 'Invalid credentials' });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'wrong@test.com');
    await userEvent.type(screen.getByPlaceholderText(/password/i), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});

// Test 3: Register shows error when passwords do not match
describe('FE‑3: Register page password mismatch', () => {
  test('shows error when passwords do not match', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    // Use exact placeholder strings to avoid ambiguity
    await userEvent.type(screen.getByPlaceholderText('Password'), 'Password123');
    await userEvent.type(screen.getByPlaceholderText('Confirm Password'), 'Different456');
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});

// Test 4: StudentDashboard shows logs heading after loading
describe('FE‑4: StudentDashboard displays logs section', () => {
  test('shows "My Internship Logs" heading after loading', async () => {
    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/my internship logs/i)).toBeInTheDocument();
    });
  });
});

// Test 5: New Log button opens the submission form
describe('FE‑5: New Log button opens form', () => {
  test('clicking + New Log shows the log form', async () => {
    render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    );
    const newLogButton = await screen.findByText(/new log/i);
    fireEvent.click(newLogButton);
    await waitFor(() => {
      expect(screen.getByText(/submit internship log/i)).toBeInTheDocument();
    });
  });
});