import { cn } from '@/design/cn';

const steps = [
  {
    number: '01',
    title: 'Install packages',
    description: 'Add the SDK and React bindings to your project with npm or yarn.',
    code: 'npm i @cantonconnect/sdk @cantonconnect/react',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Wrap provider',
    description: 'Wrap your app with CantonConnectProvider to enable wallet state management.',
    code: '<CantonConnectProvider>',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Open modal & connect',
    description: 'Use the hook to open the wallet modal and connect to any verified wallet.',
    code: 'const { connect } = useCantonConnect()',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-h2 text-fg mb-3">How it works</h2>
          <p className="text-body text-slate-500 max-w-xl mx-auto">
            Get up and running in under 5 minutes with just three simple steps.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-border -translate-y-1/2" />

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Step Card */}
                <div className={cn(
                  'relative bg-bg rounded-lg border border-border p-6',
                  'hover:shadow-card-hover hover:-translate-y-1',
                  'transition-all duration-hover ease-premium'
                )}>
                  {/* Step Number */}
                  <div className={cn(
                    'absolute -top-3 left-6',
                    'px-2 py-0.5 bg-brand-500 rounded-sm',
                    'text-xs font-bold text-fg'
                  )}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-md mb-4',
                    'bg-brand-50 text-brand-600',
                    'flex items-center justify-center'
                  )}>
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-h3 text-fg mb-2">{step.title}</h3>
                  <p className="text-small text-slate-500 mb-4">{step.description}</p>

                  {/* Code Preview */}
                  <div className="bg-slate-900 rounded-md px-3 py-2">
                    <code className="text-xs font-mono text-slate-300">{step.code}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
