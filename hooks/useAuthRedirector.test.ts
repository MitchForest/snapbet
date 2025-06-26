import { renderHook } from '@testing-library/react-hooks';
import { useAuthRedirector } from './useAuthRedirector';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useRootNavigationState: () => ({ key: 'test' }),
}));

describe('useAuthRedirector', () => {
  it('should not redirect when loading', () => {
    const { result } = renderHook(() => useAuthRedirector());
    expect(result.current).toBeUndefined();
  });
});
