import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../App';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('plays a connection end-to-end and finishes from the pause menu', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'התחילו לשחק' }));

    const cards = screen.getByRole('group', { name: 'כרטיסי המשחק' });
    expect(cards.querySelectorAll('button')).toHaveLength(25);

    fireEvent.click(screen.getByRole('button', { name: 'נבט' }));
    fireEvent.click(screen.getByRole('button', { name: 'ברק' }));
    expect(screen.getAllByText('סוֹד').length).toBeGreaterThan(0);
    expect(screen.getByText('✨ סוד חדש נחשף!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'השהיה ותפריט' }));
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'סיים עכשיו וראה תוצאות' }));
    });

    expect(screen.getByRole('heading', { name: 'סיום!' })).toBeInTheDocument();
    expect(screen.getByText('🏆 שיא אישי חדש!')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('kesher:stats:v1')!).gamesPlayed).toBe(1);
  });
});
