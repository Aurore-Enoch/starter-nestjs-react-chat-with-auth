import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

const LogoutButton: React.FC = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/signin");
  };

  if (!user) return null;

  return (
    <Button onClick={handleLogout} variant="ghost" className="cursor-pointer">
      <LogOut />
    </Button>
  );
};

export default LogoutButton;
