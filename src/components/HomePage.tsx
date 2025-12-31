import React from 'react';
import { ArrowRight, Wand2, Zap, Shield, LayoutGrid, Code, Palette, Check } from 'lucide-react';

interface HomePageProps {
  onGetStarted: () => void;
}

const PRICING_TIERS = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for trying out our tools',
    features: [
      'Access to basic tools',
      '5 PDF conversions per month',
      '10MB max file size',
      'Basic image compression',
      'Standard support',
    ],
    limitations: [
      'No API access',
      'Limited exports',
      'Community support only',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '12',
    description: 'For professionals and small teams',
    features: [
      'All Free features',
      'Unlimited PDF conversions',
      '50MB max file size',
      'Advanced image compression',
      'Priority support',
      'API access',
      'Custom export formats',
      'Remove watermarks',
      'Batch processing',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: '49',
    description: 'For large teams and organizations',
    features: [
      'All Pro features',
      'Unlimited everything',
      '100MB max file size',
      'Custom integrations',
      'Dedicated support',
      'SSO authentication',
      'Advanced analytics',
      'Custom deployment',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export default function HomePage({ onGetStarted }: HomePageProps) {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white max-w-4xl mx-auto">
              Transform Your <span className="text-neon-500">Digital Tools</span> Into 
              Powerful Solutions
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Stop wasting time with scattered online tools. Get everything you need in one place
              to optimize your web presence and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onGetStarted} className="btn-primary text-base">
                Get Started
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
              <button onClick={onGetStarted} className="btn-secondary text-base">
                View All Tools
                <LayoutGrid className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold text-white">
            Everything You Need in One Place
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            A comprehensive suite of professional tools designed to help you work faster and smarter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="card card-hover">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 rounded-lg bg-neon-500 bg-opacity-10">
                  <feature.icon className="w-6 h-6 text-neon-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl font-bold text-white">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Choose the plan that best fits your needs. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`card relative ${
                tier.highlighted
                  ? 'ring-2 ring-neon-500 scale-105'
                  : 'hover:border-neon-500'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-neon-500 text-jet-900 text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="mt-2 text-sm text-gray-400">{tier.description}</p>
                </div>

                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-white">${tier.price}</span>
                  <span className="ml-2 text-gray-400">/month</span>
                </div>

                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-gray-300">
                      <Check className="w-5 h-5 text-neon-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {tier.limitations?.map((limitation) => (
                    <li key={limitation} className="flex items-center gap-2 text-gray-500">
                      <Check className="w-5 h-5 text-gray-700 flex-shrink-0" />
                      <span>{limitation}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={onGetStarted}
                  className={`w-full ${
                    tier.highlighted ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          All prices in USD. Billed monthly or annually. 14-day money-back guarantee.
        </p>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-white">
              Work Smarter, Not Harder
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neon-500 bg-opacity-10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-neon-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-400">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-neon-500 to-neon-600 p-1">
              <div className="absolute inset-0 bg-jet-950 rounded-2xl m-1" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card bg-gradient-to-r from-neon-500 to-neon-600 border-0">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Ready to Streamline Your Workflow?
            </h2>
            <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals who are already saving time and improving their results.
            </p>
            <button onClick={onGetStarted} className="btn bg-white text-neon-600 hover:bg-gray-100 text-base">
              Get Started Now
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Wand2,
    title: 'Media Tools',
    description: 'Transform PDFs, compress images, and edit visuals with professional-grade tools.',
  },
  {
    icon: Code,
    title: 'SEO & Meta',
    description: 'Optimize your content with meta tags, schema markup, and SEO-friendly URLs.',
  },
  {
    icon: Shield,
    title: 'Analytics & Marketing',
    description: 'Make data-driven decisions with A/B testing and campaign tracking tools.',
  },
  {
    icon: Palette,
    title: 'Design Tools',
    description: 'Create beautiful color palettes and maintain consistent brand aesthetics.',
  },
  {
    icon: LayoutGrid,
    title: 'Text Tools',
    description: 'Convert text cases and access commonly used symbols effortlessly.',
  },
  {
    icon: Zap,
    title: 'Quick Actions',
    description: 'Perform common tasks quickly with our streamlined interface.',
  },
];

const benefits = [
  {
    icon: Zap,
    title: 'Save Valuable Time',
    description: 'Stop switching between different tools and services. Get everything you need in one place.',
  },
  {
    icon: Shield,
    title: 'Professional Results',
    description: 'Generate high-quality outputs that meet industry standards and best practices.',
  },
  {
    icon: LayoutGrid,
    title: 'Stay Organized',
    description: 'Keep all your tools and generated content organized in a single dashboard.',
  },
];