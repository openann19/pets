export const loadStripe = jest.fn(() => 
  Promise.resolve({
    elements: jest.fn(() => ({
      create: jest.fn(() => ({
        mount: jest.fn(),
        unmount: jest.fn(),
        destroy: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
        update: jest.fn(),
      })),
      getElement: jest.fn(),
      update: jest.fn(),
    })),
    confirmCardPayment: jest.fn(() => 
      Promise.resolve({ paymentIntent: { status: 'succeeded' } })
    ),
    confirmPayment: jest.fn(() => 
      Promise.resolve({ paymentIntent: { status: 'succeeded' } })
    ),
    createPaymentMethod: jest.fn(() => 
      Promise.resolve({ paymentMethod: { id: 'pm_test_123' } })
    ),
    createToken: jest.fn(() => 
      Promise.resolve({ token: { id: 'tok_test_123' } })
    ),
    retrievePaymentIntent: jest.fn(() => 
      Promise.resolve({ paymentIntent: { status: 'succeeded' } })
    ),
  })
);