import { CHECKOUT_STEPS } from '../constants';

const CheckoutStepper = ({ activeStep = 0 }) => (
  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 lg:mx-auto lg:max-w-4xl">
    {CHECKOUT_STEPS.map((step, i) => {
      const isActive = i === activeStep;
      const isDone = i < activeStep;
      return (
        <div
          key={step}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
            isActive
              ? 'border-accent bg-[#fdf6e8] text-primary'
              : isDone
                ? 'border-accent/40 bg-white text-primary'
                : 'border-slate-200 bg-white text-slate-400'
          }`}
        >
          <span
            className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${
              isActive || isDone ? 'bg-accent text-primary' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {i + 1}
          </span>
          <span className="whitespace-nowrap">{step}</span>
        </div>
      );
    })}
  </div>
);

export default CheckoutStepper;
