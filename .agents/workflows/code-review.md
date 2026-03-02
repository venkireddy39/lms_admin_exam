---
description: This workspace focuses on strict code review and security enforcement for the LMS project. The goal is to maintain clean, scalable, and production-ready code across backend, frontend, and database layers.  All code must follow proper architecture 
---

# Payment Integration Rules – Cashfree (LMS Project)

## 1. Architecture

- Payment must be handled in a separate module.
- Do NOT mix payment logic inside Course or Fee logic.
- Flow:
  Controller → Service → Cashfree API → Webhook → Update Payment Status.

## 2. Security Rules

- Never store API Secret in code.
- Use environment variables for:
  - CASHFREE_CLIENT_ID
  - CASHFREE_CLIENT_SECRET
- Verify webhook signature before updating payment status.
- Do NOT trust frontend payment success response.
- Always verify payment from backend using Cashfree order status API.

## 3. Database Design

Create separate tables:

### payment_orders
- id
- order_id
- student_id
- amount
- status (PENDING, SUCCESS, FAILED)
- payment_session_id
- created_at

### payment_transactions
- id
- order_id
- cashfree_payment_id
- payment_mode
- bank_reference
- status
- paid_at

No mixing with fee tables.

## 4. Flow

1. Student clicks "Pay".
2. Backend creates order via Cashfree API.
3. Backend returns payment_session_id to frontend.
4. Frontend opens Cashfree checkout.
5. Cashfree sends webhook to backend.
6. Backend verifies signature.
7. Update payment status.
8. Generate receipt.

## 5. Validation

- Prevent duplicate payments.
- Do not allow payment if fee already paid.
- Handle partial payment if enabled.
- Log failed transactions.

## 6. Restrictions

- No hardcoded test keys in production.
- Separate sandbox and production config.
- All payment APIs must be secured (JWT required).
- Payment status must be idempotent.