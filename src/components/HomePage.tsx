import React from 'react';
import { ArrowRight, Wand2, Zap, Shield, LayoutGrid, Code, Palette } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 relative z-10">
          <div className="text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white max-w-4xl mx-auto">
              Transform Your <span className="text-brand-coral">Digital Tools</span> Into 
              Powerful Solutions
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Stop wasting time with scattered online tools. Get everything you need in one place
              to optimize your web presence and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary text-base">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="btn-secondary text-base">
                View All Tools
                <LayoutGrid className="w-5 h-5" />
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
                <div className="p-2 rounded-lg bg-brand-coral bg-opacity-10">
                  <feature.icon className="w-6 h-6 text-brand-coral" />
                </div>
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              </div>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
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
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-coral bg-opacity-10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-brand-coral" />
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
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand-coral to-coral-700 p-1">
              <div className="absolute inset-0 bg-navy-800 rounded-2xl m-1" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card bg-gradient-to-r from-brand-coral to-coral-700 border-0">
          <div className="text-center space-y-6">
            <h2 className="text-3xl font-bold text-white">
              Ready to Streamline Your Workflow?
            </h2>
            <p className="text-xl text-white text-opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals who are already saving time and improving their results.
            </p>
            <button className="btn bg-white text-coral-700 hover:bg-gray-100 text-base">
              Get Started Now
              <ArrowRight className="w-5 h-5" />
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