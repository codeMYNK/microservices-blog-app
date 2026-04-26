"use client";
import React from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppData, user_service, User } from "@/context/AppContext"; // ✅ Imported User
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { redirect } from "next/navigation";
import Loading from "@/components/loading";

const LoginPage = () => {
  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData();

  if (isAuth) return redirect("/blogs");

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      // ✅ Added <{ token: string; message: string; user: User }> generic
      const result = await axios.post<{ token: string; message: string; user: User }>(
        `${user_service}/api/v1/login`,
        {
          code: authResult["code"],
        }
      );

      Cookies.set("token", result.data.token, {
        expires: 5, // 5 days
        secure: true,
        path: "/",
      });
      toast.success(result.data.message);
      setIsAuth(true);
      setLoading(false);
      setUser(result.data.user);
    } catch (error) {
      console.log("Error:", error);
      toast.error("Problem While Login");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="w-[350px] m-auto mt-[200px]">
          <Card className="w-[350px]">
            <CardHeader>
              <CardTitle>Login to The Reading Retreat</CardTitle>
              <CardDescription>Your Blog App!</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Wrapped googleLogin in an arrow function to be safe with TS event handlers */}
              <Button onClick={() => googleLogin()}>
                Login With Google{" "}
                <img
                  src={"/google.png"}
                  className="w-6 h-6"
                  alt="google-icon"
                />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LoginPage;