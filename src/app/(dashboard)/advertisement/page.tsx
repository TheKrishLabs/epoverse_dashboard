"use client";

import { useState, useEffect } from "react";
import { Plus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createColumns } from "./columns";
import { advertisementService, Advertisement } from "@/services/advertisement-service";
import { AdFormDialog } from "@/components/advertisements/ad-form-dialog";

export default function AdsListPage() {
  const [data, setData] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null);

  const fetchAds = async () => {
    setIsLoading(true);
    try {
      const ads = await advertisementService.getAds();
      setData(ads);
    } catch (error) {
      console.error("Failed to load ads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setSelectedAd(ad);
    setIsDialogOpen(true);
  };

  const columns = createColumns(handleEdit, fetchAds);

  useEffect(() => {
    fetchAds();
  }, []);

  const handleExportCSV = () => {
    const headers = ["SI", "Theme", "Page", "Ads Position", "Language", "Status"];
    const rows = data.map((ad, index) => [
      index + 1,
      ad.theme,
      ad.page,
      ad.position,
      ad.language,
      ad.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "ads_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
     alert("Excel export not implemented in this demo.");
  };

  return (
    <div className="p-6 space-y-6 bg-[#f8f9fa] min-h-screen">
      <div className="flex justify-between items-center bg-white p-4 rounded-sm border border-gray-100 shadow-sm">
        <h1 className="text-[20px] font-medium text-gray-800">Ads list</h1>
        <Button 
          onClick={() => {
            setSelectedAd(null);
            setIsDialogOpen(true);
          }}
          className="bg-[#198754] hover:bg-[#157347] text-white rounded-[3px] gap-2"
        >
          <Plus className="h-4 w-4" />
          New advertise
        </Button>
      </div>

      <div className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm">
        <div className="flex justify-center mb-6">
           <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                className="bg-[#198754] hover:bg-[#157347] text-white border-none rounded-[3px] h-8 px-3 gap-1"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportExcel}
                className="bg-[#198754] hover:bg-[#157347] text-white border-none rounded-[3px] h-8 px-3 gap-1"
              >
                <Download className="h-3.5 w-3.5" /> Excel
              </Button>
           </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <DataTable columns={columns} data={data} />
        )}
      </div>

      <AdFormDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        initialData={selectedAd}
        onSuccess={fetchAds}
      />
    </div>
  );
}
