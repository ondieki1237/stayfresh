# Loan Collateralization System - API Documentation

## Overview

The loan system allows farmers to use their stored produce as collateral for short-term loans. The system automatically values collateral, calculates loan terms, manages approvals, tracks payments, and releases collateral upon full repayment.

## Business Rules

- **Loan-to-Value (LTV)**: 50% to 80% of collateral value (default 60%)
- **Interest Rate**: 18% APR (annual percentage rate)
- **Origination Fee**: 2% of principal
- **Term**: 7 to 365 days (typically 30-90 days)
- **Eligible Produce**: Fresh, Good, or Excellent condition; minimum 50kg, minimum KSH 10/kg
- **Collateral Requirement**: Produce must not be sold or already pledged

## API Endpoints

### 1. Apply for Loan

**Endpoint:** `POST /api/loans/apply`

**Auth:** Required (Bearer token)

**Request Body:**
```json
{
  "farmerId": "690ec3eee4d3922a55551bbf",
  "produceId": "690ec3eee4d3922a55551bc0",
  "requestedLtv": 0.6,
  "termDays": 60,
  "purpose": "Purchase farm inputs",
  "notes": "Need funds for next planting season"
}
```

**Response:** `201 Created`
```json
{
  "message": "Loan application submitted successfully",
  "loan": {
    "_id": "690ec3eee4d3922a55551bc1",
    "farmer": { "firstName": "John", "lastName": "Kamau" },
    "produce": { "produceType": "Tomatoes", "quantity": 500 },
    "collateralValue": 60000,
    "principal": 36000,
    "ltv": 0.6,
    "termDays": 60,
    "interestRate": 0.18,
    "interestAmount": 1067.12,
    "originationFee": 720,
    "totalDue": 37787.12,
    "netDisbursement": 35280,
    "status": "Pending"
  },
  "summary": {
    "collateralValue": 60000,
    "principal": 36000,
    "interestAmount": 1067.12,
    "originationFee": 720,
    "totalDue": 37787.12,
    "netDisbursement": 35280,
    "termDays": 60,
    "ltv": 0.6
  }
}
```

**Eligibility Checks:**
- Produce must belong to the farmer
- Produce must not be already pledged
- Produce must not be sold
- Produce condition must be acceptable
- Produce must have valid market price
- Produce quantity must meet minimum requirements

---

### 2. Get Loan by ID

**Endpoint:** `GET /api/loans/:id`

**Auth:** Required

**Response:** `200 OK`
```json
{
  "_id": "690ec3eee4d3922a55551bc1",
  "farmer": {
    "_id": "690ec3eee4d3922a55551bbf",
    "firstName": "John",
    "lastName": "Kamau",
    "email": "john.kamau@example.com",
    "phone": "+254712345678"
  },
  "produce": {
    "_id": "690ec3eee4d3922a55551bc0",
    "produceType": "Tomatoes",
    "quantity": 500,
    "currentMarketPrice": 120,
    "condition": "Fresh",
    "status": "Listed"
  },
  "collateralValue": 60000,
  "principal": 36000,
  "ltv": 0.6,
  "termDays": 60,
  "interestRate": 0.18,
  "interestAmount": 1067.12,
  "originationFee": 720,
  "totalDue": 37787.12,
  "netDisbursement": 35280,
  "outstandingBalance": 37787.12,
  "amountPaid": 0,
  "status": "Pending",
  "appliedAt": "2025-11-08T10:30:00.000Z",
  "payments": [],
  "daysUntilDue": 60,
  "isOverdue": false
}
```

---

### 3. Get Farmer's Loans

**Endpoint:** `GET /api/loans/farmer/:farmerId`

**Auth:** Required

**Response:** `200 OK`
```json
[
  {
    "_id": "690ec3eee4d3922a55551bc1",
    "produce": {
      "produceType": "Tomatoes",
      "quantity": 500,
      "currentMarketPrice": 120
    },
    "principal": 36000,
    "status": "Active",
    "dueAt": "2026-01-07T10:30:00.000Z",
    "outstandingBalance": 25650.00,
    "appliedAt": "2025-11-08T10:30:00.000Z"
  }
]
```

---

### 4. Get Pending Loans (Admin)

**Endpoint:** `GET /api/loans/pending/all`

**Auth:** Required (Admin)

**Response:** `200 OK`
```json
[
  {
    "_id": "690ec3eee4d3922a55551bc1",
    "farmer": {
      "firstName": "John",
      "lastName": "Kamau",
      "email": "john.kamau@example.com",
      "phone": "+254712345678"
    },
    "produce": {
      "produceType": "Tomatoes",
      "quantity": 500,
      "currentMarketPrice": 120,
      "condition": "Fresh"
    },
    "collateralValue": 60000,
    "principal": 36000,
    "ltv": 0.6,
    "termDays": 60,
    "status": "Pending",
    "appliedAt": "2025-11-08T10:30:00.000Z",
    "purpose": "Purchase farm inputs"
  }
]
```

