import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator,
  FlatList,
  Linking,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useState, useCallback } from "react";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";

import { useScreenLayout } from "@/hooks/use-screen-layout";

type DocumentType =
  | "wwcc"
  | "first_aid"
  | "pet_first_aid"
  | "animal_care_cert"
  | "public_liability_insurance"
  | "abn_registration"
  | "other";

interface DocumentTypeInfo {
  type: DocumentType;
  title: string;
  description: string;
  required: boolean;
  icon: "shield.fill" | "checkmark.seal.fill" | "heart.fill" | "pawprint.fill" | "creditcard.fill" | "star.fill";
}

const DOCUMENT_TYPES: DocumentTypeInfo[] = [
  {
    type: "wwcc",
    title: "Working With Children Check",
    description: "NSW Working With Children Check (WWCC) — valid for 5 years",
    required: false,
    icon: "checkmark.seal.fill",
  },
  {
    type: "first_aid",
    title: "First Aid Certificate",
    description: "HLTAID011 — Provide First Aid (or equivalent) — valid for 3 years",
    required: false,
    icon: "heart.fill",
  },
  {
    type: "pet_first_aid",
    title: "Pet First Aid Certificate",
    description: "Any accredited pet first aid or animal care first aid course",
    required: false,
    icon: "pawprint.fill",
  },
  {
    type: "animal_care_cert",
    title: "Animal Care Qualification",
    description: "Certificate III/IV in Animal Studies, Vet Nursing, or equivalent",
    required: false,
    icon: "star.fill",
  },
  {
    type: "public_liability_insurance",
    title: "Public Liability Insurance",
    description: "Certificate of Currency — recommended minimum $10M coverage",
    required: false,
    icon: "creditcard.fill",
  },
  {
    type: "abn_registration",
    title: "ABN Registration",
    description: "Australian Business Number registration confirmation",
    required: false,
    icon: "creditcard.fill",
  },
  {
    type: "other",
    title: "Other Document",
    description: "Any other relevant compliance or qualification document",
    required: false,
    icon: "star.fill",
  },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pending Review", color: "#F59E0B", bgColor: "#FEF3C7" },
  verified: { label: "Verified", color: "#22C55E", bgColor: "#DCFCE7" },
  rejected: { label: "Rejected", color: "#EF4444", bgColor: "#FEE2E2" },
  expired: { label: "Expired", color: "#6B7280", bgColor: "#F3F4F6" },
};

