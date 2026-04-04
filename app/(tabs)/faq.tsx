import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";

import { useScreenLayout } from "@/hooks/use-screen-layout";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function FAQScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: "Getting Started",
      question: "How do I book a cat sitter?",
      answer:
        "Simply search for sitters in your area, view their profiles and reviews, then send a booking request with your preferred dates. The sitter will respond within 24 hours to confirm or discuss details.",
    },
    {
      category: "Getting Started",
      question: "How do I become a cat sitter?",
      answer:
        "Sign up as a sitter, complete your profile with experience and availability, then go through our vetting process including background checks and interviews. Once approved, you can start accepting bookings.",
    },
    {
      category: "Pricing & Payment",
      question: "How much does cat sitting cost?",
      answer:
        "Prices vary by sitter and typically range from $25-$60 per visit. Sitters set their own rates based on experience, location, and services offered. You'll see the exact price before booking.",
    },
    {
      category: "Pricing & Payment",
      question: "When do I pay for a booking?",
      answer:
        "Payment is processed when the sitter accepts your booking request. The funds are held securely and released to the sitter after the service is completed. You can pay by credit card or bank transfer.",
    },
    {
      category: "Pricing & Payment",
      question: "What fees does 4 Paws charge?",
      answer:
        "It's only $3 per booking — that's it! There are no registration fees, monthly fees, or annual subscriptions. Each booking is charged at the sitter's daily rate plus the $3 booking fee, plus a small service fee to cover insurance, payment processing, customer support, and platform maintenance. All fees are included in the total price you see before confirming.",
    },
    {
      category: "Pricing & Payment",
      question: "How much is the booking fee?",
      answer:
        "It's only $3 per booking for cat owners — charged when you confirm a booking. There are no registration fees for anyone. Cat sitters join completely free. All payments are securely processed via Stripe (Visa, Mastercard, Amex, Apple Pay, Google Pay).",
    },
    {
      category: "Bookings",
      question: "Can I cancel a booking?",
      answer:
        "Yes. Free cancellation up to 7 days before the booking. 50% refund for cancellations 3-7 days before. No refund for cancellations within 3 days, unless there's an emergency or the sitter agrees.",
    },
    {
      category: "Bookings",
      question: "What if the sitter cancels?",
      answer:
        "You'll receive a full refund immediately. We'll also help you find a replacement sitter at no extra cost. Sitters who cancel frequently may be removed from the platform.",
    },
    {
      category: "Bookings",
      question: "Can I book multiple visits per day?",
      answer:
        "Absolutely! You can schedule morning and evening visits, or even more frequent check-ins. Discuss your needs with the sitter and they'll create a custom schedule for your cat.",
    },
    {
      category: "Safety & Trust",
      question: "Are all sitters background checked?",
      answer:
        "Yes, every sitter is thoroughly vetted by our team. We verify identity, work rights, qualifications, and references before any sitter can accept bookings on 4 Paws.",
    },
    {
      category: "Safety & Trust",
      question: "What if something goes wrong?",
      answer:
        "All bookings are covered by our comprehensive insurance (up to $20M liability). Contact our 24/7 emergency line immediately, and we'll coordinate appropriate response and support.",
    },
    {
      category: "Safety & Trust",
      question: "How do I know my cat is safe?",
      answer:
        "Sitters provide regular photo updates, you can message them anytime, and our optional virtual visit feature lets you see your cat live during visits. All sitters are trained in cat behavior and emergency protocols.",
    },
    {
      category: "Services",
      question: "What services do sitters provide?",
      answer:
        "Standard services include feeding, fresh water, litter box cleaning, playtime, and companionship. Many sitters also offer medication administration, grooming, plant watering, and mail collection.",
    },
    {
      category: "Services",
      question: "Can sitters give my cat medication?",
      answer:
        "Yes! Many of our sitters are trained to administer oral medications, injections, and special treatments. Filter your search for sitters with medication experience.",
    },
    {
      category: "Services",
      question: "Do you offer overnight stays?",
      answer:
        "Yes, many sitters offer overnight stays in your home. This provides maximum companionship for your cat and added home security. Overnight rates are typically higher than visit rates.",
    },
    {
      category: "Account & Profile",
      question: "How do I update my profile?",
      answer:
        "Go to your profile section, tap Edit, and update your information. For sitters, keep your availability calendar current to receive more booking requests.",
    },
    {
      category: "Account & Profile",
      question: "Can I have multiple cats on my profile?",
      answer:
        "Yes! Add as many cats as you have. Include photos, temperament, medical needs, and feeding schedules for each cat. This helps sitters provide the best care.",
    },
    {
      category: "Reviews & Ratings",
      question: "Can I leave a review?",
      answer:
        "Yes, after each completed booking, you can rate the sitter (1-5 stars) and leave a written review. Reviews help other cat owners make informed decisions.",
    },
    {
      category: "Reviews & Ratings",
      question: "What if I have a complaint?",
      answer:
        "Contact our support team immediately through the app or call our hotline. We take all complaints seriously and will investigate and resolve issues promptly.",
    },
  ];

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)));

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground text-center mb-2">
            Frequently Asked Questions
          </Text>
          <Text className="text-base text-muted text-center mb-8 leading-relaxed">
            Find answers to common questions about 4 Paws
          </Text>

          {/* FAQs by Category */}
          {categories.map((category, catIndex) => (
            <View key={catIndex} className="mb-6">
              <Text className="text-xl font-bold text-foreground mb-4">{category}</Text>
              {faqs
                .filter((faq) => faq.category === category)
                .map((faq, index) => {
                  const globalIndex = faqs.indexOf(faq);
                  const isExpanded = expandedIndex === globalIndex;

                  return (
                    <TouchableOpacity
                      key={globalIndex}
                      className="bg-surface rounded-2xl mb-3 border border-border overflow-hidden"
                      onPress={() => toggleExpand(globalIndex)}
                      activeOpacity={0.7}
                    >
                      <View className="p-5">
                        <View className="flex-row items-center justify-between">
                          <Text className="flex-1 text-base font-semibold text-foreground pr-3">
                            {faq.question}
                          </Text>
                          <View
                            style={{
                              transform: [{ rotate: isExpanded ? "180deg" : "0deg" }],
                            }}
                          >
                            <Text className="text-primary text-xl">▼</Text>
                          </View>
                        </View>

                        {isExpanded && (
                          <View className="mt-3 pt-3 border-t border-border">
                            <Text className="text-sm text-muted leading-relaxed">{faq.answer}</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
          ))}

          {/* Still Have Questions */}
          <View className="bg-secondary rounded-2xl p-6 mt-4">
            <Text className="text-xl font-bold text-foreground text-center mb-3">
              Still Have Questions?
            </Text>
            <Text className="text-base text-muted text-center leading-relaxed mb-4">
              Our support team is here to help! Contact us anytime and we'll get back to you within
              24 hours.
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-xl py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
