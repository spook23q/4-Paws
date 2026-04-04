import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("Profile Screen Redesign", () => {
  const profilePath = path.join(__dirname, "../app/(tabs)/profile.tsx");
  const layoutPath = path.join(__dirname, "../app/(tabs)/_layout.tsx");
  const iconSymbolPath = path.join(__dirname, "../components/ui/icon-symbol.tsx");

  it("profile.tsx file exists", () => {
    expect(fs.existsSync(profilePath)).toBe(true);
  });

  it("profile screen has section navigation with all required sections", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain('"about"');
    expect(content).toContain('"pets"');
    expect(content).toContain('"address"');
    expect(content).toContain('"account"');
    expect(content).toContain('"info"');
    expect(content).toContain('"About Me"');
    expect(content).toContain('"My Pets"');
    expect(content).toContain('"My Address"');
    expect(content).toContain('"Account"');
    expect(content).toContain('"App Info"');
  });

  it("profile screen has editable user info fields", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("Full Name");
    expect(content).toContain("Email");
    expect(content).toContain("Phone");
    expect(content).toContain("isEditing");
    expect(content).toContain("handleSaveProfile");
  });

  it("profile screen has theme/appearance settings", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("Appearance");
    expect(content).toContain("handleThemeModeChange");
    expect(content).toContain('"light"');
    expect(content).toContain('"dark"');
    expect(content).toContain('"system"');
  });

  it("profile screen has account deletion functionality", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("Delete Account");
    expect(content).toContain("handleDeleteAccount");
    expect(content).toContain("showDeleteModal");
    expect(content).toContain("deletePassword");
    expect(content).toContain("deleteConfirmText");
  });

  it("profile screen has logout functionality", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("handleLogout");
    expect(content).toContain("Logout");
    expect(content).toContain("signOut");
  });

  it("profile screen links to My Cats and Sitter Profile", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("/profile/my-cats");
    expect(content).toContain("/profile/sitter-profile");
  });

  it("profile screen links to address management", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("/(tabs)/settings/address");
    expect(content).toContain("Manage Address");
  });

  it("profile screen has app info links", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("/(tabs)/about");
    expect(content).toContain("/(tabs)/faq");
    expect(content).toContain("/(tabs)/safety");
    expect(content).toContain("/(tabs)/support");
    expect(content).toContain("/(tabs)/privacy");
    expect(content).toContain("/(tabs)/terms");
  });

  it("profile screen has sign-in state for unauthenticated users", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("Sign in to view your profile");
    expect(content).toContain("/auth/sign-in");
  });

  it("tab layout shows Profile tab in tab bar", () => {
    const content = fs.readFileSync(layoutPath, "utf-8");
    // Profile should be a visible tab (not href: null)
    const profileTabMatch = content.match(/name="profile"[\s\S]*?options=\{[\s\S]*?\}/);
    expect(profileTabMatch).not.toBeNull();
    // Ensure profile tab has a title and icon
    expect(content).toContain('title: "Profile"');
    expect(content).toContain('name="person.fill"');
  });

  it("tab layout hides settings/address from tab bar", () => {
    const content = fs.readFileSync(layoutPath, "utf-8");
    expect(content).toContain('name="settings/address"');
    expect(content).toContain("href: null");
  });

  it("tab layout has exactly 5 visible tabs", () => {
    const content = fs.readFileSync(layoutPath, "utf-8");
    // Count tabs that have tabBarIcon (visible tabs)
    const visibleTabs = content.match(/tabBarIcon:/g);
    expect(visibleTabs).not.toBeNull();
    expect(visibleTabs!.length).toBe(5);
  });

  it("icon-symbol has person.fill mapping for profile tab", () => {
    const content = fs.readFileSync(iconSymbolPath, "utf-8");
    expect(content).toContain('"person.fill"');
    expect(content).toContain('"person"');
  });

  it("profile screen uses StyleSheet.create for styles", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("StyleSheet.create");
  });

  it("profile screen uses ScreenContainer for safe area handling", () => {
    const content = fs.readFileSync(profilePath, "utf-8");
    expect(content).toContain("<ScreenContainer>");
    expect(content).toContain("</ScreenContainer>");
  });
});