---

### 5. Get Active Loans (Admin)

**Endpoint:** `GET /api/loans/active/all`

**Auth:** Required (Admin)

**Response:** `200 OK`
```json
[
  {
    "_id": "690ec3eee4d3922a55551bc2",
    "farmer": {
      "firstName": "Mary",
      "lastName": "Wanjiku",
      "email": "mary.wanjiku@example.com"
    },
    "principal": 45000,
    "outstandingBalance": 31500,
    "dueAt": "2025-12-15T10:30:00.000Z",
    "daysUntilDue": 37,
    "status": "Active"
  }
]
```

---

### 6. Approve Loan (Admin)

**Endpoint:** `PATCH /api/loans/:id/approve`

**Auth:** Required (Admin)

**Response:** `200 OK`
```json
{
  "message": "Loan approved and disbursed successfully",
  "loan": {
    "_id": "690ec3eee4d3922a55551bc1",
    "status": "Active",
    "approvedAt": "2025-11-08T11:00:00.000Z",
    "approvedBy": {
      "firstName": "Admin",
      "lastName": "User"
    },
    "disbursedAt": "2025-11-08T11:00:00.000Z",
    "dueAt": "2026-01-07T11:00:00.000Z"
  }
}
```

**Side Effects:**
- Loan status changes from `Pending` to `Active`
- Produce marked as `isPledged: true`
- Produce linked to loan via `pledgedToLoan`
- Due date calculated
- Email sent to farmer with approval details

---

### 7. Reject Loan (Admin)

**Endpoint:** `PATCH /api/loans/:id/reject`

**Auth:** Required (Admin)

**Request Body:**
```json
{
  "reason": "Collateral value too low for requested amount"
}
```

**Response:** `200 OK`
```json
{
  "message": "Loan rejected",
  "loan": {
    "_id": "690ec3eee4d3922a55551bc1",
    "status": "Cancelled",
    "rejectionReason": "Collateral value too low for requested amount"
  }
}
```

---

### 8. Make Payment

**Endpoint:** `POST /api/loans/:id/repay`

**Auth:** Required

**Request Body:**
```json
{
  "amount": 10000,
  "method": "Mobile Money",
  "reference": "MPESA123456789",
  "note": "Partial payment"
}
```

**Response:** `200 OK`
```json
{
  "message": "Payment recorded successfully",
  "loan": {
    "_id": "690ec3eee4d3922a55551bc1",
    "amountPaid": 10000,
    "outstandingBalance": 27787.12,
    "payments": [
      {
        "amount": 10000,
        "paidAt": "2025-11-15T14:30:00.000Z",
        "method": "Mobile Money",
        "reference": "MPESA123456789",
        "note": "Partial payment"
      }
    ]
  },
  "outstandingBalance": 27787.12
}
```

**Full Repayment:**
If the payment fully repays the loan:
```json
{
  "message": "Loan fully repaid and collateral released",
  "loan": {
    "_id": "690ec3eee4d3922a55551bc1",
    "status": "Repaid",
    "repaidAt": "2025-11-15T14:30:00.000Z",
    "outstandingBalance": 0
  },
  "outstandingBalance": 0
}
```

**Side Effects (Full Repayment):**
- Loan status changes to `Repaid`
- Produce marked as `isPledged: false`
- Produce `pledgedToLoan` cleared
- Email sent to farmer confirming repayment and collateral release

---

### 9. Get Loan Statistics

**Endpoint:** `GET /api/loans/stats/summary`

**Auth:** Required (Admin)

**Response:** `200 OK`
```json
{
  "totalLoans": 15,
  "pendingLoans": 3,
  "activeLoans": 8,
  "repaidLoans": 4,
  "defaultedLoans": 0,
  "totalDisbursed": 540000,
  "totalRepaid": 180000,
  "totalOutstanding": 360000
}
```

---

## Loan Lifecycle

```
Draft → Pending → Approved → Active → Repaid
                     ↓
                Cancelled
                     
Active → (overdue) → Defaulted → Liquidation
```

### Status Descriptions

- **Draft**: Application started but not submitted
- **Pending**: Awaiting admin review
- **Approved**: Approved, funds to be disbursed
- **Active**: Funds disbursed, repayment ongoing
- **Repaid**: Fully repaid, collateral released
- **Defaulted**: Overdue past grace period
- **Liquidation**: Collateral being sold
- **Cancelled**: Application rejected or withdrawn

