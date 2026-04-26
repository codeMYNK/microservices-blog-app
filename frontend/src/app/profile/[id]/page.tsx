"use client";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppData, user_service, User } from "@/context/AppContext"; // ✅ Imported User
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";
import Loading from "@/components/loading";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation"; // ✅ Imported useParams

// Define the expected response shape for updating profile
interface UpdateResponse {
  message: string;
  token: string;
  user: User;
}

const ProfilePage = () => {
  const { user, setUser, logoutUser } = useAppData();
  const { id } = useParams(); // ✅ Extract the dynamic ID from the URL
  const router = useRouter();
  
  // ✅ State to hold the data of the user profile we are currently viewing
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start as true since we fetch immediately
  const [open, setOpen] = useState(false);
  const InputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    bio: "",
  });

  // ✅ Fetch the specific profile user based on the URL ID
  useEffect(() => {
    const fetchProfileUser = async () => {
      try {
        const { data } = await axios.get<User>(`${user_service}/api/v1/user/${id}`);
        setProfileUser(data);
        
        // If it's our own profile, pre-fill the edit form
        if (user?._id === data._id) {
          setFormData({
            name: data.name || "",
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            linkedin: data.linkedin || "",
            bio: data.bio || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load profile");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfileUser();
  }, [id, user]);

  // ✅ Check if the viewer is the owner of this profile
  const isMyProfile = user?._id === profileUser?._id;

  const logoutHandler = () => {
    logoutUser();
    router.push("/login");
  };

  const clickHandler = () => {
    if (isMyProfile) {
      InputRef.current?.click();
    }
  };

  // ✅ Kept the proper React type instead of 'any'
  const changeHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    const fileFormData = new FormData();
    fileFormData.append("file", file);

    try {
      setLoading(true);
      const token = Cookies.get("token");

      // ✅ Added the generic response type
      const { data } = await axios.post<UpdateResponse>(
        `${user_service}/api/v1/user/update/pic`,
        fileFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });
      setUser(data.user);
      setProfileUser(data.user); // Update local view as well
    } catch (error) {
      toast.error("Image Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      
      // ✅ Added the generic response type
      const { data } = await axios.post<UpdateResponse>(
        `${user_service}/api/v1/user/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      Cookies.set("token", data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });
      setUser(data.user);
      setProfileUser(data.user); // Update local view as well
      setOpen(false);
    } catch (error) {
      toast.error("Update Failed");
    } finally {
      setLoading(false);
    }
  };

  const normalizeUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen p-4"><Loading /></div>;
  if (!profileUser) return <div className="text-center mt-20">User not found.</div>;

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <Card className="w-full max-w-xl shadow-lg border rounded-2xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Profile</CardTitle>

          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar
              className={`w-28 h-28 border-4 border-gray-200 shadow-md ${isMyProfile ? "cursor-pointer" : ""}`}
              onClick={clickHandler}
            >
              <AvatarImage src={profileUser.image} alt="profile pic" />
              {isMyProfile && (
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={InputRef}
                  onChange={changeHandler}
                />
              )}
            </Avatar>

            <div className="w-full space-y-2 text-center">
              <label className="font-medium">Name</label>
              <p>{profileUser.name}</p>
            </div>

            {profileUser.bio && (
              <div className="w-full space-y-2 text-center">
                <label className="font-medium">Bio</label>
                <p>{profileUser.bio}</p>
              </div>
            )}

            <div className="flex gap-4 mt-3">
              {profileUser.instagram && (
                <a
                  href={normalizeUrl(profileUser.instagram)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="text-pink-500 text-2xl" />
                </a>
              )}

              {profileUser.facebook && (
                <a
                  href={normalizeUrl(profileUser.facebook)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="text-blue-500 text-2xl" />
                </a>
              )}

              {profileUser.linkedin && (
                <a
                  href={normalizeUrl(profileUser.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Linkedin className="text-blue-700 text-2xl" />
                </a>
              )}
            </div>

            {/* ✅ Only show Edit/Logout options if the logged-in user owns this profile */}
            {isMyProfile && (
              <div className="flex flex-col sm:flex-row gap-2 mt-6 w-full justify-center">
                <Button onClick={logoutHandler}>Logout</Button>
                <Button onClick={() => router.push("/blog/new")}>
                  Add Blog
                </Button>

                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button variant={"outline"}>Edit</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Bio</Label>
                        <Input
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Instagram</Label>
                        <Input
                          value={formData.instagram}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instagram: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Facebook</Label>
                        <Input
                          value={formData.facebook}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              facebook: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label>Linkedin</Label>
                        <Input
                          value={formData.linkedin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              linkedin: e.target.value,
                            })
                          }
                        />
                      </div>

                      <Button
                        onClick={handleFormSubmit}
                        className="w-full mt-4"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
};

export default ProfilePage;