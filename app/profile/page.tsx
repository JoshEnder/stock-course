import type { Metadata } from "next";
import { ProfileScreen } from "../screens/profile-screen";

export const metadata: Metadata = {
  title: "Profile | Stock Academy",
  description: "Manage your nickname, Google sign-in, and account settings.",
};

export default function ProfilePage() {
  return <ProfileScreen />;
}
