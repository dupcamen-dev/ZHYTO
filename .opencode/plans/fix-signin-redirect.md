# Fix: SIGN IN from header should not redirect to payment

## Problem
- Clicking SIGN IN in the nav header opens the checkout modal, which auto-advances to payment when user logs in — even with empty cart.

## Fix (2 files)

### 1. pp/page.tsx
- Change SIGN IN button onClick from setCheckoutOpen(true) to signInWithGoogle() — logs in directly without opening checkout modal.
- Add signInWithGoogle to destructured useAuth() return.

### 2. components/checkout-modal.tsx
- Add cartItems.length > 0 guard to the useEffect that auto-advances to payment. This ensures it only fires when there are actual items in the cart.
