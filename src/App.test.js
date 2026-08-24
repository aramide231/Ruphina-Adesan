import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the site name', async () => {
  render(<App />);
  expect(await screen.findByRole('heading', { name: /Ruphina Ojo Adesan/i })).toBeInTheDocument();
});
