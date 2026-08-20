import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cropService } from "@/lib/api/services";
import { uploadManyToCloudinary } from "@/lib/cloudinary";
import { toast } from "sonner";
import { ImagePlus, X, Wheat, Upload } from "lucide-react";

const CATEGORIES = ["Grain", "Pulse", "Vegetable", "Fruit", "Oilseed", "Spice"];
const STATES = ["Punjab","Haryana","Maharashtra","Uttar Pradesh","Karnataka","Tamil Nadu","Gujarat","Rajasthan","Madhya Pradesh","Bihar","West Bengal","Andhra Pradesh"];
const STOCK_IMAGES = [
  "https://images.pexels.com/photos/20445181/pexels-photo-20445181.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1598042247465-8eaa55cb9b62?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1200&q=80",
];

export default function CreateCropPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Grain",
    variety: "",
    quantity: 100,
    unit: "quintal",
    basePrice: 2500,
    minBidPrice: 2200,
    allowBidding: true,
    location: "",
    state: "Punjab",
    district: "",
  });
  const [images, setImages] = useState([STOCK_IMAGES[0]]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be under 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setUploadPreviews((prev) => [...prev, reader.result]);
        setUploadedFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeUploadedImage = (index) => {
    setUploadPreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const uploadedImages = uploadedFiles.length
        ? await uploadManyToCloudinary(uploadedFiles, "krishi-mitra/crops")
        : [];
      const imageUrls = [...uploadedImages.map((img) => img.url), ...images];

      const payload = {
        ...form,
        quantity: Number(form.quantity),
        basePrice: Number(form.basePrice),
        minBidPrice: Number(form.minBidPrice),
        images: imageUrls,
        imageIds: imageUrls,
      };
      await cropService.create(payload);
      toast.success("Listing created successfully!");
      navigate("/dashboard/farmer");
    } catch (e) {
      toast.error(e?.message || "Failed to create listing");
    }
    setSubmitting(false);
  };

  const toggleImage = (src) =>
    setImages((arr) => (arr.includes(src) ? arr.filter((x) => x !== src) : [...arr, src]));

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-10" data-testid="create-crop-page">
      <p className="label-eyebrow text-primary">◇ New listing</p>
      <h1 className="mt-2 font-display text-3xl lg:text-4xl">List a fresh harvest</h1>
      <p className="mt-2 text-muted-foreground">Fill the details. KYC-verified buyers will see this within seconds.</p>

      <form onSubmit={submit} className="mt-8 space-y-6 bg-card border border-border rounded-2xl p-6" data-testid="crop-form">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Organic Wheat — Premium HD-2967" className="mt-1.5 h-11" data-testid="crop-title" />
        </div>
        <div>
          <Label htmlFor="desc">Description</Label>
          <Textarea id="desc" rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Quality, harvest date, mandi pickup details…" className="mt-1.5" data-testid="crop-desc" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="mt-1.5 h-11" data-testid="crop-category"><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="variety">Variety</Label>
            <Input id="variety" value={form.variety} onChange={(e) => set("variety", e.target.value)} className="mt-1.5 h-11" data-testid="crop-variety" />
          </div>
          <div>
            <Label htmlFor="qty">Quantity ({form.unit})</Label>
            <Input id="qty" type="number" min={1} required value={form.quantity} onChange={(e) => set("quantity", e.target.value)} className="mt-1.5 h-11" data-testid="crop-qty" />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bp">Base price ₹/{form.unit}</Label>
            <Input id="bp" type="number" min={1} required value={form.basePrice} onChange={(e) => set("basePrice", e.target.value)} className="mt-1.5 h-11" data-testid="crop-base" />
          </div>
          <div>
            <Label htmlFor="mp">Min bid price ₹/{form.unit}</Label>
            <Input id="mp" type="number" min={1} value={form.minBidPrice} onChange={(e) => set("minBidPrice", e.target.value)} className="mt-1.5 h-11" data-testid="crop-min" />
          </div>
          <div className="flex items-end">
            <div className="flex items-center justify-between w-full rounded-lg bg-muted px-4 h-11">
              <Label htmlFor="bid-on" className="cursor-pointer">Allow bidding</Label>
              <Switch id="bid-on" checked={form.allowBidding} onCheckedChange={(v) => set("allowBidding", v)} data-testid="crop-bidding" />
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>State</Label>
            <Select value={form.state} onValueChange={(v) => set("state", v)}>
              <SelectTrigger className="mt-1.5 h-11" data-testid="crop-state"><SelectValue /></SelectTrigger>
              <SelectContent>{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dist">District</Label>
            <Input id="dist" value={form.district} onChange={(e) => set("district", e.target.value)} className="mt-1.5 h-11" data-testid="crop-district" />
          </div>
          <div>
            <Label htmlFor="loc">Mandi / location</Label>
            <Input id="loc" value={form.location} onChange={(e) => set("location", e.target.value)} className="mt-1.5 h-11" data-testid="crop-location" />
          </div>
        </div>

        {/* Upload your own images */}
        <div>
          <Label>Upload crop images</Label>
          <div className="mt-2 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/40 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleFileUpload}
              data-testid="crop-file-upload"
            />
            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Click to upload images (JPEG, PNG, WebP — max 10MB each)</p>
            <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
          </div>

          {uploadPreviews.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {uploadPreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt={`Upload ${i + 1}`} className="w-20 h-20 rounded-md object-cover border-2 border-primary" />
                  <button
                    type="button"
                    onClick={() => removeUploadedImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white grid place-items-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock images */}
        <div>
          <Label>Or pick from stock images <span className="text-muted-foreground font-normal text-xs">(click to select)</span></Label>
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {STOCK_IMAGES.map((src, i) => {
              const selected = images.includes(src);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleImage(src)}
                  className={`relative aspect-square rounded-md overflow-hidden border-2 transition ${selected ? "border-primary" : "border-transparent hover:border-border"}`}
                  data-testid={`stock-img-${i}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  {selected && (
                    <span className="absolute top-1 right-1 grid place-items-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={submitting} data-testid="crop-submit">
            <Wheat className="w-4 h-4 mr-1.5" />{submitting ? "Uploading..." : "Create listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
