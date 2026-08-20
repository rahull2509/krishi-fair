import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/lib/api/services";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserLocal } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Profile image must be under 4MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const uploaded = await uploadToCloudinary(file, "krishi-mitra/profiles");
      setAvatarPreview(uploaded.url);
      const updatedForm = { ...form, avatar: uploaded.url };
      setForm(updatedForm);
      
      // Auto-save the profile picture so it persists on refresh
      const r = await userService.updateProfile(updatedForm);
      updateUserLocal(r.data);
      
      toast.success("Profile image uploaded and saved");
    } catch (error) {
      setAvatarPreview(form.avatar || user?.avatar || "");
      toast.error(error?.message || "Profile image upload failed");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await userService.updateProfile(form);
      updateUserLocal(r.data);
      toast.success("Profile updated");
    } catch (e) { toast.error(e?.message || "Failed"); }
    setBusy(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10" data-testid="profile-page">
      <p className="label-eyebrow text-primary">◇ Profile</p>
      <h1 className="mt-2 font-display text-3xl lg:text-4xl">Account & profile</h1>

      <div className="mt-8 bg-card border border-border rounded-2xl p-6 flex items-center gap-5">
        <Avatar className="w-16 h-16">
          <AvatarImage src={avatarPreview} alt={user?.name || "Profile"} className="object-cover" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
            {(user?.name || "?")[0]}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-display text-2xl">{user?.name}</h3>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{user?.role}</Badge>
            {user?.role === "BUYER" && (
              <Badge variant={user?.kycStatus === "VERIFIED" ? "default" : "outline"} className={user?.kycStatus === "VERIFIED" ? "bg-secondary text-secondary-foreground" : ""}>
                KYC: {user?.kycStatus}
              </Badge>
            )}
          </div>
        </div>
        <label className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm cursor-pointer hover:bg-muted">
          <Camera className="w-4 h-4" />
          {uploadingAvatar ? "Uploading..." : "Change photo"}
          <input type="file" accept="image/*" hidden onChange={handleAvatar} data-testid="profile-avatar" />
        </label>
      </div>

      <form onSubmit={save} className="mt-6 bg-card border border-border rounded-2xl p-6 space-y-4" data-testid="profile-form">
        <div>
          <Label htmlFor="p-name">Full name</Label>
          <Input id="p-name" value={form.name} onChange={set("name")} className="mt-1.5 h-11" data-testid="profile-name" />
        </div>
        <div>
          <Label htmlFor="p-phone">Phone</Label>
          <Input id="p-phone" value={form.phone} onChange={set("phone")} className="mt-1.5 h-11" data-testid="profile-phone" />
        </div>
        <Button type="submit" disabled={busy || uploadingAvatar} data-testid="profile-save">
          <Save className="w-4 h-4 mr-1.5" />Save changes
        </Button>
      </form>
    </div>
  );
}
