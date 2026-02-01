import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Lock,
  Network,
  CreditCard,
} from "lucide-react";

const Landing = () => {
  const features = [
    {
      title: "Programmable Payments",
      description:
        "Define recurring or one-time USDC payments that settle instantly on Polygon with low fees and deterministic finality.",
      icon: <CreditCard className="w-8 h-8" />,
    },
    {
      title: "Payment-Gated Access",
      description:
        "Unlock content, APIs, communities, or software features only when on-chain payment conditions are satisfied.",
      icon: <Lock className="w-8 h-8" />,
    },
    {
      title: "Privacy-Ready Verification",
      description:
        "Access is verified directly from on-chain payment state, without exposing subscriber lists or relying on backend auth.",
      icon: <Shield className="w-8 h-8" />,
    },
    {
      title: "Non-Custodial by Design",
      description:
        "Funds flow directly between users and creators with no platform custody, escrow, or withdrawal delays.",
      icon: <Network className="w-8 h-8" />,
    },
  ];

  const stats = [
    { label: "Payment Contracts Deployed", value: "6+" },
    { label: "Primary Network", value: "Polygon PoS" },
    { label: "Payment Asset", value: "USDC (Primary)" },
    { label: "Access Logic", value: "On-Chain" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero */}
      <section className="relative pt-56 pb-24">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto space-y-8 max-w-4xl">
            <h1 className="text-5xl font-semibold tracking-tighter sm:text-6xl lg:text-7xl">
              Programmable Payments
              <br />
              <span className="text-primary">Meet Access Control</span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed">
              SubHub is a Polygon-native protocol for USDC-first payments and
              payment-gated access, with non-custodial payouts and on-chain
              verification.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/discover">
                <Button size="lg" className="min-w-[260px] rounded-full text-lg h-12">
                  View Live Demo
                </Button>
              </Link>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-[260px] rounded-full text-lg h-12"
              >
                <a
                  href="https://github.com/M4N4N22/SubHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read Protocol Docs
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>

            </div>
          </div>
        </div>
      </section>

      {/* What is SubHub */}
      <section className="py-40 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl font-bold mb-4">What is SubHub?</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              SubHub is an on-chain payments and access primitive. It allows
              builders to define who can access content, software, APIs, or
              communities purely based on verifiable on-chain payment state.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="hover-lift">
                <CardContent className="p-8">
                  <div className="mb-4 text-primary">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Payments Are the Primitive.
            </h2>
            <p className="text-lg text-primary-foreground/80">
              Build subscriptions, gated access, and programmable monetization
              directly on Polygon using stablecoin payments — without custodians,
              logins, or opaque rules.
            </p>

            <div className="flex justify-center pt-6">
              <Link href="/discover">
                <Button size="lg" className="min-w-[220px]">
                  Launch on SubHub
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
