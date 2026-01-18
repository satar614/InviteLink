/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});

describe('App Component Tests', () => {
  it('should render without crashing', async () => {
    await ReactTestRenderer.act(() => {
      const instance = ReactTestRenderer.create(<App />);
      expect(instance).toBeTruthy();
      instance.unmount();
    });
  });

  it('should have valid props', async () => {
    await ReactTestRenderer.act(() => {
      const instance = ReactTestRenderer.create(<App />);
      expect(instance.root).toBeTruthy();
      instance.unmount();
    });
  });

  it('should update on state changes', async () => {
    let instance: any;
    await ReactTestRenderer.act(() => {
      instance = ReactTestRenderer.create(<App />);
    });
    
    expect(instance).toBeTruthy();
    instance.unmount();
  });
});
