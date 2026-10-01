// ../@emulators/clerk/dist/chunk-XOGS3H5N.js
import { randomUUID } from "crypto";
function generateClerkId(prefix) {
  const compact = randomUUID().replace(/-/g, "");
  return `${prefix}${compact.slice(0, 24)}`;
}
function nowUnix() {
  return Math.floor(Date.now() / 1e3);
}
function createDefaultUser() {
  const now = nowUnix();
  return {
    clerk_id: generateClerkId("user_"),
    username: null,
    first_name: "Test",
    last_name: "User",
    image_url: null,
    profile_image_url: null,
    external_id: null,
    primary_email_address_id: null,
    primary_phone_number_id: null,
    password_enabled: true,
    password_hash: "test_password",
    totp_enabled: false,
    backup_code_enabled: false,
    two_factor_enabled: false,
    banned: false,
    locked: false,
    public_metadata: {},
    private_metadata: {},
    unsafe_metadata: {},
    last_active_at: null,
    last_sign_in_at: null,
    created_at_unix: now,
    updated_at_unix: now
  };
}
function createDefaultEmailAddress(userId, email, primary) {
  const now = nowUnix();
  return {
    email_id: generateClerkId("idn_"),
    email_address: email,
    user_id: userId,
    verification_status: "verified",
    verification_strategy: "email_code",
    is_primary: primary,
    reserved: false,
    created_at_unix: now,
    updated_at_unix: now
  };
}
function createDefaultOrganization() {
  const now = nowUnix();
  return {
    clerk_id: generateClerkId("org_"),
    name: "My Company",
    slug: "my-company",
    image_url: null,
    has_logo: false,
    members_count: 0,
    pending_invitations_count: 0,
    public_metadata: {},
    private_metadata: {},
    max_allowed_memberships: null,
    admin_delete_enabled: true,
    created_at_unix: now,
    updated_at_unix: now
  };
}
function userDisplayName(user) {
  const combined = [user.first_name, user.last_name].filter(Boolean).join(" ");
  return combined || user.username || "User";
}

export {
  generateClerkId,
  nowUnix,
  createDefaultUser,
  createDefaultEmailAddress,
  createDefaultOrganization,
  userDisplayName
};
//# sourceMappingURL=chunk-WVQMFHQM.js.map