---

## Email Notifications

The system automatically sends emails for:

1. **Application Received** - When farmer submits application
2. **Loan Approved** - When admin approves and disburses funds
3. **Loan Rejected** - When admin rejects application
4. **Payment Received** - When farmer makes partial payment
5. **Loan Fully Repaid** - When loan is completely paid off
6. **Repayment Reminder** - 7 days, 3 days, and on due date (future feature)
7. **Margin Call** - When collateral value drops (future feature)
8. **Default Notice** - When loan becomes overdue (future feature)

---

## Calculations

### Collateral Value
```javascript
collateralValue = quantity (kg) × currentMarketPrice (KSH/kg)
```

### Principal
```javascript
principal = collateralValue × ltv
// ltv is clamped between 0.5 and 0.8
```

### Interest (Simple Interest)
```javascript
interest = principal × apr × (termDays / 365)
// apr = 0.18 (18% annual)
```

### Origination Fee
```javascript
originationFee = principal × 0.02  // 2%
```

### Total Due
```javascript
totalDue = principal + interest + originationFee
```

### Net Disbursement
```javascript
netDisbursement = principal - originationFee
// Farmer receives this amount
```

### Outstanding Balance
```javascript
outstandingBalance = totalDue - totalPaymentsMade
```

---

## Example Scenarios

### Scenario 1: Small Farmer Loan

**Collateral:**
- Produce: Cabbage
- Quantity: 300 kg
- Market Price: KSH 50/kg
- Collateral Value: KSH 15,000

**Loan Terms:**
- LTV: 60%
- Principal: KSH 9,000
- Term: 30 days
- Interest (18% APR): KSH 133.15
- Origination Fee (2%): KSH 180
- **Total Due: KSH 9,313.15**
- **Net Disbursement: KSH 8,820**

### Scenario 2: Medium Farmer Loan

**Collateral:**
- Produce: Tomatoes
- Quantity: 800 kg
- Market Price: KSH 120/kg
- Collateral Value: KSH 96,000

**Loan Terms:**
- LTV: 70%
- Principal: KSH 67,200
- Term: 90 days
- Interest (18% APR): KSH 2,981.92
- Origination Fee (2%): KSH 1,344
- **Total Due: KSH 71,525.92**
- **Net Disbursement: KSH 65,856**

---

## Testing

### Run Seed Script
```bash
cd server
node seed-loan-data.js
```

This creates:
- 1 pending loan application
- 2 active loans (one with partial payment)
- 1 fully repaid loan

### Test Endpoints
```bash
# Get pending loans
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/loans/pending/all

# Get loan statistics
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/loans/stats/summary

# Apply for loan
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "farmerId": "FARMER_ID",
    "produceId": "PRODUCE_ID",
    "requestedLtv": 0.6,
    "termDays": 60
  }' \
  http://localhost:5000/api/loans/apply
```

---

## Security & Compliance

### Data Protection
- All loan data encrypted in transit (HTTPS)
- Sensitive fields logged with masking
- Access controlled via authentication middleware

### Farmer Protection
- Clear terms displayed before application
- Email confirmation of all actions
- Collateral only released when fully repaid
- Grace period before default (configurable)

### Operational Requirements
1. **KYC (Know Your Customer)**: Verify farmer identity before approval
2. **Produce Verification**: Physical inspection or photo evidence
3. **Legal Agreement**: Farmers must sign consent to use produce as collateral
4. **Insurance**: Consider insurance for produce spoilage/damage
5. **Regulatory Compliance**: Check local laws for commodity-backed lending
6. **Default Process**: Documented procedure for liquidation
7. **Dispute Resolution**: Mechanism for farmer appeals

---

## Future Enhancements

1. **Automated Reminders**: Cron job for payment reminders
2. **Margin Calls**: Monitor market price changes, trigger margin calls
3. **Partial Collateral**: Allow pledging portion of produce
4. **Loan Extensions**: Request term extension with fees
5. **Early Repayment**: Discount for paying early
6. **Credit Scoring**: Build farmer credit history
7. **Mobile Money Integration**: Auto-debit repayments
8. **SMS Notifications**: Supplement email with SMS
9. **Marketplace Integration**: Auto-list collateral if defaulted
10. **Dashboard Analytics**: Loan performance metrics

---

## Support

For issues or questions about the loan system:
- **Email**: support@stayfresh.co.ke
- **Phone**: +254 700 000 000
- **Documentation**: See `/server/models/Loan.js` for schema details
- **Utils**: See `/server/utils/loanUtils.js` for calculation functions
