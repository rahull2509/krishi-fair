import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import KycStepper from "@/components/common/KycStepper";
import { userService } from "@/lib/api/services";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { ShieldCheck, Upload } from "lucide-react";
import { useT } from "@/lib/i18n";

export default function KycPage() {
  const t = useT();
  const navigate = useNavigate();
  const { user, updateUserLocal } = useAuthStore();
  const [form, setForm] = useState({
    aadharNumber: user?.kyc?.aadharNumber || user?.aadharNumber || "",
    gstNumber: user?.kyc?.gstNumber || user?.gstNumber || "",
    panNumber: user?.kyc?.panNumber || user?.panNumber || "",
    kycDocumentId: user?.kyc?.kycDocumentId || user?.kycDocumentId || "",
  });
  const [imgPreview, setImgPreview] = useState(form.kycDocumentId || null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      toast.error("Document image must be under 4MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImgPreview(reader.result);
    reader.readAsDataURL(f);

    setUploadingDoc(true);
    try {
      const uploaded = await uploadToCloudinary(f, "krishi-mitra/kyc");
      setForm((p) => ({ ...p, kycDocumentId: uploaded.url }));
      toast.success("Document uploaded");
    } catch (error) {
      setImgPreview(null);
      setForm((p) => ({ ...p, kycDocumentId: "" }));
      toast.error(error?.message || "Document upload failed");
    } finally {
      setUploadingDoc(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (!form.kycDocumentId) {
        throw new Error("Upload your KYC document image first");
      }
      const res = await userService.submitKyc(form);
      updateUserLocal({ ...res.data });
      toast.success("Submitted! Verification pending review.");
      navigate("/dashboard/buyer");
    } catch (e) {
      toast.error(e?.message || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-10" data-testid="kyc-page">
      <p className="label-eyebrow text-primary">◇ Verification</p>
      <h1 className="mt-2 font-display text-3xl lg:text-4xl">{t("kyc.title")}</h1>
      <p className="mt-2 text-muted-foreground max-w-xl">{t("kyc.intro")}</p>

      <div className="mt-8 bg-card border border-border rounded-2xl p-6">
        <KycStepper status={user?.kycStatus || "NOT_SUBMITTED"} />
      </div>

      <form onSubmit={submit} className="mt-8 bg-card border border-border rounded-2xl p-6 space-y-5" data-testid="kyc-form">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="aadhar">{t("kyc.aadhar")}</Label>
            <Input id="aadhar" required pattern="[0-9 \-]{12,18}" value={form.aadharNumber} onChange={set("aadharNumber")} className="mt-1.5 h-11" data-testid="kyc-aadhar" placeholder="1234-5678-9012" />
          </div>
          <div>
            <Label htmlFor="pan">{t("kyc.pan")}</Label>
            <Input id="pan" required value={form.panNumber} onChange={set("panNumber")} className="mt-1.5 h-11 uppercase" data-testid="kyc-pan" placeholder="ABCDE1234F" />
          </div>
        </div>
        <div>
          <Label htmlFor="gst">{t("kyc.gst")}</Label>
          <Input id="gst" required value={form.gstNumber} onChange={set("gstNumber")} className="mt-1.5 h-11" data-testid="kyc-gst" placeholder="22AAAAA0000A1Z5" />
        </div>

        <div>
          <Label>{t("kyc.doc")}</Label>
          <label className="mt-1.5 flex items-center gap-3 border border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-primary/50">
            <span className="grid place-items-center w-10 h-10 rounded-md bg-muted">
              <Upload className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium">Upload Aadhar/PAN scan</p>
              <p className="text-xs text-muted-foreground">PNG/JPG/WebP up to 4 MB</p>
            </div>
            <input type="file" accept="image/*" hidden onChange={handleFile} data-testid="kyc-file" />
          </label>
          {imgPreview && (
            <div className="mt-3 flex items-center gap-3">
              <img src={imgPreview} alt="kyc" className="w-20 h-20 object-cover rounded-md border border-border" />
              <span className="text-xs text-muted-foreground">
                {uploadingDoc ? "Uploading document..." : "Document uploaded"}
              </span>
            </div>
          )}
        </div>

        <Button type="submit" disabled={submitting || uploadingDoc} className="w-full h-11" data-testid="kyc-submit">
          <ShieldCheck className="w-4 h-4 mr-1.5" /> {t("kyc.submit")}
        </Button>
      </form>
    </div>
  );
}
