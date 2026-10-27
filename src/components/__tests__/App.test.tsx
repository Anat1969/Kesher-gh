import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../../App';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('plays a connection end-to-end, stops the clock and finishes', async () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'התחלת משחק' })[0]);

    const cards = screen.getByRole('group', { name: 'כרטיסי המשחק' });
    expect(cards.querySelectorAll('button')).toHaveLength(25);

    fireEvent.click(screen.getByRole('button', { name: 'נבט' }));
    fireEvent.click(screen.getByRole('button', { name: 'ברק' }));
    expect((await screen.findAllByText('סוֹד')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('סוד חדש נחשף')).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'עצירת השעון' }));
    expect(await screen.findByText('השעון עצור')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(await screen.findByRole('button', { name: 'סיים עכשיו וראה תוצאות' }));
    });

    expect(screen.getByRole('heading', { name: 'סיום!' })).toBeInTheDocument();
    expect(await screen.findByText('שיא אישי חדש')).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('kesher:stats:v1')!).gamesPlayed).toBe(1);
  });
});
