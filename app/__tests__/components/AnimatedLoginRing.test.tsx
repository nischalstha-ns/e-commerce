import { render, screen } from '@testing-library/react';
import AnimatedLoginRing from '@/app/components/AnimatedLoginRing';

describe('AnimatedLoginRing', () => {
  it('renders children correctly', () => {
    render(
      <AnimatedLoginRing>
        <div data-testid="test-child">Test Content</div>
      </AnimatedLoginRing>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('has correct background gradient', () => {
    const { container } = render(
      <AnimatedLoginRing>
        <div>Test</div>
      </AnimatedLoginRing>
    );
    
    const backgroundDiv = container.firstChild as HTMLElement;
    expect(backgroundDiv).toHaveClass('bg-gradient-to-br', 'from-gray-900', 'via-blue-900', 'to-black');
  });

  it('renders 12 animated segments', () => {
    const { container } = render(
      <AnimatedLoginRing>
        <div>Test</div>
      </AnimatedLoginRing>
    );
    
    const segments = container.querySelectorAll('.absolute.w-4.h-4.rounded-full');
    expect(segments).toHaveLength(12);
  });
});