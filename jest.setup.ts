// Learn more: https://github.com/testing-library/jest-dom
//import { UserButton } from '@clerk/nextjs'
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.CLERK_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock'
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock'
process.env.PAYPAL_CLIENT_ID = 'test-paypal-client-id'
process.env.PAYPAL_CLIENT_SECRET = 'test-paypal-secret'
process.env.PAYPAL_API_URL = 'https://api-m.sandbox.paypal.com'
process.env.BREVO_API_KEY = 'xkeysib-test'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Clerk
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(() => Promise.resolve({
    userId: 'test-user-id',
    sessionClaims: {
      metadata: { role: 'admin' }
    }
  })),
  clerkMiddleware: jest.fn((handler) => handler),
  createRouteMatcher: jest.fn(() => jest.fn()),
}))

jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(() => ({
    isSignedIn: true,
    user: {
      id: 'test-user-id',
      publicMetadata: { role: 'admin' }
    }
  })),
  useAuth: jest.fn(() => ({
    isSignedIn: true,
    userId: 'test-user-id'
  })),
  SignInButton: ({ children }: { children: React.ReactNode }) => children,
  SignUpButton: ({ children }: { children: React.ReactNode }) => children,
  //UserButton: () => <div>UserButton</div>
}))
