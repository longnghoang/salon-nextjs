# Intent: Edit Order Payment Details & Status

## Confirmed Intent Statement

- **Outcome**: Add a "Bank Transfer" checkbox (`default = false`), an editable "Payment Amount" input formatted with thousand separators (e.g. `250,000` VND), and an auto-calculated "Remaining Amount" display (`grandTotal - paymentAmount`) to the Order Dialog, automatically setting `isPayment = true` whenever `paymentAmount > 0` while preserving the order's existing lifecycle status upon save.
- **User**: Salon staff and receptionists recording customer payments and managing order progress.
- **Why now**: The previous Edit Order dialog hardcoded status to `New` (`1`), `paymentAmount: 0`, `isPayment: false`, and `isBanking: false` upon submission, discarding existing payment details and lifecycle progress.
- **Success**: Opening an existing order pre-populates its current payment values and preserves its status; modifying bank transfer or entering thousand-separated payment amounts dynamically updates the remaining balance and automatically sets `isPayment = paymentAmount > 0`, persisting correctly to `PUT /api/Orders/{id}`; tests pass with strict typing.
- **Constraint**: Fit seamlessly into the existing `OrderFormDialog` layout and design system (Tailwind CSS v4, shadcn/ui components), maintaining full TypeScript strict typing and test coverage.
- **Out of scope**: Status dropdown in the dialog header, payment status badges next to the checkbox, external payment gateway processing (e.g. Stripe, VNPay QR code generation), multiple split payment methods on a single order, or inline table editing without opening the dialog.
