import type { Metadata } from "next";
import { UsernameSetupScreen } from "../screens/username-setup-screen";

export const metadata: Metadata = {
  title: "Choose a username | Stock Academy",
  description: "Set your unique Stoked username to unlock friends and saved identity.",
};

export default function UsernamePage() {
  return <UsernameSetupScreen />;
}
