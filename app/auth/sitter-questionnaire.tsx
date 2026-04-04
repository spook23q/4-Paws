import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
  Platform,
  StyleSheet,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { useScreenLayout } from "@/hooks/use-screen-layout";

type Step = "work-rights" | "wwcc" | "qualifications" | "insurance" | "review";

const STEPS: Step[] = ["work-rights", "wwcc", "qualifications", "insurance", "review"];
const STEP_TITLES: Record<Step, string> = {
  "work-rights": "Work Rights",
  "wwcc": "Working With Children",
  "qualifications": "Qualifications",
  "insurance": "Insurance & ABN",
  "review": "Review & Submit",
};

export default function SitterQuestionnaireScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const params = useLocalSearchParams<{ userId?: string; token?: string }>();
  const [currentStep, setCurrentStep] = useState<Step>("work-rights");
  const [loading, setLoading] = useState(false);

  // Work Rights
  const [workRightsStatus, setWorkRightsStatus] = useState<string>("");
  const [visaType, setVisaType] = useState("");
  const [hasABN, setHasABN] = useState(false);
  const [abnNumber, setAbnNumber] = useState("");



  // WWCC (Working With Children Check) — relevant for households with children
  const [hasWWCC, setHasWWCC] = useState(false);
  const [wwccNumber, setWwccNumber] = useState("");
  const [wwccExpiry, setWwccExpiry] = useState("");
  const [wwccNotApplicable, setWwccNotApplicable] = useState(false);

  // Qualifications
  const [hasFirstAid, setHasFirstAid] = useState(false);
  const [firstAidExpiry, setFirstAidExpiry] = useState("");
  const [hasAnimalCare, setHasAnimalCare] = useState(false);
  const [animalCareDetails, setAnimalCareDetails] = useState("");
  const [hasPetFirstAid, setHasPetFirstAid] = useState(false);
  const [yearsExperience, setYearsExperience] = useState("");
  const [previousEmployer, setPreviousEmployer] = useState("");

  // Insurance
  const [hasPublicLiability, setHasPublicLiability] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [agreesToTerms, setAgreesToTerms] = useState(false);
  const [agreesToBackgroundCheck, setAgreesToBackgroundCheck] = useState(false);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  const hapticFeedback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case "work-rights":
        if (!workRightsStatus) {
          Alert.alert("Required", "Please select your work rights status in Australia.");
          return false;
        }
        if (workRightsStatus === "visa" && !visaType.trim()) {
          Alert.alert("Required", "Please specify your visa type.");
          return false;
        }
        if (workRightsStatus === "none") {
          Alert.alert(
            "Cannot Proceed",
            "You must have valid work rights in Australia to register as a cat sitter on 4 Paws. This is a legal requirement under Australian employment law."
          );
          return false;
        }
        return true;


      case "wwcc":
        // WWCC is optional but recommended
        return true;

      case "qualifications":
        if (!yearsExperience.trim()) {
          Alert.alert("Required", "Please enter your years of experience with cats.");
          return false;
        }
        return true;

      case "insurance":
        if (!agreesToTerms) {
          Alert.alert("Required", "You must agree to the Terms of Service and Code of Conduct to continue.");
          return false;
        }
        if (!agreesToBackgroundCheck) {
          Alert.alert("Required", "You must consent to a background verification check to continue.");
          return false;
        }
        return true;

      case "review":
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    hapticFeedback();
    if (!validateCurrentStep()) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const handleBack = () => {
    hapticFeedback();
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    hapticFeedback();
    setLoading(true);

    try {
      // Store compliance data locally for now
      const complianceData = {
        workRights: {
          status: workRightsStatus,
          visaType: workRightsStatus === "visa" ? visaType : null,
        },

        wwcc: {
          hasCheck: hasWWCC,
          number: hasWWCC ? wwccNumber : null,
          expiry: hasWWCC ? wwccExpiry : null,
          notApplicable: wwccNotApplicable,
        },
        qualifications: {
          hasFirstAid,
          firstAidExpiry: hasFirstAid ? firstAidExpiry : null,
          hasAnimalCare,
          animalCareDetails: hasAnimalCare ? animalCareDetails : null,
          hasPetFirstAid,
          yearsExperience: parseInt(yearsExperience) || 0,
          previousEmployer: previousEmployer || null,
        },
        insurance: {
          hasPublicLiability,
          provider: hasPublicLiability ? insuranceProvider : null,
          policyNumber: hasPublicLiability ? insurancePolicyNumber : null,
        },
        abn: hasABN ? abnNumber : null,
        agreedToTerms: agreesToTerms,
        agreedToBackgroundCheck: agreesToBackgroundCheck,
        submittedAt: new Date().toISOString(),
      };

      // Store locally with AsyncStorage
      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
      await AsyncStorage.setItem("@4paws_sitter_compliance", JSON.stringify(complianceData));

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      Alert.alert(
        "Application Submitted",
        "Your sitter application has been submitted for review. You can now set up your sitter profile.\n\nAll sitters are verified by 4 Paws before they can accept bookings.",
        [
          {
            text: "Set Up Profile",
            onPress: () => router.replace("/(tabs)" as any),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderWorkRightsOption = (value: string, label: string, description: string) => {
    const isSelected = workRightsStatus === value;
    return (
      <TouchableOpacity
        key={value}
        style={[
          styles.optionCard,
          {
            backgroundColor: isSelected ? `${colors.primary}10` : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
        onPress={() => {
          hapticFeedback();
          setWorkRightsStatus(value);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.optionRow}>
          <View style={[styles.radio, { borderColor: isSelected ? colors.primary : colors.border }]}>
            {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.optionLabel, { color: colors.foreground }]}>{label}</Text>
            <Text style={[styles.optionDesc, { color: colors.muted }]}>{description}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderToggleRow = (
    label: string,
    value: boolean,
    onToggle: (val: boolean) => void,
    description?: string
  ) => (
    <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={[styles.toggleLabel, { color: colors.foreground }]}>{label}</Text>
        {description && <Text style={[styles.toggleDesc, { color: colors.muted }]}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={(val) => {
          hapticFeedback();
          onToggle(val);
        }}
        trackColor={{ false: colors.border, true: `${colors.primary}80` }}
        thumbColor={value ? colors.primary : "#f4f3f4"}
      />
    </View>
  );

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    options?: { keyboardType?: any; maxLength?: number; multiline?: boolean }
  ) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            color: colors.foreground,
          },
          options?.multiline && { height: 80, textAlignVertical: "top" },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={options?.keyboardType || "default"}
        maxLength={options?.maxLength}
        multiline={options?.multiline}
      />
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case "work-rights":
        return (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Work Rights in Australia
            </Text>
            <Text style={[styles.stepDescription, { color: colors.muted }]}>
              Under Australian law, you must have valid work rights to provide paid services.
              Please confirm your work eligibility status.
            </Text>

            <View style={styles.infoBox}>
              <IconSymbol name="shield.fill" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>
                This information is required under the Fair Work Act 2009 (Cth)
              </Text>
            </View>

            {renderWorkRightsOption(
              "citizen",
              "Australian Citizen",
              "I am an Australian citizen with full work rights"
            )}
            {renderWorkRightsOption(
              "permanent-resident",
              "Permanent Resident",
              "I hold a permanent residency visa with unrestricted work rights"
            )}
            {renderWorkRightsOption(
              "visa",
              "Visa Holder with Work Rights",
              "I hold a valid visa that permits me to work in Australia"
            )}
            {workRightsStatus === "visa" && (
              <View style={{ marginTop: 12 }}>
                {renderInput("Visa Subclass / Type", visaType, setVisaType, "e.g. 482, 485, 500 (with work rights)")}
              </View>
            )}
            {renderWorkRightsOption(
              "none",
              "No Work Rights",
              "I do not currently have work rights in Australia"
            )}

            <View style={{ marginTop: 20 }}>
              <Text style={[styles.sectionSubtitle, { color: colors.foreground }]}>
                Australian Business Number (ABN)
              </Text>
              <Text style={[styles.stepDescription, { color: colors.muted }]}>
                An ABN is recommended if you operate as a sole trader. You can register for free at abr.gov.au.
              </Text>
              {renderToggleRow("I have an ABN", hasABN, setHasABN)}
              {hasABN && renderInput("ABN Number", abnNumber, setAbnNumber, "e.g. 12 345 678 901", { keyboardType: "numeric", maxLength: 14 })}
            </View>
          </View>
        );


      case "wwcc":
        return (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Working With Children Check (WWCC)
            </Text>
            <Text style={[styles.stepDescription, { color: colors.muted }]}>
              While cat sitting primarily involves animals, some households may have children present.
              A WWCC demonstrates your commitment to safety and may be required by some clients.
            </Text>

            <View style={styles.infoBox}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.primary }]}>
                In NSW, apply through Service NSW — free for volunteers, $80 for paid workers
              </Text>
            </View>

            {renderToggleRow(
              "Not applicable — I will only sit in child-free homes",
              wwccNotApplicable,
              (val) => {
                setWwccNotApplicable(val);
                if (val) setHasWWCC(false);
              }
            )}

            {!wwccNotApplicable && (
              <>
                {renderToggleRow(
                  "I have a current NSW Working With Children Check",
                  hasWWCC,
                  setHasWWCC,
                  "Valid for 5 years from date of issue"
                )}

                {hasWWCC && (
                  <View style={{ marginTop: 12 }}>
                    {renderInput("WWCC Number", wwccNumber, setWwccNumber, "e.g. WWC1234567E")}
                    {renderInput("Expiry Date (DD/MM/YYYY)", wwccExpiry, setWwccExpiry, "e.g. 15/03/2029")}
                  </View>
                )}
              </>
            )}
          </View>
        );

      case "qualifications":
        return (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Qualifications & Experience
            </Text>
            <Text style={[styles.stepDescription, { color: colors.muted }]}>
              Tell us about your experience and qualifications. This helps cat owners
              make informed decisions when choosing a sitter.
            </Text>

            {renderInput(
              "Years of Experience with Cats *",
              yearsExperience,
              setYearsExperience,
              "e.g. 5",
              { keyboardType: "numeric", maxLength: 2 }
            )}

            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionSubtitle, { color: colors.foreground }]}>First Aid</Text>
              {renderToggleRow(
                "I hold a current First Aid Certificate",
                hasFirstAid,
                setHasFirstAid,
                "HLTAID011 — Provide First Aid (or equivalent)"
              )}
              {hasFirstAid && renderInput("Expiry Date (DD/MM/YYYY)", firstAidExpiry, setFirstAidExpiry, "e.g. 15/03/2027")}
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionSubtitle, { color: colors.foreground }]}>Pet First Aid</Text>
              {renderToggleRow(
                "I have completed a Pet First Aid course",
                hasPetFirstAid,
                setHasPetFirstAid,
                "Any accredited pet first aid or animal care course"
              )}
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionSubtitle, { color: colors.foreground }]}>Animal Care Qualifications</Text>
              {renderToggleRow(
                "I hold formal animal care qualifications",
                hasAnimalCare,
                setHasAnimalCare,
                "e.g. Certificate III/IV in Animal Studies, Vet Nursing"
              )}
              {hasAnimalCare && renderInput(
                "Qualification Details",
                animalCareDetails,
                setAnimalCareDetails,
                "e.g. Certificate III in Animal Studies — TAFE NSW 2022",
                { multiline: true }
              )}
            </View>

            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionSubtitle, { color: colors.foreground }]}>References</Text>
              {renderInput(
                "Previous Employer / Reference (Optional)",
                previousEmployer,
                setPreviousEmployer,
                "e.g. Sydney Cat Clinic — Dr. Smith",
                { multiline: true }
              )}
            </View>
          </View>
        );

      case "insurance":
        return (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Insurance & Agreements
            </Text>
            <Text style={[styles.stepDescription, { color: colors.muted }]}>
              Public liability insurance protects you and your clients. While 4 Paws provides
              platform-level coverage, having your own policy is recommended.
            </Text>

            <View style={{ marginTop: 8 }}>
              <Text style={[styles.sectionSubtitle, { color: colors.foreground }]}>Public Liability Insurance</Text>
              {renderToggleRow(
                "I have my own Public Liability Insurance",
                hasPublicLiability,
                setHasPublicLiability,
                "Recommended minimum $10M coverage"
              )}
              {hasPublicLiability && (
                <View style={{ marginTop: 12 }}>
                  {renderInput("Insurance Provider", insuranceProvider, setInsuranceProvider, "e.g. Allianz, QBE, CGU")}
                  {renderInput("Policy Number", insurancePolicyNumber, setInsurancePolicyNumber, "e.g. PLI-987654")}
                </View>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.sectionSubtitle, { color: colors.foreground, marginBottom: 12 }]}>
              Required Agreements
            </Text>

            <View style={[styles.agreementBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {renderToggleRow(
                "I agree to the 4 Paws Terms of Service and Sitter Code of Conduct *",
                agreesToTerms,
                setAgreesToTerms,
                "Including duty of care obligations, cancellation policy, and payment terms"
              )}
            </View>

            <View style={[styles.agreementBox, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 12 }]}>
              {renderToggleRow(
                "I consent to a background verification check *",
                agreesToBackgroundCheck,
                setAgreesToBackgroundCheck,
                "4 Paws may verify the information provided in this application, including qualification details and references"
              )}
            </View>

            <View style={[styles.requirementBox, { backgroundColor: `${colors.warning}10`, borderColor: colors.warning, marginTop: 16 }]}>
              <IconSymbol name="shield.fill" size={16} color={colors.warning} />
              <Text style={[styles.requirementText, { color: colors.warning }]}>
                Items marked with * are mandatory to proceed
              </Text>
            </View>
          </View>
        );

      case "review":
        return (
          <View>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>
              Review Your Application
            </Text>
            <Text style={[styles.stepDescription, { color: colors.muted }]}>
              Please review your details before submitting. You can go back to make changes.
            </Text>

            {/* Work Rights Summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>Work Rights</Text>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>Status:</Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {workRightsStatus === "citizen" ? "Australian Citizen" :
                   workRightsStatus === "permanent-resident" ? "Permanent Resident" :
                   workRightsStatus === "visa" ? `Visa Holder (${visaType})` : "—"}
                </Text>
              </View>
              {hasABN && (
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, { color: colors.muted }]}>ABN:</Text>
                  <Text style={[styles.reviewValue, { color: colors.foreground }]}>{abnNumber}</Text>
                </View>
              )}
            </View>



            {/* WWCC Summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>Working With Children</Text>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>Status:</Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>
                  {wwccNotApplicable ? "Not Applicable" : hasWWCC ? `Provided (${wwccNumber})` : "Not Provided"}
                </Text>
              </View>
            </View>

            {/* Qualifications Summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>Qualifications</Text>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>Experience:</Text>
                <Text style={[styles.reviewValue, { color: colors.foreground }]}>{yearsExperience} years</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>First Aid:</Text>
                <Text style={[styles.reviewValue, { color: hasFirstAid ? colors.success : colors.muted }]}>
                  {hasFirstAid ? "Yes" : "No"}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>Pet First Aid:</Text>
                <Text style={[styles.reviewValue, { color: hasPetFirstAid ? colors.success : colors.muted }]}>
                  {hasPetFirstAid ? "Yes" : "No"}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>Animal Care Quals:</Text>
                <Text style={[styles.reviewValue, { color: hasAnimalCare ? colors.success : colors.muted }]}>
                  {hasAnimalCare ? "Yes" : "No"}
                </Text>
              </View>
            </View>

            {/* Insurance Summary */}
            <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.reviewCardTitle, { color: colors.foreground }]}>Insurance & Agreements</Text>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>Public Liability:</Text>
                <Text style={[styles.reviewValue, { color: hasPublicLiability ? colors.success : colors.muted }]}>
                  {hasPublicLiability ? `Yes (${insuranceProvider})` : "No (covered by 4 Paws platform)"}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>Terms Agreed:</Text>
                <IconSymbol name="checkmark.circle.fill" size={18} color={colors.success} />
              </View>
              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, { color: colors.muted }]}>Background Check:</Text>
                <IconSymbol name="checkmark.circle.fill" size={18} color={colors.success} />
              </View>
            </View>

            {/* Document Upload CTA */}
            <View style={[styles.reviewCard, { backgroundColor: `${colors.primary}08`, borderColor: colors.primary }]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <IconSymbol name="camera.fill" size={20} color={colors.primary} />
                <Text style={[styles.reviewCardTitle, { color: colors.primary, marginBottom: 0 }]}>Upload Documents</Text>
              </View>
              <Text style={{ fontSize: 13, color: colors.muted, lineHeight: 18, marginBottom: 12 }}>
                Upload your WWCC, first aid certificates, and other compliance documents now or after completing registration.
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  paddingVertical: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
                onPress={() => {
                  hapticFeedback();
                  router.push("/profile/compliance-documents" as any);
                }}
                activeOpacity={0.8}
              >
                <IconSymbol name="camera.fill" size={18} color="#FFFFFF" />
                <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "700" }}>Upload Documents Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleBack} activeOpacity={0.7} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Sitter Application
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
              Step {currentStepIndex + 1} of {STEPS.length} — {STEP_TITLES[currentStep]}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
          <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.primary }]} />
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        >
          {renderStepContent()}
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={[styles.bottomBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          {currentStep === "review" ? (
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              <IconSymbol name="checkmark.seal.fill" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {loading ? "Submitting..." : "Submit Application"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    height: 4,
    width: "100%",
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E6F4FE",
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
  },
  requirementBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  helpBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 12,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 22,
  },
  optionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggleDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  agreementBox: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  reviewCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  reviewCardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  reviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  reviewLabel: {
    fontSize: 13,
    flex: 1,
  },
  reviewValue: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },
  reviewBadge: {
    flex: 1,
    alignItems: "flex-end",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
