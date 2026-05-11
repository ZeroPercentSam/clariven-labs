import { Check, X } from 'lucide-react';

const HAPPY_PATH = [
  { id: 'pending_payment', label: 'Awaiting payment' },
  { id: 'processing', label: 'Payment processing' },
  { id: 'paid', label: 'Paid' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
] as const;

type StepState = 'done' | 'current' | 'upcoming';

function indexOf(status: string): number {
  return HAPPY_PATH.findIndex((s) => s.id === status);
}

export function OrderStatusTimeline({ status }: { status: string }) {
  const isCancelled = status === 'cancelled';
  const isFailed = status === 'failed';
  const offHappyPath = isCancelled || isFailed;
  const currentIndex = offHappyPath ? -1 : indexOf(status);

  if (offHappyPath) {
    return (
      <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${
            isCancelled
              ? 'bg-cl-gray-100 text-cl-gray-700 border border-cl-gray-300'
              : 'bg-red-500/10 text-red-700 border border-red-500/30'
          }`}
        >
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${
              isCancelled ? 'bg-cl-gray-300 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </span>
          <span className="text-sm font-semibold">
            {isCancelled ? 'Order cancelled' : 'Order failed'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl p-5">
      <h3 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-cl-gray-400 mb-4">
        Order progress
      </h3>
      <ol className="grid grid-cols-6 gap-1 relative">
        {HAPPY_PATH.map((step, i) => {
          const state: StepState =
            i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming';
          return (
            <li key={step.id} className="relative flex flex-col items-center text-center">
              {/* Connecting line to next step (drawn behind the dot) */}
              {i < HAPPY_PATH.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute top-3 left-1/2 right-[-50%] h-0.5 ${
                    state === 'done' ? 'bg-cl-teal' : 'bg-cl-gray-200'
                  }`}
                />
              ) : null}
              <span
                className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                  state === 'done'
                    ? 'bg-cl-teal text-white'
                    : state === 'current'
                      ? 'bg-cl-teal text-white ring-4 ring-cl-teal/20'
                      : 'bg-cl-gray-200 text-cl-gray-500'
                }`}
              >
                {state === 'done' || (state === 'current' && i === HAPPY_PATH.length - 1) ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`mt-2 text-[10px] leading-tight ${
                  state === 'upcoming' ? 'text-cl-gray-400' : 'text-cl-navy font-medium'
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
