"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import Cookies from "js-cookie";
import { RefreshCw } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Description } from "@radix-ui/react-dialog";
import { author_service } from "@/context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { blogCategories } from "@/context/AppContext";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

// export const blogCategories = [
//   "Technology",
//   "Health",
//   "Finance",
//   "Travel",
//   "Education",
//   "Entertainment",
//   "Study",
// ];

const AddBlog = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
    blogcontent: "",
  });

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const formdataToSend = new FormData();

    formdataToSend.append("title", formData.title);
    formdataToSend.append("description", formData.description);
    formdataToSend.append("blogcontent", formData.blogcontent);
    // formdataToSend.append("blogcontent", formData.blogcontent);
    formdataToSend.append("category", formData.category);

    if (formData.image) {
      formdataToSend.append("file", formData.image);
    }

    try {
      const token = Cookies.get("token");
      const { data } = await axios.post(
        `${author_service}/api/v1/blog/new`,
        formdataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // toast.success(data.message); //incase error uncomment this and comment below
      toast.success((data as { message: string }).message);
      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
        blogcontent: "",
      });
      setContent("");
    } catch (error) {
      toast.error("Error while adding blog");
    } finally {
      setLoading(false);
    }
  };

  const [aiTitle, setAiTitle] = useState(false);

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true);
      const { data } = await axios.post<string>(`${author_service}/api/v1/ai/title`, {
        text: formData.title,
      });
      setFormData({ ...formData, title: data });
    } catch (error: any) {
      toast.error("Problem while fetching from AI");
      // console.log("FULL ERROR:", error);
      // console.log("BACKEND ERROR:", error?.response?.data);
      // toast.error("Problem while fetching from AI");
    } finally {
      setAiTitle(false);
    }
  };

  const [aiDescription, setAiDescription] = useState(false);

  const aiDescriptionResponse = async () => {
    try {
      setAiDescription(true);
      const { data } = await axios.post<string>(
        `${author_service}/api/v1/ai/description`,
        {
          title: formData.title,
          description: formData.description,
        },
      );
      setFormData({ ...formData, description: data });
    } catch (error: any) {
      toast.error("Problem while fetching from AI");
      // console.log("FULL ERROR:", error);
      // console.log("BACKEND ERROR:", error?.response?.data);
      // toast.error("Problem while fetching from AI");
    } finally {
      setAiDescription(false);
    }
  };

  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  const aiBlogResponse = async () => {
    try {
      setAiBlogLoading(true);
      const { data } = await axios.post<{ html: string }>(`${author_service}/api/v1/ai/blog`, {
        blog: formData.blogcontent,
      });
      setContent(data.html);
      setFormData({ ...formData, blogcontent: data.html });
    } catch (error: any) {
      toast.error("Problem while fetching from AI");
      // console.log("FULL ERROR:", error);
      // console.log("BACKEND ERROR:", error?.response?.data);
      // toast.error("Problem while fetching from AI");
    } finally {
      setAiBlogLoading(false);
    }
  };

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    [],
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Add New Blog</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Title</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter Blog Title"
                className={
                  aiTitle ? "animate-pulse placeholder:opacity-60" : ""
                }
                required
              />
              {formData.title === "" ? (
                ""
              ) : (
                <Button
                  type="button"
                  onClick={aiTitleResponse}
                  disabled={aiTitle}
                >
                  <RefreshCw className={aiTitle ? "animate-spin" : ""} />
                </Button>
              )}
            </div>

            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Blog Description"
                className={
                  aiDescription ? "animate-pulse placeholder:opacity-60" : ""
                }
                required
              />
              {formData.title === "" ? (
                ""
              ) : (
                <Button
                  onClick={aiDescriptionResponse}
                  type="button"
                  disabled={aiDescription}
                  // className={aiDescription ? "animate-spin" : ""}
                >
                  <RefreshCw className={aiDescription ? "animate-spin" : ""} />
                </Button>
              )}
            </div>

            <Label>Category</Label>
            <Select
              onValueChange={(value: any) => {
                setFormData({ ...formData, category: value });
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={formData.category || "Select Category"}
                />
              </SelectTrigger>
              <SelectContent>
                {blogCategories?.map((e, i) => (
                  <SelectItem key={i} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <Label>Image Upload</Label>
              <Input
                key={formData.image ? "has-file" : "no-file"}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div>
              <Label>Blog Content</Label>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
                  Paste you blog or type here, You can use rich text formatting.
                  <br />
                  Please add image after improving your grammer
                </p>
                <Button
                  type="button"
                  size={"sm"}
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading}
                >
                  <RefreshCw
                    size={16}
                    className={aiBlogLoading ? "animate-spin" : ""}
                  />
                  <span className="ml-2">Fix Grammer</span>
                </Button>
              </div>
              <JoditEditor
                ref={editor}
                value={content}
                config={config}
                tabIndex={1}
                onBlur={(newContent) => {
                  setContent(newContent);
                  setFormData((prev) => ({
                    ...prev,
                    blogcontent: newContent,
                  }));
                }}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBlog;
