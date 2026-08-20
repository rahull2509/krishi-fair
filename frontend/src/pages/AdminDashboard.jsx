import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { adminService, userService, cropService, bidService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Users, Gavel, Wheat, ShieldCheck, Package, Settings as SettingsIcon,
  Save, Eye, IndianRupee, TrendingUp, Calendar, MapPin, Search, RefreshCw,
} from "lucide-react";
import { useT } from "@/lib/i18n";

const Stat = ({ icon: Icon, label, value, tone = "primary" }) => (
  <div className="bg-card border border-border rounded-2xl p-5 lift">
    <div className={`w-10 h-10 rounded-lg grid place-items-center ${
      tone === "primary" ? "bg-primary/10 text-primary" :
      tone === "secondary" ? "bg-secondary/10 text-secondary" :
      tone === "amber" ? "bg-amber-100 text-amber-700" :
      "bg-emerald-100 text-emerald-700"
    }`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="mt-4 label-eyebrow">{label}</p>
    <p className="font-display stat-num text-3xl mt-1">{value}</p>
  </div>
);

export default function AdminDashboard() {
  const t = useT();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [allBids, setAllBids] = useState([]);
  const [filterRole, setFilterRole] = useState("BUYER");
  const [userSearch, setUserSearch] = useState("");
  const [duration, setDuration] = useState(48);
  const [loading, setLoading] = useState(true);
  const [savingDur, setSavingDur] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u, set, c] = await Promise.all([
        adminService.stats().catch(() => ({ data: {} })),
        userService.listUsers({ role: filterRole }).catch(() => ({ data: { items: [] } })),
        adminService.getSettings().catch(() => ({ data: { defaultBiddingDurationHours: 48 } })),
        cropService.list({ page: 1, limit: 100 }).catch(() => ({ data: { items: [] } })),
      ]);
      setStats(s.data);
      setUsers(u.data?.items || u.data || []);
      setDuration(set.data?.defaultBiddingDurationHours || 48);
      const cropItems = c.data?.items || c.data || [];
      setCrops(cropItems);

      // Fetch bids for all crops
      const bidPromises = cropItems.slice(0, 20).map((crop) =>
        bidService.listForCrop(crop.id).catch(() => ({ data: [] }))
      );
      const bidResults = await Promise.all(bidPromises);
      const flatBids = bidResults.flatMap((r, i) =>
        (r.data || []).map((b) => ({ ...b, cropTitle: cropItems[i]?.title }))
      );
      setAllBids(flatBids);
    } finally {
      setLoading(false);
    }
  }, [filterRole]);

  useEffect(() => { load(); }, [load]);

  const setKyc = async (uid, status) => {
    try {
      await userService.setKycStatus(uid, status);
      toast.success(`Marked ${status}`);
      load();
    } catch (e) { toast.error(e?.message || "Failed"); }
  };

  const saveDuration = async () => {
    setSavingDur(true);
    try {
      await adminService.updateBiddingDuration(Number(duration));
      toast.success("Default bidding duration updated");
    } catch (e) { toast.error(e?.message || "Failed"); }
    setSavingDur(false);
  };

  const filteredUsers = userSearch
    ? users.filter((u) =>
        (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone || "").includes(userSearch)
      )
    : users;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10" data-testid="admin-dashboard">
      <div className="flex items-center justify-between">
        <div>
          <p className="label-eyebrow text-primary">◇ Marketplace operations</p>
          <h1 className="mt-2 font-display text-3xl lg:text-4xl">{t("dash.admin.title")}</h1>
        </div>
        <Button variant="outline" onClick={load} className="gap-2" data-testid="refresh-btn">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {loading || !stats ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <Stat icon={Users} label="Total users" value={stats.users || 0} />
            <Stat icon={Wheat} label="Open listings" value={stats.openCrops || 0} tone="emerald" />
            <Stat icon={Gavel} label="Total bids" value={stats.bids || 0} tone="amber" />
            <Stat icon={Package} label="Sold crops" value={stats.soldCrops || 0} tone="secondary" />
            <Stat icon={ShieldCheck} label="Pending KYC" value={stats.pendingKyc || 0} />
          </>
        )}
      </div>

      <Tabs defaultValue="users" className="mt-10">
        <TabsList>
          <TabsTrigger value="users" data-testid="tab-users">{t("dash.users")}</TabsTrigger>
          <TabsTrigger value="crops" data-testid="tab-crops">All Crops</TabsTrigger>
          <TabsTrigger value="bids" data-testid="tab-bids">All Bids</TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">{t("dash.settings")}</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="mt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              {["BUYER", "FARMER", "ADMIN"].map((r) => (
                <Button
                  key={r}
                  size="sm"
                  variant={filterRole === r ? "default" : "outline"}
                  onClick={() => setFilterRole(r)}
                  data-testid={`filter-role-${r}`}
                >
                  {r}
                </Button>
              ))}
            </div>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">KYC Status</th>
                  <th className="px-4 py-3">KYC Details</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} data-testid={`user-row-${u.id}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                      <div className="text-xs text-primary">{u.role}</div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{u.phone}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={u.kycStatus === "VERIFIED" ? "default" : u.kycStatus === "REJECTED" ? "destructive" : "outline"}
                        className={u.kycStatus === "VERIFIED" ? "bg-primary text-primary-foreground" : u.kycStatus === "PENDING" ? "bg-amber-100 text-amber-800 border-amber-300" : ""}
                      >
                        {u.kycStatus || "N/A"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {u.kyc ? (
                        <div className="text-xs space-y-0.5">
                          {u.kyc.aadharNumber && <div>Aadhar: <span className="font-mono">{u.kyc.aadharNumber}</span></div>}
                          {u.kyc.panNumber && <div>PAN: <span className="font-mono">{u.kyc.panNumber}</span></div>}
                          {u.kyc.gstNumber && <div>GST: <span className="font-mono">{u.kyc.gstNumber}</span></div>}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {u.kycStatus === "PENDING" && u.role !== "ADMIN" && (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setKyc(u.id, "VERIFIED")} className="text-primary hover:bg-primary/10" data-testid={`approve-${u.id}`}>Approve</Button>
                          <Button size="sm" variant="ghost" onClick={() => setKyc(u.id, "REJECTED")} className="text-destructive hover:bg-destructive/10" data-testid={`reject-${u.id}`}>Reject</Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Selected User Detail Panel */}
          {selectedUser && (
            <div className="mt-4 bg-card border border-primary/20 rounded-2xl p-6 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl">User Details — {selectedUser.name}</h3>
                <Button size="sm" variant="ghost" onClick={() => setSelectedUser(null)}>Close</Button>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{selectedUser.id}</span></div>
                  <div><span className="text-muted-foreground">Name:</span> {selectedUser.name}</div>
                  <div><span className="text-muted-foreground">Email:</span> {selectedUser.email}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedUser.phone}</div>
                </div>
                <div className="space-y-2">
                  <div><span className="text-muted-foreground">Role:</span> <Badge>{selectedUser.role}</Badge></div>
                  <div><span className="text-muted-foreground">KYC:</span> <Badge variant="outline">{selectedUser.kycStatus || "N/A"}</Badge></div>
                  {selectedUser.state && <div><span className="text-muted-foreground">State:</span> {selectedUser.state}</div>}
                  {selectedUser.district && <div><span className="text-muted-foreground">District:</span> {selectedUser.district}</div>}
                </div>
                {selectedUser.kyc && (
                  <div className="space-y-2 bg-muted/40 rounded-lg p-3">
                    <p className="label-eyebrow text-primary">KYC Documents</p>
                    {selectedUser.kyc.aadharNumber && <div>Aadhar: <span className="font-mono">{selectedUser.kyc.aadharNumber}</span></div>}
                    {selectedUser.kyc.panNumber && <div>PAN: <span className="font-mono">{selectedUser.kyc.panNumber}</span></div>}
                    {selectedUser.kyc.gstNumber && <div>GST: <span className="font-mono">{selectedUser.kyc.gstNumber}</span></div>}
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* CROPS TAB */}
        <TabsContent value="crops" className="mt-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Crop</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Bidding</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Bids</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {crops.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {c.images?.[0] && (
                          <img src={c.images[0]} alt="" className="w-10 h-10 rounded-md object-cover" />
                        )}
                        <div>
                          <div className="font-medium line-clamp-1 max-w-[180px]">{c.title}</div>
                          <div className="text-xs text-muted-foreground">{c.farmer?.name || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{c.category}</Badge></td>
                    <td className="px-4 py-3 tabular-nums font-medium">₹{(c.basePrice || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3 tabular-nums">{c.quantity} {c.unit || "q"}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.state || "—"}</div>
                      <div className="text-muted-foreground">{c.district || ""}</div>
                    </td>
                    <td className="px-4 py-3">
                      {c.allowBidding ? (
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">Open</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Direct</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={c.status === "SOLD" ? "destructive" : "default"}
                        className={c.status !== "SOLD" ? "bg-primary text-primary-foreground" : ""}
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-center">
                      <div className="font-medium">{c.bidsCount || 0}</div>
                      {c.highestBid > 0 && <div className="text-xs text-primary">↑₹{c.highestBid.toLocaleString("en-IN")}</div>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/crops/${c.id}`}><Eye className="w-3.5 h-3.5 mr-1" />View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
                {crops.length === 0 && !loading && (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">No crop listings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* BIDS TAB */}
        <TabsContent value="bids" className="mt-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <th className="px-4 py-3">Bid ID</th>
                  <th className="px-4 py-3">Crop</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allBids.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{b.id?.slice(0, 12)}...</td>
                    <td className="px-4 py-3 font-medium max-w-[160px] truncate">{b.cropTitle || b.cropId}</td>
                    <td className="px-4 py-3">
                      <div>{b.buyer?.name || "—"}</div>
                    </td>
                    <td className="px-4 py-3 tabular-nums font-display text-lg">
                      <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />{(b.amount || 0).toLocaleString("en-IN")}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{b.message || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={b.status === "ACCEPTED" ? "default" : b.status === "REJECTED" ? "destructive" : "outline"}
                        className={b.status === "ACCEPTED" ? "bg-primary text-primary-foreground" : b.status === "PENDING" ? "bg-amber-100 text-amber-800 border-amber-300" : ""}
                      >
                        {b.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "—"}</div>
                    </td>
                  </tr>
                ))}
                {allBids.length === 0 && !loading && (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">No bids found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* SETTINGS TAB */}
        <TabsContent value="settings" className="mt-6">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-xl">
            <div className="flex items-center gap-2 text-primary">
              <SettingsIcon className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.22em] font-semibold">Bidding controls</span>
            </div>
            <h3 className="mt-2 font-display text-2xl">Default bidding duration</h3>
            <p className="text-sm text-muted-foreground mt-1">Applied to every new crop listing where bidding is enabled.</p>
            <div className="mt-5 flex items-end gap-3 max-w-sm">
              <div className="flex-1">
                <Label htmlFor="duration">{t("dash.bidding_duration")}</Label>
                <Input id="duration" type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1.5 h-11" data-testid="duration-input" />
              </div>
              <Button onClick={saveDuration} disabled={savingDur} className="h-11" data-testid="duration-save">
                <Save className="w-4 h-4 mr-1.5" /> {t("dash.save")}
              </Button>
            </div>
          </div>

          {/* Platform Summary */}
          <div className="mt-6 bg-card border border-border rounded-2xl p-6 max-w-xl">
            <div className="flex items-center gap-2 text-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs uppercase tracking-[0.22em] font-semibold">Platform Summary</span>
            </div>
            {stats && (
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Farmers</p>
                  <p className="font-display text-2xl mt-1">{stats.farmers || 0}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Buyers</p>
                  <p className="font-display text-2xl mt-1">{stats.buyers || 0}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Active Listings</p>
                  <p className="font-display text-2xl mt-1">{stats.openCrops || 0}</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-3">
                  <p className="text-muted-foreground text-xs">Completed Sales</p>
                  <p className="font-display text-2xl mt-1">{stats.soldCrops || 0}</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