export default function ComplianceDocumentsScreen() {
  const colors = useColors();
  const { contentMaxWidth } = useScreenLayout();
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);

  const {
    data: documents,
    isLoading,
    refetch,
  } = trpc.compliance.list.useQuery(undefined, {
    enabled: !!user && user.role === "sitter",
  });

  const { data: summary } = trpc.compliance.getSummary.useQuery(undefined, {
    enabled: !!user && user.role === "sitter",
  });

  const uploadMutation = trpc.compliance.upload.useMutation({
    onSuccess: () => {
      refetch();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert(
        "Document Uploaded",
        "Your document has been uploaded and is pending verification. We'll review it within 1-2 business days."
      );
    },
    onError: (error) => {
      Alert.alert("Upload Failed", error.message || "Failed to upload document. Please try again.");
    },
  });

  const deleteMutation = trpc.compliance.delete.useMutation({
    onSuccess: () => {
      refetch();
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    },
  });

  const hapticFeedback = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePickDocument = useCallback(
    async (docType: DocumentType) => {
      hapticFeedback();
      setSelectedType(docType);

      Alert.alert("Upload Document", "Choose how to upload your document", [
        {
          text: "Take Photo",
          onPress: () => pickFromCamera(docType),
        },
        {
          text: "Choose from Library",
          onPress: () => pickFromGallery(docType),
        },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    []
  );

  const pickFromCamera = async (docType: DocumentType) => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take a photo of your document.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      await uploadDocument(docType, result.assets[0]);
    }
  };

  const pickFromGallery = async (docType: DocumentType) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed to choose a document.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      await uploadDocument(docType, result.assets[0]);
    }
  };

  const uploadDocument = async (
    docType: DocumentType,
    asset: ImagePicker.ImagePickerAsset
  ) => {
    if (!asset.base64) return;

    setUploading(true);
    try {
      const fileName = asset.fileName || `${docType}-${Date.now()}.jpg`;
      const mimeType = asset.mimeType || "image/jpeg";
      const fileSize = asset.fileSize || Math.ceil(asset.base64.length * 0.75);

      await uploadMutation.mutateAsync({
        documentType: docType,
        fileName,
        base64: asset.base64,
        mimeType,
        fileSize,
      });
    } catch (error) {
      // Error handled by mutation onError
    } finally {
      setUploading(false);
      setSelectedType(null);
    }
  };

  const handleDeleteDocument = (docId: string, docName: string) => {
    hapticFeedback();
    Alert.alert(
      "Delete Document",
      `Are you sure you want to delete "${docName}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ id: docId });
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete document");
            }
          },
        },
      ]
    );
  };

  const handleViewDocument = (url: string) => {
    hapticFeedback();
    Linking.openURL(url);
  };

  const getDocumentsForType = (type: DocumentType) => {
    return documents?.filter((d) => d.documentType === type) || [];
  };

  const renderSummaryCard = () => {
    if (!summary) return null;

    return (
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Compliance Overview</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: colors.primary }]}>{summary.totalDocuments}</Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>Uploaded</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: "#22C55E" }]}>{summary.verified}</Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>Verified</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: "#F59E0B" }]}>{summary.pendingVerification}</Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>Pending</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNumber, { color: "#EF4444" }]}>{summary.rejected + summary.expired}</Text>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>Action Req.</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDocumentTypeSection = (docTypeInfo: DocumentTypeInfo) => {
    const existingDocs = getDocumentsForType(docTypeInfo.type);
    const hasDocument = existingDocs.length > 0;
    const latestDoc = existingDocs[0];
    const statusConfig = latestDoc ? STATUS_CONFIG[latestDoc.verificationStatus] : null;

    return (
      <View
        key={docTypeInfo.type}
        style={[styles.docTypeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        {/* Header */}
        <View style={styles.docTypeHeader}>
          <View style={[styles.docTypeIconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <IconSymbol name={docTypeInfo.icon} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.docTypeTitleRow}>
              <Text style={[styles.docTypeTitle, { color: colors.foreground }]}>
                {docTypeInfo.title}
              </Text>
              {docTypeInfo.required && (
                <View style={[styles.requiredBadge, { backgroundColor: `${colors.error}15` }]}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: colors.error }}>REQUIRED</Text>
                </View>
              )}
            </View>
            <Text style={[styles.docTypeDesc, { color: colors.muted }]}>{docTypeInfo.description}</Text>
          </View>
        </View>

        {/* Existing Documents */}
        {existingDocs.map((doc) => {
          const docStatus = STATUS_CONFIG[doc.verificationStatus];
          return (
            <View
              key={doc.id}
              style={[styles.uploadedDoc, { backgroundColor: colors.background, borderColor: colors.border }]}
            >
              <View style={styles.uploadedDocInfo}>
                <Text style={[styles.uploadedDocName, { color: colors.foreground }]} numberOfLines={1}>
                  {doc.fileName}
                </Text>
                <View style={styles.uploadedDocMeta}>
                  {docStatus && (
                    <View style={[styles.statusBadge, { backgroundColor: docStatus.bgColor }]}>
                      <Text style={{ fontSize: 10, fontWeight: "600", color: docStatus.color }}>
                        {docStatus.label}
                      </Text>
                    </View>
                  )}
                  {doc.referenceNumber && (
                    <Text style={[styles.uploadedDocRef, { color: colors.muted }]}>
                      Ref: {doc.referenceNumber}
                    </Text>
                  )}
                </View>
                {doc.verificationStatus === "rejected" && doc.rejectionReason && (
                  <Text style={[styles.rejectionReason, { color: colors.error }]}>
                    Reason: {doc.rejectionReason}
                  </Text>
                )}
                {doc.expiryDate && (
                  <Text style={[styles.expiryText, { color: colors.muted }]}>
                    Expires: {doc.expiryDate}
                  </Text>
                )}
              </View>
              <View style={styles.uploadedDocActions}>
                <TouchableOpacity
                  onPress={() => handleViewDocument(doc.fileUrl)}
                  activeOpacity={0.7}
                  style={[styles.actionButton, { backgroundColor: `${colors.primary}15` }]}
                >
                  <IconSymbol name="arrow.right" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteDocument(doc.id, doc.fileName)}
                  activeOpacity={0.7}
                  style={[styles.actionButton, { backgroundColor: `${colors.error}15` }]}
                >
                  <IconSymbol name="trash.fill" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Upload Button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            {
              backgroundColor: hasDocument ? `${colors.primary}08` : `${colors.primary}15`,
              borderColor: colors.primary,
              borderStyle: "dashed",
            },
          ]}
          onPress={() => handlePickDocument(docTypeInfo.type)}
          disabled={uploading && selectedType === docTypeInfo.type}
          activeOpacity={0.7}
        >
          {uploading && selectedType === docTypeInfo.type ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <IconSymbol name="camera.fill" size={18} color={colors.primary} />
              <Text style={[styles.uploadButtonText, { color: colors.primary }]}>
                {hasDocument ? "Upload Another" : "Upload Document"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (!user || user.role !== "sitter") {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <IconSymbol name="shield.fill" size={48} color={colors.muted} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Sitter Access Only</Text>
          <Text style={[styles.emptyDesc, { color: colors.muted }]}>
            This section is only available for registered cat sitters.
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Compliance Documents</Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            Upload and manage your verification documents
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: "#E6F4FE" }]}>
          <IconSymbol name="shield.fill" size={16} color={colors.primary} />
          <Text style={[styles.infoBannerText, { color: colors.primary }]}>
            Upload clear photos or scans of your documents. Accepted formats: JPEG, PNG, PDF. Max 10MB per file.
          </Text>
        </View>

        {/* Summary Card */}
        {renderSummaryCard()}

        {/* Document Type Sections */}
        {DOCUMENT_TYPES.map(renderDocumentTypeSection)}

        {/* Help Section */}
        <View style={[styles.helpSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.helpTitle, { color: colors.foreground }]}>Need Help?</Text>
          <Text style={[styles.helpText, { color: colors.muted }]}>
            {"\u2022"} WWCC (NSW): Apply through Service NSW{"\n"}
            {"\u2022"} First Aid: HLTAID011 through any RTO (e.g., St John Ambulance){"\n"}
            {"\u2022"} Public Liability: Contact Allianz, QBE, or CGU for quotes
          </Text>
          <Text style={[styles.helpNote, { color: colors.muted }]}>
            Documents are reviewed within 1-2 business days. You'll receive a notification once verified.
          </Text>
        </View>
      </ScrollView>
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 10,
  },
  infoBannerText: {
    fontSize: 12,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  docTypeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  docTypeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  docTypeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  docTypeTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  docTypeTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  docTypeDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  requiredBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadedDoc: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  uploadedDocInfo: {
    flex: 1,
  },
  uploadedDocName: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  uploadedDocMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  uploadedDocRef: {
    fontSize: 11,
  },
  rejectionReason: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
  },
  expiryText: {
    fontSize: 11,
    marginTop: 2,
  },
  uploadedDocActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingVertical: 14,
    gap: 8,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  helpSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 22,
  },
  helpNote: {
    fontSize: 12,
    marginTop: 12,
    fontStyle: "italic",
  },
});
