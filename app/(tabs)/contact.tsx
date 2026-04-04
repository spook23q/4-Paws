import { View, Text, ScrollView, TextInput, TouchableOpacity, Linking } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { FontAwesome } from "@expo/vector-icons";

import { useScreenLayout } from "@/hooks/use-screen-layout";

export default function ContactScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const contactMethods = [
    {
      icon: "message.fill" as const,
      title: "Email Us",
      value: "hello@4paws.com.au",
      action: () => Linking.openURL("mailto:hello@4paws.com.au"),
    },
    {
      icon: "phone.fill" as const,
      title: "Call Us",
      value: "1300 4 PAWS (1300 472 927)",
      action: () => Linking.openURL("tel:1300472927"),
    },
    {
      icon: "clock.fill" as const,
      title: "Business Hours",
      value: "Mon-Fri: 8am-8pm\nSat-Sun: 9am-6pm AEST",
      action: null,
    },
  ];

  const offices = [
    {
      city: "Sydney",
      address: "Level 5, 123 George Street\nSydney NSW 2000",
    },
    {
      city: "Melbourne",
      address: "Suite 8, 456 Collins Street\nMelbourne VIC 3000",
    },
    {
      city: "Brisbane",
      address: "Level 3, 789 Queen Street\nBrisbane QLD 4000",
    },
  ];

  const handleSubmit = () => {
    // In a real app, this would send the form data to the backend
    // Show success message and clear form
    alert("Thank you for contacting us! We'll get back to you within 24 hours.");
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <ScreenContainer>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8" style={{ alignSelf: "center", width: "100%", maxWidth: contentMaxWidth || undefined }}>
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground text-center mb-2">Contact Us</Text>
          <Text className="text-base text-muted text-center mb-8 leading-relaxed">
            We'd love to hear from you! Get in touch with our team.
          </Text>

          {/* Contact Methods */}
          <View className="mb-8">
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                className="bg-surface rounded-2xl p-5 mb-4 border border-border"
                onPress={method.action || undefined}
                disabled={!method.action}
                activeOpacity={method.action ? 0.7 : 1}
              >
                <View className="flex-row items-start">
                  <View className="bg-primary rounded-full p-3 mr-4">
                    <IconSymbol name={method.icon} size={24} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground mb-2">{method.title}</Text>
                    <Text className="text-sm text-muted leading-relaxed">{method.value}</Text>
                  </View>
                  {method.action && (
                    <IconSymbol name="chevron.right" size={20} color={colors.muted} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Contact Form */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Send Us a Message</Text>
            <View className="bg-surface rounded-2xl p-5 border border-border">
              {/* Name Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Your Name</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="John Doe"
                  placeholderTextColor="#1F2937"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Email Address</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="john@example.com"
                  placeholderTextColor="#1F2937"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Subject Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Subject</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="How can we help?"
                  placeholderTextColor="#1F2937"
                  value={subject}
                  onChangeText={setSubject}
                />
              </View>

              {/* Message Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Message</Text>
                <TextInput
                  className="bg-background border border-border rounded-xl px-4 py-3 text-foreground"
                  placeholder="Tell us more about your inquiry..."
                  placeholderTextColor="#1F2937"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  style={{ minHeight: 120 }}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className="bg-primary rounded-xl py-4 items-center"
                onPress={handleSubmit}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Office Locations */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4">Our Offices</Text>
            {offices.map((office, index) => (
              <View key={index} className="bg-surface rounded-2xl p-5 mb-4 border border-border">
                <Text className="text-lg font-bold text-foreground mb-2">{office.city}</Text>
                <Text className="text-sm text-muted leading-relaxed">{office.address}</Text>
              </View>
            ))}
          </View>

          {/* Social Media */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-foreground mb-4 text-center">Follow Us</Text>
            <Text className="text-base text-muted text-center mb-6 leading-relaxed">
              Stay connected with 4 Paws on social media for updates, tips, and cute cat content!
            </Text>
            <View className="flex-row justify-center items-center gap-4">
              <TouchableOpacity
                className="bg-surface rounded-full p-4 border border-border"
                onPress={() => Linking.openURL("https://facebook.com/4paws")}
                activeOpacity={0.7}
              >
                <FontAwesome name="facebook" size={28} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-surface rounded-full p-4 border border-border"
                onPress={() => Linking.openURL("https://instagram.com/4paws")}
                activeOpacity={0.7}
              >
                <FontAwesome name="instagram" size={28} color="#E4405F" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-surface rounded-full p-4 border border-border"
                onPress={() => Linking.openURL("https://twitter.com/4paws")}
                activeOpacity={0.7}
              >
                <FontAwesome name="twitter" size={28} color="#1DA1F2" />
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-surface rounded-full p-4 border border-border"
                onPress={() => Linking.openURL("https://linkedin.com/company/4paws")}
                activeOpacity={0.7}
              >
                <FontAwesome name="linkedin" size={28} color="#0A66C2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Link */}
          <View className="bg-secondary rounded-2xl p-6 mb-8">
            <Text className="text-xl font-bold text-foreground text-center mb-3">
              Looking for Quick Answers?
            </Text>
            <Text className="text-base text-muted text-center leading-relaxed mb-4">
              Check out our FAQ section for instant answers to common questions about our services,
              pricing, and booking process.
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-xl py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">View FAQ</Text>
            </TouchableOpacity>
          </View>

          {/* Emergency Contact */}
          <View className="bg-primary/10 rounded-2xl p-5 border-2 border-primary/20">
            <Text className="text-lg font-bold text-foreground text-center mb-2">
              Emergency Contact
            </Text>
            <Text className="text-sm text-muted text-center leading-relaxed mb-3">
              If you have an urgent matter regarding an active booking, please call our 24/7
              emergency line:
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-xl py-3 items-center"
              onPress={() => Linking.openURL("tel:1300472927")}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">1300 4 PAWS</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
