import { authed } from '../../orpc/base';
import { addDiscretionary, editDiscretionary, removeDiscretionary } from './discretionary.service';

// POST /api/spending/discretionary/add — log a new discretionary transaction.
export const discretionaryAdd = authed.spending.discretionaryAdd.handler(({ context, input }) =>
  addDiscretionary(context.username, input),
);

// POST /api/spending/discretionary/edit — edit an existing discretionary transaction.
export const discretionaryEdit = authed.spending.discretionaryEdit.handler(({ context, input }) =>
  editDiscretionary(context.username, input),
);

// POST /api/spending/discretionary/delete — delete a discretionary transaction.
export const discretionaryDelete = authed.spending.discretionaryDelete.handler(({ context, input }) =>
  removeDiscretionary(context.username, input.transactionId),
);
