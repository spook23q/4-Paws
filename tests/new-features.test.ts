import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

const projectRoot = path.resolve(__dirname, "..");

describe("Profile Photo Upload Feature", () => {
  it("should have expo-image-picker installed", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf-8"));
    expect(pkg.dependencies["expo-image-picker"]).toBeDefined();
  });

  it("should have upload router with uploadProfilePhoto endpoint", () => {
    const uploadRouter = fs.readFileSync(
      path.join(projectRoot, "server/routers/uploadRouter.ts"),
      "utf-8"
    );
    expect(uploadRouter).toContain("uploadProfilePhoto");
    expect(uploadRouter).toContain("protectedProcedure");
    expect(uploadRouter).toContain("base64");
    expect(uploadRouter).toContain("storagePut");
  });

  it("should have upload router registered in main routers", () => {
    const routers = fs.readFileSync(path.join(projectRoot, "server/routers.ts"), "utf-8");
    expect(routers).toContain("uploadRouter");
    expect(routers).toContain("upload: uploadRouter");
  });

  it("should have camera icon mapping", () => {
    const iconSymbol = fs.readFileSync(
      path.join(projectRoot, "components/ui/icon-symbol.tsx"),
      "utf-8"
    );
    expect(iconSymbol).toContain('"camera.fill"');
    expect(iconSymbol).toContain('"photo-camera"');
  });

  it("should have profile photo upload UI in profile screen", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    // Check for ImagePicker import
    expect(profile).toContain("expo-image-picker");
    // Check for camera badge overlay
    expect(profile).toContain("cameraBadge");
    // Check for photo pick handler
    expect(profile).toContain("handlePickPhoto");
    // Check for upload mutation
    expect(profile).toContain("upload.uploadProfilePhoto");
    // Check for avatar image display
    expect(profile).toContain("avatarImage");
    expect(profile).toContain("user.profilePhoto");
  });

  it("should have camera and gallery options", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    expect(profile).toContain("pickFromCamera");
    expect(profile).toContain("pickFromGallery");
    expect(profile).toContain("Photo Library");
    expect(profile).toContain("Camera");
  });

  it("should update user state after photo upload", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    expect(profile).toContain("updateUser");
    expect(profile).toContain("profilePhoto: result.url");
  });
});

describe("Favourites Feature", () => {
  it("should have favourites table in schema", () => {
    const schema = fs.readFileSync(path.join(projectRoot, "drizzle/schema.ts"), "utf-8");
    expect(schema).toContain("favourites");
    expect(schema).toContain("user_id");
    expect(schema).toContain("sitter_id");
    expect(schema).toContain("fav_user_idx");
    expect(schema).toContain("fav_unique_idx");
  });

  it("should have favourites relations defined", () => {
    const schema = fs.readFileSync(path.join(projectRoot, "drizzle/schema.ts"), "utf-8");
    expect(schema).toContain("favouritesRelations");
    expect(schema).toContain("userFavourites");
    expect(schema).toContain("sitterFavouritedBy");
  });

  it("should have favourites router with list, add, remove, isFavourited endpoints", () => {
    const favRouter = fs.readFileSync(
      path.join(projectRoot, "server/routers/favouritesRouter.ts"),
      "utf-8"
    );
    expect(favRouter).toContain("list:");
    expect(favRouter).toContain("add:");
    expect(favRouter).toContain("remove:");
    expect(favRouter).toContain("isFavourited:");
    expect(favRouter).toContain("protectedProcedure");
  });

  it("should have favourites router registered in main routers", () => {
    const routers = fs.readFileSync(path.join(projectRoot, "server/routers.ts"), "utf-8");
    expect(routers).toContain("favouritesRouter");
    expect(routers).toContain("favourites: favouritesRouter");
  });

  it("should have favourites section in profile screen for owners", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    expect(profile).toContain("renderFavourites");
    expect(profile).toContain("Favourite Sitters");
    expect(profile).toContain("favourites.list");
    expect(profile).toContain("favourites.remove");
    expect(profile).toContain("Browse Sitters");
  });

  it("should show favourites pill only for owners", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    // Favourites section is conditionally added based on role
    expect(profile).toContain('user.role === "owner"');
    expect(profile).toContain('key: "favourites"');
    expect(profile).toContain('label: "Favourites"');
  });

  it("should display favourite sitter cards with name, suburb, rating, price", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    expect(profile).toContain("sitterName");
    expect(profile).toContain("sitterSuburb");
    expect(profile).toContain("sitterRating");
    expect(profile).toContain("sitterPricePerDay");
  });

  it("should have favourite toggle button on sitter detail screen", () => {
    const sitterDetail = fs.readFileSync(
      path.join(projectRoot, "app/sitters/[id].tsx"),
      "utf-8"
    );
    expect(sitterDetail).toContain("handleToggleFavourite");
    expect(sitterDetail).toContain("favourites.isFavourited");
    expect(sitterDetail).toContain("favourites.add");
    expect(sitterDetail).toContain("favourites.remove");
    expect(sitterDetail).toContain("heart.fill");
    expect(sitterDetail).toContain("favButton");
  });

  it("should navigate to sitter detail when tapping a favourite card", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    expect(profile).toContain("router.push(`/sitters/${fav.sitterId}`");
  });

  it("should show empty state with Browse Sitters button when no favourites", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    expect(profile).toContain("No favourites yet");
    expect(profile).toContain("Browse Sitters");
    expect(profile).toContain('router.push("/(tabs)/search"');
  });
});

describe("Device Testing Readiness", () => {
  it("should have Platform-guarded haptics", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    expect(profile).toContain('Platform.OS !== "web"');
    expect(profile).toContain("Haptics.impactAsync");
  });

  it("should have Platform-guarded haptics on sitter detail", () => {
    const sitterDetail = fs.readFileSync(
      path.join(projectRoot, "app/sitters/[id].tsx"),
      "utf-8"
    );
    expect(sitterDetail).toContain('Platform.OS !== "web"');
    expect(sitterDetail).toContain("Haptics.impactAsync");
  });

  it("should have proper image picker permissions handling", () => {
    const profile = fs.readFileSync(
      path.join(projectRoot, "app/(tabs)/profile.tsx"),
      "utf-8"
    );
    expect(profile).toContain("requestCameraPermissionsAsync");
    expect(profile).toContain("requestMediaLibraryPermissionsAsync");
    expect(profile).toContain("Permission Required");
  });
});
